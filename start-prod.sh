#!/usr/bin/env bash
set -euo pipefail
export NVM_DIR=/root/.nvm
. "$NVM_DIR/nvm.sh"
nvm use 24.16.0 >/dev/null
export NODE_ENV=production
export PORT=3001
cd /root/apps/twizz-project
exec npm run start

