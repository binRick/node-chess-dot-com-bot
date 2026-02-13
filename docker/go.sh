#!/usr/bin/env bash
set -eou pipefail
docker-compose down
[[ -d logs ]] && rm -rf logs/*
#mkdir logs
#chmod 777 logs
docker-compose up --build --force-recreate
