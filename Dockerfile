# syntax=docker/dockerfile:1
#
# Static LiroxNotes server on distroless. Stages:
#   builder  – compiles the musl-static server and the web client (dx bundle)
#   artifact – just /server and /public, for `--output type=local`
#   runtime  – distroless/static:nonroot image (default)

FROM docker.io/library/rust:1.91-alpine@sha256:45c1c35cd364b8055e9e86f8ecd3e8c874b2dcb658d8a4f94b5d111aa0d651a2 AS builder

RUN apk add --no-cache musl-dev perl make file pkgconf openssl-dev openssl-libs-static binaryen esbuild
RUN rustup target add wasm32-unknown-unknown
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    cargo install dioxus-cli --version 0.7.10 --locked

WORKDIR /src
# dx would download glibc tool binaries that cannot run on musl. With
# NO_DOWNLOADS it uses tools from PATH: wasm-bindgen built at the exact
# version the lockfile pins, plus wasm-opt and esbuild from Alpine.
ENV NO_DOWNLOADS=1
COPY Cargo.lock .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    version=$(grep -A1 '^name = "wasm-bindgen"$' Cargo.lock | sed -n 's/^version = "\(.*\)"$/\1/p') \
    && cargo install wasm-bindgen-cli --version "$version" --locked

COPY . .

# The musl target links statically by default; vendored libgit2, libssh2 and
# OpenSSL come from the app's `static` feature.
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/src/target \
    dx bundle --release -p liroxnotes-app --out-dir /out \
        @client --web \
        @server --server --features static \
    && file /out/server | grep -q 'static' \
    && mkdir -p /out/config /out/data

FROM scratch AS artifact
COPY --from=builder /out/server /server
COPY --from=builder /out/public /public

FROM gcr.io/distroless/static:nonroot@sha256:25ac8f0c3b2334a9eb05452266bd4697864a8c8ef0ef71e5e6480d7f92868329 AS runtime

ARG VERSION=dev
LABEL org.opencontainers.image.title="LiroxNotes" \
      org.opencontainers.image.description="Keyboard-first notes workbench (server)" \
      org.opencontainers.image.source="https://github.com/yoramdelangen/lirox-notes" \
      org.opencontainers.image.version="${VERSION}"

COPY --from=builder --chown=65532:65532 /out/server /app/server
COPY --from=builder --chown=65532:65532 /out/public /app/public
COPY --from=builder --chown=65532:65532 /out/config /config
COPY --from=builder --chown=65532:65532 /out/data /data

ENV IP=0.0.0.0 \
    PORT=8080 \
    LIROX_CONFIG_FILE=/config/config \
    LIROX_APP_CONFIG=/config/config.toml \
    LIROX_WORKSPACE_DIR=/data/workspace

USER 65532:65532
WORKDIR /app
EXPOSE 8080
VOLUME ["/config", "/data"]
ENTRYPOINT ["/app/server"]
