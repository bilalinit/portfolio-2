"""Bounded per-process chat admission; Vercel Firewall provides edge limits."""

import asyncio
import ipaddress
import math
import os
import time
import uuid
from collections import OrderedDict, deque

from starlette.requests import Request as ASGIRequest
from starlette.responses import JSONResponse

MAX_BODY_BYTES = 64 * 1024
RUN_TIMEOUT = 40
LEASE_SECONDS = RUN_TIMEOUT + 15


def positive_env(name: str, default: int) -> int:
    value = int(os.getenv(name, str(default)))
    if value < 1:
        raise ValueError(f"{name} must be positive")
    return value


class LimitExceeded(Exception):
    def __init__(self, retry: float, window: str):
        self.retry = max(1, math.ceil(retry))
        self.window = window


def client_ip(request: ASGIRequest) -> str:
    # Vercel overwrites X-Forwarded-For. Never trust it on a direct server.
    value = request.client.host if request.client else "unknown"
    if os.getenv("VERCEL") == "1":
        value = request.headers.get("x-forwarded-for", "")
    try:
        return str(ipaddress.ip_address(value.strip()))
    except ValueError:
        # Invalid/missing metadata shares a bucket, rather than creating keys.
        return "unknown"


class ChatLimiter:
    def __init__(self):
        self.minute = positive_env("RATE_LIMIT_PER_MINUTE", 5)
        self.hour = positive_env("RATE_LIMIT_PER_HOUR", 15)
        self.global_hour = positive_env("GLOBAL_RATE_LIMIT_PER_HOUR", 100)
        self.concurrent = positive_env("MAX_CONCURRENT_RUNS", 3)
        self.hits: OrderedDict[str, deque[float]] = OrderedDict()
        self.global_hits: deque[float] = deque()
        self.active: dict[str, float] = {}
        self.lock = asyncio.Lock()

    async def acquire(self, ip: str) -> str:
        member = uuid.uuid4().hex
        async with self.lock:
            now = time.monotonic()
            # Entries are ordered by last accepted request. Bound both age and size.
            while self.hits and next(iter(self.hits.values()))[-1] <= now - 3600:
                self.hits.popitem(last=False)
            while self.global_hits and self.global_hits[0] <= now - 3600:
                self.global_hits.popleft()
            self.active = {k: expiry for k, expiry in self.active.items() if expiry > now}
            hits = self.hits.get(ip, deque())
            while hits and hits[0] <= now - 3600:
                hits.popleft()
            recent = [stamp for stamp in hits if stamp > now - 60]
            if len(hits) >= self.hour:
                raise LimitExceeded(hits[0] + 3600 - now, "hour")
            if len(recent) >= self.minute:
                raise LimitExceeded(recent[0] + 60 - now, "minute")
            if len(self.global_hits) >= self.global_hour:
                raise LimitExceeded(self.global_hits[0] + 3600 - now, "global")
            if len(self.active) >= self.concurrent:
                raise LimitExceeded(min(self.active.values()) - now, "busy")
            if ip not in self.hits and len(self.hits) >= 10000:
                raise LimitExceeded(60, "busy")
            hits.append(now)
            self.hits[ip] = hits
            self.hits.move_to_end(ip)
            self.global_hits.append(now)
            self.active[member] = now + LEASE_SECONDS
        return member

    async def release(self, member: str):
        async with self.lock:
            self.active.pop(member, None)


class RequestProtection:
    def __init__(self, app, limiter: ChatLimiter, origins: list[str]):
        self.app, self.limiter, self.origins = app, limiter, origins

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["method"] != "POST" or scope["path"] not in {"/api/agent", "/api/agent/stream"}:
            return await self.app(scope, receive, send)
        request = ASGIRequest(scope)
        async def reject(status, message, headers=None):
            await JSONResponse(status_code=status, content={"detail": message}, headers=headers)(scope, receive, send)
        origin = request.headers.get("origin")
        if origin is not None and origin not in self.origins:
            return await reject(403, "Origin is not allowed")
        if request.headers.get("content-type", "").split(";")[0].strip().lower() != "application/json":
            return await reject(415, "Use application/json")
        try:
            length = int(request.headers.get("content-length", "0"))
            if length < 0 or length > MAX_BODY_BYTES:
                return await reject(413, "Request is too large")
        except ValueError:
            return await reject(400, "Invalid Content-Length")
        try:
            member = await self.limiter.acquire(client_ip(request))
        except LimitExceeded as exc:
            response = JSONResponse(status_code=429, headers={"Retry-After": str(exc.retry)}, content={
                "error": "rate_limited", "retryAfter": exc.retry, "window": exc.window,
            })
            return await response(scope, receive, send)
        except Exception:
            return await reject(503, "Chat is temporarily unavailable")
        try:
            body = bytearray()
            async with asyncio.timeout(5):
                while True:
                    chunk = await receive()
                    if chunk["type"] == "http.disconnect":
                        return
                    body.extend(chunk.get("body", b""))
                    if len(body) > MAX_BODY_BYTES:
                        return await reject(413, "Request is too large")
                    if not chunk.get("more_body", False):
                        break
            delivered = False
            async def bounded_receive():
                nonlocal delivered
                if not delivered:
                    delivered = True
                    return {"type": "http.request", "body": bytes(body), "more_body": False}
                return await receive()
            await self.app(scope, bounded_receive, send)
        except TimeoutError:
            await reject(408, "Request body timed out")
        finally:
            try:
                await self.limiter.release(member)
            except Exception:
                # Leases also expire if request cancellation interrupts cleanup.
                pass
