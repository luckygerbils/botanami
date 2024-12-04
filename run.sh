#!/bin/bash
set -euo pipefail
if [ -n "${DEBUG:-}" ]; then set -x; fi
BASE_DIR=$(realpath "$(dirname "$0")")

private:log() { printf "%s\n" "$@" >&2; }

task:help() {
    #/ print descriptions of all tasks
    private:log "$0 <task> [[args]]"
    private:log "Tasks:"
    for function in $(compgen -A function | grep '^task:'); do
        echo "$function" | sed 's/^/    /'
        awk --assign fstart="$function()" '
            $0 ~ fstart { p=1 }
            $0 ~ /}/ { p=0 }
            $0 ~ /#\// && p { print }
        ' "$0" | sed 's,#/,    ,'
    done
}

aws() { docker run --rm -v ~/.aws:/root/.aws public.ecr.aws/aws-cli/aws-cli "$@"; }

sso_login() {
    #/ log in to AWS if necessary
    aws --profile AdministratorAccess sso login
}

with:node() {
    #/ re-run the calling function in a Node docker container
    #local CALLER="${FUNCNAME[1]}"
    #if ${CI:-false} || type -ft >/dev/null node; then return; fi
    docker run -it --rm \
        -v "$BASE_DIR:/usr/src/app" \
        --env NPM_CONFIG_UPDATE_NOTIFIER=false \
        -w /usr/src/app/$(realpath --relative-to=$BASE_DIR .) \
        -u node \
        "${DOCKER_ARGS[@]}" \
        docker.io/library/node:20 "$0" "$@"
}

# node() { with:node "$@"; command node "$@"; }
# npx() { with:node "$@"; command npx "$@"; }

in:website() { ( cd website && "$0" "$@" ) }
in:lambda() { ( cd lambda && "$0" "$@" ) }
in:cdk() { cdk/run.sh in:cdk "$@"; }


# Development

DEV_HOSTNAME=dev.plants.anasta.si
CERT_DIR=/home/sanasta/credentials/certificates/$DEV_HOSTNAME/config/live/$DEV_HOSTNAME
DEV_HTTPS_KEY=$CERT_DIR/privkey.pem
DEV_HTTPS_CERT=$CERT_DIR/fullchain.pem

task:dev() {
    #/ run the local dev server
    tmux \
        new-session  "$0" private:lambda:dev \; \
        split-window "$0" private:website:dev \;
}

cdk() { cdk/run.sh cdk "$@"; }

ci:synth() {
    DEBUG=1 cdk/run.sh ci:synth
}

task:register-dns() {
    #/ register DEV_HOSTNAME as an A record pointing to this machine's local network IP
    LOCAL_IP=$(ip -json -family inet addr | jq -r 'map(select(.ifname != "lo" and (.ifname | test("^docker") | not))) | .[0].addr_info[0].local')
    if [ $(dig +short "$DEV_HOSTNAME") != "$LOCAL_IP" ]; then
        dev/register-dns.sh A "${DEV_HOSTNAME}" "$LOCAL_IP"
    fi
}

private:lambda:dev() {
    LAMBDA_DEV_PORT=8080
    DOCKER_ARGS=(
        -p 0.0.0.0:$LAMBDA_DEV_PORT:$LAMBDA_DEV_PORT
    )
    with:node "$@"
    in:lambda npm run dev -- --port=$LAMBDA_DEV_PORT
}

private:website:dev() {
    WEBSITE_DEV_PORT=8443
    DOCKER_ARGS=(
        -p 0.0.0.0:$WEBSITE_DEV_PORT:$WEBSITE_DEV_PORT
        --add-host=host.docker.internal:host-gateway
        -v "$DEV_HTTPS_KEY:$DEV_HTTPS_KEY"
        -v "$DEV_HTTPS_CERT:$DEV_HTTPS_CERT"

    )
    with:node "$@"
    in:website npm run dev -- \
        --port "$WEBSITE_DEV_PORT" \
        --cert "$DEV_HTTPS_CERT" \
        --key "$DEV_HTTPS_KEY"
}

"${@:-help}"