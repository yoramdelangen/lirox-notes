use crate::{
    app::AuthCommand,
    command::{CommandArgs, CommandId, CommandInvocation, CommandSource},
    components::{
        button::{Button, ButtonSize, ButtonVariant},
        menubar::{
            Menubar, MenubarContent, MenubarGroup, MenubarItem, MenubarMenu, MenubarTrigger,
        },
    },
    AppContext,
};
use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

#[component]
pub fn WorkspaceTopBar(view: WorkspaceView) -> Element {
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let dispatcher = context.dispatcher.clone();
    let tree_dispatcher = dispatcher.clone();
    let workspace_dispatcher = dispatcher.clone();
    let mut workspace_menu = use_signal(|| false);
    let workspace_options = state.read().auth.existing_workspaces.clone();

    rsx! {
        header { class: "workspace-topbar flex shrink-0 items-center gap-4 border-b border-[var(--lirox-border)] bg-[var(--lirox-bg)] px-3 py-2",
            Button {
                class: "workspace-file-tree-toggle",
                size: ButtonSize::IconSm,
                variant: ButtonVariant::Outline,
                aria_label: "Toggle file tree",
                title: "Toggle file tree",
                onclick: move |_| {
                    let mut state = state;
                    tree_dispatcher.dispatch(&mut state.write(), CommandInvocation {
                        id: CommandId::new("workspace.toggle_file_tree"),
                        args: CommandArgs::None,
                        source: CommandSource::Pointer,
                    });
                },
                svg {
                    xmlns: "http://www.w3.org/2000/svg",
                    view_box: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    stroke_width: "2",
                    stroke_linecap: "round",
                    "aria-hidden": "true",
                    path { d: "M4 6h16M4 12h16M4 18h16" }
                }
            }
            div { class: "workspace-topbar-context min-w-0 flex-1",
                div { class: "workspace-switcher-wrap",
                    Button {
                        class: "workspace-switcher",
                        size: ButtonSize::Xs,
                        variant: ButtonVariant::Outline,
                        aria_label: "Switch workspace",
                        onclick: move |_| {
                            let opening = !workspace_menu();
                            workspace_menu.set(opening);
                            if opening {
                                crate::auth::dispatch_auth(
                                    state,
                                    workspace_dispatcher.clone(),
                                    AuthCommand::LoadExistingWorkspaces,
                                );
                            }
                        },
                        "{view.name}"
                    }
                    if workspace_menu() {
                        div { class: "workspace-switcher-menu", role: "menu",
                            if workspace_options.is_empty() {
                                span { class: "workspace-switcher-empty", "No other workspaces" }
                            }
                            for workspace in workspace_options.iter() {
                                {
                                    let workspace = workspace.clone();
                                    let name = workspace
                                        .workspace_name
                                        .clone()
                                        .unwrap_or_else(|| workspace.path.clone());
                                    let option_name = name.clone();
                                    let dispatcher = dispatcher.clone();
                                    rsx! {
                                        Button {
                                            key: "{workspace.repository}:{workspace.path}",
                                            class: "workspace-option",
                                            variant: ButtonVariant::Ghost,
                                            aria_label: "Open workspace {name}",
                                            onclick: move |_| {
                                                let fields = crate::auth::SetupFields {
                                                    step: crate::auth::SetupStep::Finish,
                                                    slug: crate::auth::slug_from_name(&option_name),
                                                    name: option_name.clone(),
                                                    repo_url: String::new(),
                                                    repository_path: workspace.repository.clone(),
                                                    branch: workspace.branch.clone(),
                                                    path: workspace.path.clone(),
                                                    remote: true,
                                                };
                                                workspace_menu.set(false);
                                                dispatcher.dispatch_auth_command(
                                                    &mut state.write(),
                                                    AuthCommand::CreateWorkspace(fields),
                                                );
                                                #[cfg(target_arch = "wasm32")]
                                                {
                                                    let effect_dispatcher = dispatcher.clone();
                                                    spawn(async move {
                                                        for effect in effect_dispatcher.take_effects() {
                                                            crate::execute_effect(
                                                                state,
                                                                effect_dispatcher.clone(),
                                                                effect,
                                                            )
                                                            .await;
                                                        }
                                                    });
                                                }
                                            },
                                            "{name}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                div { class: "workspace-topbar-meta flex min-w-0 items-center gap-3 text-xs text-[var(--lirox-muted)]",
                    span { class: "truncate", "{view.branch}" }
                    span { class: "git-status", aria_label: "Git changes",
                        span { title: "Changed notes", "↑ {view.changed_notes}" }
                        span { title: "Unpushed commits", "↓ {view.unpushed_commits}" }
                    }
                }
            }
        }
    }
}

#[component]
pub fn EditorActions() -> Element {
    rsx! {
        Menubar { class: "editor-menubar border-0 bg-transparent p-2",
            MenubarMenu {
                MenubarTrigger { "Settings" }
                MenubarContent {
                    MenubarGroup {
                        MenubarItem { class: "opacity-50",
                            Button {
                                variant: ButtonVariant::Ghost,
                                disabled: true,
                                aria_label: "Settings unavailable",
                                "Settings unavailable"
                            }
                        }
                    }
                }
            }
        }
    }
}
