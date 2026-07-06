#[cfg(target_arch = "wasm32")]
fn main() {
    dioxus::launch(liroxnotes_app::App);
}

#[cfg(not(target_arch = "wasm32"))]
fn main() {
    // ponytail: dx serves the wasm app; the native bin only exists so cargo metadata stays simple.
    println!("Run this app with: dx serve --platform web --package liroxnotes-app");
}
