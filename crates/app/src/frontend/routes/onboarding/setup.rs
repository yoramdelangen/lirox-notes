use dioxus::prelude::*;

#[component]
pub(crate) fn SetupRoute(
    message: String,
    repo_mode: String,
    workspace_slug: String,
    workspace_name: String,
    clone_target: String,
    repo_url: String,
    branch: String,
    on_repo_mode: EventHandler<String>,
    on_workspace_slug: EventHandler<String>,
    on_workspace_name: EventHandler<String>,
    on_repo_url: EventHandler<String>,
    on_branch: EventHandler<String>,
    on_setup: EventHandler<()>,
) -> Element {
    rsx! {
        section { class: "mt-3 max-w-2xl",
            h1 { class: "text-3xl font-semibold", "Set up workspace" }
            p { class: "section-copy", "Choose whether to clone an existing remote or create a new local repository." }
            form { class: "mt-6 grid gap-4", onsubmit: move |event| { event.prevent_default(); on_setup.call(()); },
                fieldset { class: "choice-group",
                    legend { class: "choice-legend", "Repository source" }
                    label { class: "choice-option",
                        input { r#type: "radio", name: "repo_mode", checked: repo_mode == "new", onchange: move |_| on_repo_mode.call("new".to_string()) }
                        span { "Create new repository" }
                    }
                    label { class: "choice-option",
                        input { r#type: "radio", name: "repo_mode", checked: repo_mode == "remote", onchange: move |_| on_repo_mode.call("remote".to_string()) }
                        span { "Use existing remote" }
                    }
                }
                label { class: "field-label",
                    "Workspace slug"
                    input { class: "field-input", value: "{workspace_slug}", placeholder: "notes", oninput: move |event| on_workspace_slug.call(event.value()) }
                }
                label { class: "field-label",
                    "Workspace name"
                    input { class: "field-input", value: "{workspace_name}", oninput: move |event| on_workspace_name.call(event.value()) }
                }
                p { class: "text-sm text-theme-subtle", if repo_mode == "remote" { "Clone target: {clone_target}" } else { "Repository path: {clone_target}" } }
                if repo_mode == "remote" {
                    label { class: "field-label",
                        "Git remote URL"
                        input { class: "field-input", value: "{repo_url}", placeholder: "git@github.com:you/notes.git", oninput: move |event| on_repo_url.call(event.value()) }
                    }
                }
                label { class: "field-label",
                    "Branch"
                    input { class: "field-input", value: "{branch}", oninput: move |event| on_branch.call(event.value()) }
                }
                if !message.is_empty() {
                    p { class: "warning-banner", "{message}" }
                }
                button { class: "primary-button w-fit", type: "submit", "Create workspace" }
            }
        }
    }
}
