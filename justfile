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
        dx serve --port {{port}} --platform web --package liroxnotes-app --open true
    else
        dx serve --port {{port}} --platform server --package liroxnotes-app \
            --features server --open false
    fi

# Run the desktop app: the web client plus an embedded server, in a native
# window. dx builds the desktop crate as the "server" so the client's asset
# paths are patched into it.
desktop:
    dx build -p liroxnotes-app @client --web @server -p liroxnotes-desktop --server
    target/dx/liroxnotes-app/debug/web/server

# Build dist/desktop/LiroxNotes.app (macOS); pass --dmg for a disk image too.
desktop-bundle *args:
    crates/desktop/bundle.sh {{args}}

# Regenerate crates/desktop/icon/LiroxNotes.icns from icon.svg (needs
# ImageMagick and macOS iconutil).
desktop-icon:
    #!/bin/sh
    set -eu
    dir=$(mktemp -d)/LiroxNotes.iconset
    mkdir -p "$dir"
    for size in 16 32 128 256 512; do
        magick -background none -density 288 crates/desktop/icon/icon.svg \
            -resize "${size}x${size}" "$dir/icon_${size}x${size}.png"
        double=$((size * 2))
        magick -background none -density 288 crates/desktop/icon/icon.svg \
            -resize "${double}x${double}" "$dir/icon_${size}x${size}@2x.png"
    done
    iconutil -c icns "$dir" -o crates/desktop/icon/LiroxNotes.icns

# Build the distroless server image (docker or podman).
image tag="lirox-notes:dev" engine="docker":
    {{engine}} build -t {{tag}} .

# Run the image on http://localhost:{{port}} with named volumes.
image-run tag="lirox-notes:dev" port="8080" engine="docker":
    {{engine}} run --rm -p {{port}}:8080 \
        -v lirox-config:/config -v lirox-data:/data \
        {{tag}}
