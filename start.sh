#!/usr/bin/env bash
set -euo pipefail

# Railway injects PORT. Locally fallback to 3000.
export PORT="${PORT:-3000}"

# Optional: fail fast if key missing (Railway Variables -> OPENAI_API_KEY)
: "${OPENAI_API_KEY:?OPENAI_API_KEY is not set}"

# Start
exec node server.mjs