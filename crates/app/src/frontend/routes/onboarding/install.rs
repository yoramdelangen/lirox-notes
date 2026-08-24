use dioxus::prelude::*;

#[component]
pub(crate) fn InstallRoute(
    message: String,
    user: String,
    password: String,
    auth_mode: String,
    workspace_path: String,
    on_install: EventHandler<()>,
    on_user: EventHandler<String>,
    on_password: EventHandler<String>,
    on_auth_mode: EventHandler<String>,
    on_workspace_path: EventHandler<String>,
) -> Element {
    rsx! {
        section { class: "mt-3 max-w-xl",
            h1 { class: "text-3xl font-semibold", "Install LiroxNotes" }
            p { class: "section-copy", "Configure the application root, create the first user, then continue to workspace setup." }
            div { class: "mt-6 space-y-4",
                label { class: "field-label",
                    "Workspace root"
                    input { class: "field-input", value: "{workspace_path}", oninput: move |event| on_workspace_path.call(event.value()) }
                }
                label { class: "field-label",
                    "Username"
                    input { class: "field-input", value: "{user}", autocomplete: "username", oninput: move |event| on_user.call(event.value()) }
                }
                fieldset { class: "choice-group",
                    legend { class: "choice-legend", "Login method" }
                    label { class: "choice-option",
                        input { r#type: "radio", name: "auth_mode", checked: auth_mode == "passwordless", onchange: move |_| on_auth_mode.call("passwordless".to_string()) }
                        span { "Passwordless for now" }
                    }
                    label { class: "choice-option",
                        input { r#type: "radio", name: "auth_mode", checked: auth_mode == "password", onchange: move |_| on_auth_mode.call("password".to_string()) }
                        span { "Use a password" }
                    }
                }
                if auth_mode == "password" {
                    label { class: "field-label",
                        "Password"
                        input { r#type: "password", class: "field-input", value: "{password}", autocomplete: "new-password", oninput: move |event| on_password.call(event.value()) }
                    }
                }
            }
            if !message.is_empty() {
                p { class: "warning-banner mt-4", "{message}" }
            }
            button { class: "primary-button mt-6", type: "button", onclick: move |_| on_install.call(()), "Install" }
        }
    }
}
