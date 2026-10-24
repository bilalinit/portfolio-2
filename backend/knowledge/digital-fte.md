# TechFlow Customer Success Digital FTE

MIZU's TechFlow project is also called CRM Digital FTE or CRM-Digital-FTE.
Digital FTE means Full-Time Equivalent: here, a software support employee
that automates parts of customer-success work and escalates cases to humans.
It is separate from Atlas, which is the tool used to visualise its architecture.

## Links

- Repository: https://github.com/AhmedSaeed4/CRM-Digital-FTE/
- MIZU project page: /work/digital-fte
- Workflow map: https://atlas-app-3el.pages.dev/workspace?view=MUwNPd2D-ryo2dWUP3a0cw

The map is a read-only Atlas viewer of TechFlow, verified with 36 components
and 81 connections. The same map illustrates Atlas on its project page.
It is not a live customer-support endpoint. No public support-app URL is supplied.

## What it does

Gmail, Twilio WhatsApp and a Next.js web support form feed a shared workflow.
PostgreSQL holds customer, ticket and interaction history across channels.
Responses follow channel-specific tone and formatting. Three specialist agents
handle triage, support and escalation using the OpenAI Agents SDK.
Triage retrieves context and routes requests; support uses knowledge-base and
ticket tools; escalation records requests for human attention. Do not imply
that a human has already responded simply because an agent escalated a ticket.

Input and output checks combine keyword checks and LLM review. These are
guardrails, not a guarantee that every unsafe or incorrect response is caught.

## Architecture

FastAPI and Uvicorn accept support requests and channel notifications.
Kafka queues events for a separate message-processing worker. Database polling
can provide a fallback when Kafka is unavailable. A separate metrics worker
collects operational information. PostgreSQL uses asyncpg connection pools
scoped to event loops; synchronous Kafka publishing runs in a background thread.

The Next.js 16 / React 19 / Tailwind CSS 4 support form uses an ink-and-cream
design. Docker and Kubernetes manifests include separate API and worker
autoscaling configurations. The supplied README documents a Minikube deployment,
not a guaranteed public production service or uptime SLA.

The README lists pgvector in the database stack. The observed example graph
describes knowledge-base title/content lookup with ILIKE; do not claim every
lookup uses embeddings or semantic vector search.

## Setup

The supplied README lists Python 3.13+, Node.js 22+, Docker/Compose and uv.
From production/, start database, Kafka and ZooKeeper with Docker Compose,
configure environment variables, start the FastAPI API with uv, and run the
message processor separately. Start the Next.js web form from production/web-form.
See the repository's deployment guide for complete commands and configuration.

An OpenAI-compatible model provider, model name and API key, plus database
configuration, are needed. The documented model is Kimi K2.5 via DashScope,
with other OpenAI-compatible providers configurable. Gmail requires OAuth
credentials and a token; WhatsApp requires Twilio credentials. Channels can
be configured independently. Never request that visitors paste secret keys
into Nami or promise free model/channel usage.

## Accurate claims

The project includes pytest and Locust tests; the README reports 49 passing
tests and a 309-request load run. These are reported project checks, not a
newly verified production benchmark, support-response latency, or availability
guarantee. Do not turn the README's salary/cost comparisons into proven savings,
claim it replaces every human role, or quote a MIZU price from those figures.
For deployment requirements or commercial enquiries, direct visitors to MIZU.
