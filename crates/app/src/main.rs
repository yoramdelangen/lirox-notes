#[cfg(target_arch = "wasm32")]
fn main() {
    dioxus::launch(liroxnotes_app::App);
}

#[cfg(not(target_arch = "wasm32"))]
fn main() {
    println!("Run the integrated app with: cargo run -p liroxnotes-gateway");
}
