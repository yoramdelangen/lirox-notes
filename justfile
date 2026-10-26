dev port="8989" platform="web":
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

    if [ "{{platform}}" != "web" ] && [ "{{platform}}" != "desktop" ]; then
        printf '%s\n' "platform must be web or desktop" >&2
        exit 1
    fi

    window_id=$(tmux display-message -p '#{window_id}')
    server_pane=$(tmux display-message -p '#{pane_id}')
    client_pane=
    editor_pane=
    key_bound=0

    cleanup() {
        trap - EXIT INT TERM
        if [ "$key_bound" -eq 1 ]; then
            tmux unbind-key -T root C-c 2>/dev/null || true
        fi
        for pane in "$client_pane" "$editor_pane"; do
            if [ -n "$pane" ]; then
                tmux kill-pane -t "$pane" 2>/dev/null || true
            fi
        done
    }

    trap cleanup EXIT
    trap 'exit 130' INT
    trap 'exit 143' TERM

    tmux select-pane -t "$server_pane" -T dioxus-server

    editor_pane=$(tmux split-window -h -t "$server_pane" -P -F '#{pane_id}' \
        "cd packages/editor && exec bun run dev-live")

    if [ "{{platform}}" = "desktop" ]; then
        client_pane=$(tmux split-window -v -t "$server_pane" -P -F '#{pane_id}' \
            "env LIROX_SERVER_URL=http://localhost:{{port}} dx serve --platform desktop --package liroxnotes-app --features desktop --open false")
        tmux select-pane -t "$client_pane" -T desktop-client
    fi

    tmux select-pane -t "$server_pane" -T dioxus-server
    tmux select-pane -t "$editor_pane" -T editor
    tmux set-option -w -t "$window_id" pane-border-status top
    tmux set-option -w -t "$window_id" pane-border-format ' #{pane_index}: #{pane_title} '

    # tmux key bindings are global, so only intercept C-c in this window.
    tmux bind-key -T root C-c if-shell \
        -F "#{==:#{window_id},$window_id}" \
        "send-keys -t $server_pane C-c" \
        "send-keys C-c"
    key_bound=1

    if [ "{{platform}}" = "web" ]; then
        env LIROX_RP_ORIGIN="${LIROX_RP_ORIGIN:-http://localhost:{{port}}}" \
            dx serve --port {{port}} --platform web --package liroxnotes-app --open true
    else
        env LIROX_RP_ORIGIN="${LIROX_RP_ORIGIN:-http://localhost:{{port}}}" \
            dx serve --port {{port}} --platform server --package liroxnotes-app \
            --features server --open false
    fi
