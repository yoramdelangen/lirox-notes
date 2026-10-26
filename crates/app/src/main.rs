fn main() {
    #[cfg(all(not(feature = "server"), any(feature = "desktop", feature = "web")))]
    if let Some(server_url) = option_env!("LIROX_SERVER_URL") {
        dioxus::fullstack::set_server_url(server_url);
    }

    #[cfg(feature = "server")]
    dioxus::LaunchBuilder::server().launch(liroxnotes_app::App);

    #[cfg(all(not(feature = "server"), feature = "desktop"))]
    dioxus::LaunchBuilder::desktop().launch(liroxnotes_app::App);

    #[cfg(all(not(feature = "server"), not(feature = "desktop")))]
    dioxus::LaunchBuilder::web().launch(liroxnotes_app::App);
}
