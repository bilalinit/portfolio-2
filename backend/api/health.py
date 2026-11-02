"""Vercel entry point for GET /health.

The Python runtime hands the app a rewritten path, so each endpoint gets
its own function that pins the public path FastAPI's router expects.
"""

from pathlib import Path
import sys

# make the project root importable regardless of where the runtime puts
# the bundle on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from main import app as fastapi_app  # noqa: E402


class FixedPath:
    """ASGI wrapper that forces scope["path"] so FastAPI routes match."""

    def __init__(self, asgi_app, path: str):
        self._asgi_app = asgi_app
        self._path = path

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            scope = dict(scope, path=self._path, raw_path=self._path.encode())
        await self._asgi_app(scope, receive, send)


app = FixedPath(fastapi_app, "/health")
handler = app
