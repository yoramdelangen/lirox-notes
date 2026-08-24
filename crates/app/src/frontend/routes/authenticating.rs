use dioxus::prelude::*;

#[component]
pub(crate) fn AuthenticatingRoute(message: String) -> Element {
    rsx! {
        section { class: "mt-3 space-y-4",
            h1 { class: "text-3xl font-semibold", "Checking session" }
            p { class: "text-sm text-theme-muted", if message.is_empty() { "Checking the gateway session..." } else { "{message}" } }
        }
    }
}
