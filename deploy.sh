#!/usr/bin/env bash
# QuickQuest deploy: commit (optional) → push → git pull on the Foundry server.
#
# Usage:
#   ./deploy.sh "commit message"   # stage everything, commit, push, pull on server
#   ./deploy.sh                    # tree must be clean; push + pull only
#
# Configure once: edit the two placeholders below, or export
#   QQ_SERVER_HOST=user@ttrpg.example  QQ_SERVER_PATH=/srv/foundry/Data/systems/quickquest
set -euo pipefail

SERVER_HOST="${QQ_SERVER_HOST:-user@your-server.example}"                        # <- placeholder
SERVER_PATH="${QQ_SERVER_PATH:-/path/to/foundry-data/Data/systems/quickquest}"   # <- placeholder
BRANCH="main"

cd "$(dirname "$0")"

die() { echo "deploy: $*" >&2; exit 1; }

case "$SERVER_HOST" in
  *example*) die "SERVER_HOST is still the placeholder. Edit deploy.sh or export QQ_SERVER_HOST." ;;
esac
case "$SERVER_PATH" in
  /path/to/*) die "SERVER_PATH is still the placeholder. Edit deploy.sh or export QQ_SERVER_PATH." ;;
esac

current="$(git rev-parse --abbrev-ref HEAD)"
[ "$current" = "$BRANCH" ] || die "on branch '$current', expected '$BRANCH'."

if [ -n "$(git status --porcelain)" ]; then
  [ $# -ge 1 ] || die "working tree is dirty. Pass a commit message, or commit/stash first."
  git add -A
  git commit -m "$1"
fi

git fetch origin "$BRANCH"
before="$(git rev-parse "origin/$BRANCH")"
git push origin "$BRANCH"

echo "deploy: pulling on $SERVER_HOST:$SERVER_PATH"
ssh "$SERVER_HOST" "cd '$SERVER_PATH' && git pull --ff-only"

if git diff --name-only "$before" HEAD | grep -qx 'system.json'; then
  echo "deploy: system.json changed → Return to Setup and relaunch the world."
else
  echo "deploy: done — press F5 in the browser."
fi
