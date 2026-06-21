#!/usr/bin/env sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT="$ROOT/docker/list-users.js"

if [ ! -f "$SCRIPT" ]; then
  echo "Missing $SCRIPT" >&2
  exit 1
fi

cd "$ROOT"
docker compose exec -T mongodb mongosh matchday --quiet --file /dev/stdin < "$SCRIPT"
