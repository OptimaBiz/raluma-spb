#!/usr/bin/env bash
set -euo pipefail

FILE="index.html"

check_pattern() {
  local pattern="$1"

  if ! grep -qiF "$pattern" "$FILE"; then
    echo "[lint-check] Missing pattern '$pattern' in $FILE"
    exit 1
  fi
}

check_pattern "<!DOCTYPE html>"
check_pattern "<html"
check_pattern "<head"
check_pattern "<body"

echo "[lint-check] OK"
