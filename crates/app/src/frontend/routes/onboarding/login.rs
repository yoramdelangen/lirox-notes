use dioxus::prelude::*;

#[component]
pub(crate) fn LoginRoute(
    message: String,
    user: String,
    password: String,
    auth_mode: String,
    on_user: EventHandler<String>,
    on_password: EventHandler<String>,
    on_login: EventHandler<()>,
) -> Element {
    rsx! {
        section { class: "mt-3 max-w-xl",
            h1 { class: "text-3xl font-semibold", "Log in" }
            p { class: "section-copy", "Use a local session to continue." }
            form { class: "mt-6 space-y-4", onsubmit: move |event| { event.prevent_default(); on_login.call(()); },
                label { class: "field-label",
                    "Name"
                    input { class: "field-input", value: "{user}", autocomplete: "username", oninput: move |event| on_user.call(event.value()) }
                }
                if auth_mode == "password" {
                    label { class: "field-label",
                        "Password"
                        input { r#type: "password", class: "field-input", value: "{password}", autocomplete: "current-password", oninput: move |event| on_password.call(event.value()) }
                    }
                }
                if !message.is_empty() {
                    p { class: "warning-banner", "{message}" }
                }
                button { class: "primary-button", type: "submit", "Continue" }
            }
        }
    }
}
