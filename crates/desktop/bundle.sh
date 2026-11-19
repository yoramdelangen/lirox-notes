#!/bin/sh
# Builds LiroxNotes.app, and with --dmg also a drag-to-Applications disk
# image, into OUT_DIR (default dist/desktop). Run from the repository root.
#
#   crates/desktop/bundle.sh [--dmg] [OUT_DIR]
#
# dx builds the desktop crate as the "server" half so the web client's asset
# paths are patched into it; libgit2 and OpenSSL are linked in statically.
set -eu

dmg=0
if [ "${1:-}" = "--dmg" ]; then
    dmg=1
    shift
fi
out=${1:-dist/desktop}

dx bundle --release -p liroxnotes-app --out-dir "$out/build" \
    @client --web \
    @server -p liroxnotes-desktop --server --features static

version=$(sed -n 's/^version = "\(.*\)".*/\1/p' Cargo.toml | head -n1)
app="$out/LiroxNotes.app"
rm -rf "$app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
cp "$out/build/server" "$app/Contents/MacOS/LiroxNotes"
cp -R "$out/build/public" "$app/Contents/Resources/public"
cp crates/desktop/icon/LiroxNotes.icns "$app/Contents/Resources/"
sed "s/@VERSION@/$version/g" crates/desktop/Info.plist > "$app/Contents/Info.plist"
# Ad-hoc signature: Apple silicon refuses to run unsigned binaries, and this
# keeps the bundle's signature consistent after the files were copied in.
codesign --force --deep --sign - "$app"
printf '%s\n' "built $app"

if [ "$dmg" -eq 1 ]; then
    arch=$(lipo -archs "$app/Contents/MacOS/LiroxNotes" | sed 's/arm64/aarch64/')
    image="$out/liroxnotes-desktop-$version-$arch-macos.dmg"
    stage=$(mktemp -d)
    cp -R "$app" "$stage/"
    ln -s /Applications "$stage/Applications"
    rm -f "$image"
    hdiutil create -volname LiroxNotes -srcfolder "$stage" -format UDZO -ov "$image" >/dev/null
    rm -rf "$stage"
    printf '%s\n' "built $image"
fi
