#!/bin/bash
set -euo pipefail
if [ -n "${DEBUG:-}" ]; then set -x; fi
die() { printf >&2 "%s" "$0"; exit 1; }

BASE_DIR=$(realpath "$(dirname "$0")/..")
AWS_PROFILE=AdministratorAccess

aws() { docker run --rm -v ~/.aws:/root/.aws public.ecr.aws/aws-cli/aws-cli "$@"; }
npm() { with:node command npm "$@"; }

cdk() {
  if [ "$2" = "deploy" ] || [ "$2" = "bootstrap" ]; then 
    aws --profile "$AWS_PROFILE" sso login
  fi
  with:node in:cdk npx cdk --profile "$AWS_PROFILE" "$@"
}

ci:synth() {
  env
  with:node in:cdk npm ci
  with:node in:cdk npx cdk synth
}

with:node() {
  if "${CI:-false}"; then
    hash node || die "expected node to exist in CI container"
    "$@"
  else
    docker run -it --rm \
        -v "$BASE_DIR:/usr/src/app" \
        -v ~/.aws:/home/node/.aws \
        --env NPM_CONFIG_UPDATE_NOTIFIER=false \
        -w /usr/src/app/$(realpath --relative-to=$BASE_DIR .) \
        -u node \
        "${DOCKER_ARGS[@]}" \
        docker.io/library/node:20 "$0" "$@"
  fi
}

in:cdk() { ( cd cdk && ./run.sh "$@" ) }

"${@:-help}"