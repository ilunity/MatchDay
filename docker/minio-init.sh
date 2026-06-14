#!/bin/sh
set -e

mc alias set local http://minio:9000 "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}"
mc mb --ignore-existing local/matchday-covers
mc anonymous set download local/matchday-covers || true
echo "MinIO bucket matchday-covers ready"
