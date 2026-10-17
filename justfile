dev port="8989":
    #!/bin/sh
    set -eu

    if ! command -v tmux >/dev/null 2>&1; then
        printf '%s\n' "just dev requires tmux; install tmux and try again" >&2
        exit 1
    fi

    if [ -z "${TMUX:-}" ]; then
        printf '%s\n' "just dev must be run inside an existing tmux window" >&2
        exit 1
    fi

    gateway_port="${LIROX_GATEWAY_PORT:-3010}"
    window_id=$(tmux display-message -p '#{window_id}')
    gateway_pane=$(tmux display-message -p '#{pane_id}')
    dioxus_pane=
    editor_pane=
    key_bound=0

    cleanup() {
        trap - EXIT INT TERM
        if [ "$key_bound" -eq 1 ]; then
            tmux unbind-key -T root C-c 2>/dev/null || true
        fi
        for pane in "$dioxus_pane" "$editor_pane"; do
            if [ -n "$pane" ]; then
                tmux kill-pane -t "$pane" 2>/dev/null || true
            fi
        done
    }

    trap cleanup EXIT
    trap 'exit 130' INT
    trap 'exit 143' TERM

    dioxus_pane=$(tmux split-window -v -t "$gateway_pane" -P -F '#{pane_id}' \
        "exec dx serve --port {{port}} --platform web --package liroxnotes-app")
    editor_pane=$(tmux split-window -h -t "$gateway_pane" -P -F '#{pane_id}' \
        "cd packages/editor && exec bun run dev-live")

    tmux select-pane -t "$gateway_pane" -T gateway
    tmux select-pane -t "$dioxus_pane" -T dioxus
    tmux select-pane -t "$editor_pane" -T editor
    tmux set-option -w -t "$window_id" pane-border-status top
    tmux set-option -w -t "$window_id" pane-border-format ' #{pane_index}: #{pane_title} '

    # tmux key bindings are global, so only intercept C-c in this window.
    tmux bind-key -T root C-c if-shell \
        -F "#{==:#{window_id},$window_id}" \
        "send-keys -t $gateway_pane C-c" \
        "send-keys C-c"
    key_bound=1

    export LIROX_RP_ORIGIN="${LIROX_RP_ORIGIN:-http://localhost:{{port}},http://localhost:3010}"
    env LIROX_DEV_CORS=1 cargo run -p liroxnotes-gateway -- --port "$gateway_port"
