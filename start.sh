#!/usr/bin/env bash
set -euo pipefail

: "${OPENAI_API_KEY:?OPENAI_API_KEY is not set}"
export PORT="${PORT:-3000}"

exec npm start