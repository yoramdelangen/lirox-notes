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

/// Runs effects queued by a menu action right away, so the switch does not
/// wait for the next render.
fn run_pending_effects(
    state: Signal<crate::app::ApplicationState>,
    dispatcher: crate::app::Dispatcher,
) {
    #[cfg(target_arch = "wasm32")]
    spawn(async move {
        for effect in dispatcher.take_effects() {
            crate::execute_effect(state, dispatcher.clone(), effect).await;
        }
    });
    #[cfg(not(target_arch = "wasm32"))]
    let _ = (state, dispatcher);
}

#[component]
pub fn WorkspaceTopBar(view: WorkspaceView, #[props(default = false)] in_sheet: bool) -> Element {
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let dispatcher = context.dispatcher.clone();
    let workspace_dispatcher = dispatcher.clone();
    let mut workspace_menu = use_signal(|| false);
    let registered = state.read().auth.registered_workspaces.clone();
    let available = state.read().auth.existing_workspaces.clone();
    let sheet_header_classes = if in_sheet {
        "!pl-14 !pt-[max(.5rem,env(safe-area-inset-top))]"
    } else {
        ""
    };

    rsx! {
        header { class: "workspace-topbar flex shrink-0 items-center gap-4 border-b border-[var(--lirox-border)] bg-[var(--lirox-bg)] px-3 py-2 {sheet_header_classes}",
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
                            if registered.is_empty() && available.is_empty() {
                                span { class: "workspace-switcher-empty", "No other workspaces" }
                            }
                            if !registered.is_empty() {
                                span { class: "workspace-switcher-section", "Workspaces" }
                            }
                            for workspace in registered.iter() {
                                {
                                    let workspace = workspace.clone();
                                    let dispatcher = dispatcher.clone();
                                    let location = if workspace.path.is_empty() {
                                        "repository root".to_string()
                                    } else {
                                        workspace.path.clone()
                                    };
                                    rsx! {
                                        Button {
                                            key: "registered:{workspace.slug}",
                                            class: "workspace-option",
                                            variant: ButtonVariant::Ghost,
                                            role: "menuitem",
                                            aria_current: if workspace.active { "true" } else { "false" },
                                            aria_label: "Switch to workspace {workspace.name}",
                                            onclick: move |_| {
                                                workspace_menu.set(false);
                                                if workspace.active {
                                                    return;
                                                }
                                                dispatcher.dispatch_auth_command(
                                                    &mut state.write(),
                                                    AuthCommand::SwitchWorkspace(workspace.slug.clone()),
                                                );
                                                run_pending_effects(state, dispatcher.clone());
                                            },
                                            span { class: "workspace-option-name", "{workspace.name}" }
                                            span { class: "workspace-option-path", "{location}" }
                                        }
                                    }
                                }
                            }
                            for (index, workspace) in available.iter().enumerate() {
                                {
                                    let workspace = workspace.clone();
                                    let dispatcher = dispatcher.clone();
                                    let starts_repository = index == 0
                                        || available[index - 1].repository != workspace.repository;
                                    let name = workspace.path.clone();
                                    let label = workspace.path.clone();
                                    let repository = workspace.repository.clone();
                                    rsx! {
                                        Fragment { key: "available:{workspace.repository}:{workspace.path}",
                                        if starts_repository {
                                            span { class: "workspace-switcher-section", "Add from {repository}" }
                                        }
                                        Button {
                                            class: "workspace-option",
                                            variant: ButtonVariant::Ghost,
                                            role: "menuitem",
                                            aria_label: "Add workspace {name}",
                                            onclick: move |_| {
                                                let fields = crate::auth::SetupFields {
                                                    step: crate::auth::SetupStep::Finish,
                                                    slug: crate::auth::slug_from_name(&name),
                                                    display_name: String::new(),
                                                    name: name.clone(),
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
                                                run_pending_effects(state, dispatcher.clone());
                                            },
                                            span { class: "workspace-option-name", "{label}" }
                                        }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if !in_sheet {
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
}

#[component]
pub fn EditorActions() -> Element {
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let dispatcher = context.dispatcher.clone();
    let save_dispatcher = dispatcher.clone();
    let vim_mode_enabled = state.read().config.editor.vim_mode_enabled;
    let vim_mode_label = if vim_mode_enabled { "On" } else { "Off" };

    rsx! {
        Button {
            class: "absolute left-2 top-2 z-40",
            size: ButtonSize::IconSm,
            variant: ButtonVariant::Outline,
            aria_label: "Toggle file tree",
            title: "Toggle file tree",
            onclick: move |_| {
                dispatcher.dispatch(&mut state.write(), CommandInvocation {
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
        Menubar { class: "editor-menubar border-0 bg-transparent p-2",
            if !vim_mode_enabled {
                Button {
                    class: "h-auto px-2 py-[2px]",
                    size: ButtonSize::Xs,
                    variant: ButtonVariant::Ghost,
                    aria_label: "Save note",
                    title: "Save note",
                    onclick: move |_| save_dispatcher.dispatch(
                        &mut state.write(),
                        CommandInvocation {
                            id: CommandId::new("editor.save"),
                            args: CommandArgs::None,
                            source: CommandSource::Pointer,
                        },
                    ),
                    "Save"
                }
            }
            MenubarMenu {
                MenubarTrigger { "Settings" }
                MenubarContent {
                    MenubarGroup {
                        MenubarItem {
                            button {
                                class: "flex w-full items-center justify-between rounded-sm px-2 py-1 text-left text-sm hover:bg-accent",
                                r#type: "button",
                                role: "switch",
                                aria_label: "Vim mode",
                                aria_checked: "{vim_mode_enabled}",
                                onclick: move |_| {
                                    let enabled = !state.read().config.editor.vim_mode_enabled;
                                    state.write().config.editor.vim_mode_enabled = enabled;
                                    set_editor_vim_mode_enabled(enabled);
                                },
                                "Vim mode"
                                span { class: "text-[var(--lirox-muted)]", "{vim_mode_label}" }
                            }
                        }
                    }
                }
            }
        }
    }
}

#[cfg(target_arch = "wasm32")]
fn set_editor_vim_mode_enabled(enabled: bool) {
    use js_sys::{Function, Reflect};
    use wasm_bindgen::{JsCast, JsValue};

    let Some(window) = web_sys::window() else {
        return;
    };
    let Ok(api) = Reflect::get(&window, &JsValue::from_str("LiroxNotesEditor")) else {
        return;
    };
    let Ok(set_mode) = Reflect::get(&api, &JsValue::from_str("setVimModeEnabled")) else {
        return;
    };
    let Ok(set_mode) = set_mode.dyn_into::<Function>() else {
        return;
    };
    let _ = set_mode.call1(&api, &JsValue::from_bool(enabled));
}

#[cfg(not(target_arch = "wasm32"))]
fn set_editor_vim_mode_enabled(_enabled: bool) {}
