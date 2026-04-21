#!/usr/bin/env bash
set -euo pipefail

check_contains() {
  local file="$1"
  local pattern="$2"
  if ! rg -q "$pattern" "$file"; then
    echo "[lint-check] Missing pattern '$pattern' in $file" >&2
    exit 1
  fi
}

check_contains index.html '<!DOCTYPE html>'
check_contains index.html '<title>'
check_contains index.html 'lead-form'
check_contains thanks.html '<!DOCTYPE html>'
check_contains thanks.html 'Спасибо, заявка отправлена'

node --check assets/site-main.js
node --check playwright.config.js
node --check tests/e2e/smoke.spec.js
node --check tests/visual/visual.spec.js

echo '[lint-check] OK'
