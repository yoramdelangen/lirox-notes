//! LiroxNotes desktop: the regular server, embedded and bound to loopback,
//! behind a native window that loads the web client from it.

#[cfg(target_os = "macos")]
mod app;

fn main() {
    #[cfg(target_os = "macos")]
    app::run();

    #[cfg(not(target_os = "macos"))]
    {
        eprintln!("the LiroxNotes desktop app currently supports macOS only");
        std::process::exit(1);
    }
}
