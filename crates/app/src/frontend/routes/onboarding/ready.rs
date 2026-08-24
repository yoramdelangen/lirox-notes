use dioxus::prelude::*;

#[component]
pub(crate) fn ReadyRoute() -> Element {
    rsx! {
        section { class: "mt-3 space-y-4",
            h1 { class: "text-3xl font-semibold", "Workspace ready" }
            p { class: "text-sm text-theme-muted", "Authentication and onboarding are complete." }
        }
    }
}
