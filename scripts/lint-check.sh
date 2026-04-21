#!/usr/bin/env bash
set -euo pipefail

if ! grep -qi '<!DOCTYPE html>' index.html; then
  echo "[lint-check] Missing pattern '<!DOCTYPE html>' in index.html" >&2
  exit 1
fi

if ! grep -q '<title>' index.html; then
  echo "[lint-check] Missing pattern '<title>' in index.html" >&2
  exit 1
fi

if ! grep -q 'lead-form' index.html; then
  echo "[lint-check] Missing pattern 'lead-form' in index.html" >&2
  exit 1
fi

if ! grep -qi '<!DOCTYPE html>' thanks.html; then
  echo "[lint-check] Missing pattern '<!DOCTYPE html>' in thanks.html" >&2
  exit 1
fi

if ! grep -q 'Спасибо, заявка отправлена' thanks.html; then
  echo "[lint-check] Missing pattern 'Спасибо, заявка отправлена' in thanks.html" >&2
  exit 1
fi

node --check assets/site-main.js
node --check playwright.config.js
node --check tests/e2e/smoke.spec.js
node --check tests/visual/visual.spec.js

echo '[lint-check] OK'
