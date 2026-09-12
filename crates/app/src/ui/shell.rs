use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    app::{ApplicationState, Dispatcher},
    input::InputEvent,
    platform::web::keyboard,
    ui::{bottom_bar::BottomBar, top_bar::TopBar, workspace_renderer::WorkspaceRenderer},
    workspace::ViewportMode,
    AppAction, AppContext, FocusTarget, SidebarMode,
};

#[component]
pub fn WorkspaceShell(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    if try_use_context::<AppContext>().is_some() {
        return rsx! {
            WorkspaceShellContent {
                view,
                focus,
                sidebar_mode,
                browser_dir,
                on_action,
                on_select_note,
            }
        };
    }

    rsx! {
        WorkspaceShellSsr {
            view,
            focus,
            sidebar_mode,
            browser_dir,
            on_action,
            on_select_note,
        }
    }
}

#[component]
fn WorkspaceShellSsr(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let state = use_signal(|| ApplicationState::from_workspace_view(&view));
    use_context_provider(|| AppContext {
        state,
        dispatcher: Dispatcher::new(),
    });
    rsx! {
        WorkspaceShellContent {
            view,
            focus,
            sidebar_mode,
            browser_dir,
            on_action,
            on_select_note,
        }
    }
}

#[component]
fn WorkspaceShellContent(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let mut state = context.state;
    use_effect(move || {
        let viewport = if crate::platform::web::viewport::is_narrow() {
            ViewportMode::Narrow
        } else {
            ViewportMode::Wide
        };
        state.write().workspace.set_viewport(viewport);
    });
    let onkeydown = move |event: KeyboardEvent| {
        let Some(InputEvent::Key(stroke)) = keyboard::normalize_keyboard_event(&event) else {
            return;
        };
        if !keyboard::should_intercept(&event) {
            return;
        }
        let mut state = context.state;
        let result = {
            let mut state = state.write();
            let bindings = state.config.keymaps.bindings.clone();
            let scopes = state.active_input_scopes();
            crate::input::resolve(&bindings, &mut state.input, stroke, &scopes)
        };
        if let crate::input::ResolveResult::Matched(invocation) = result {
            event.prevent_default();
            context.dispatcher.dispatch(&mut state.write(), invocation);
        }
    };

    rsx! {
        div {
            id: "workspace-shell",
            class: "flex min-h-screen flex-col bg-[var(--lirox-bg)] text-[var(--lirox-fg)]",
            onkeydown: onkeydown,
            TopBar {
                view: view.clone(),
                on_action,
            }
            main {
                class: "relative flex min-h-0 flex-1 overflow-hidden",
                WorkspaceRenderer {
                    view: view.clone(),
                    focus,
                    sidebar_mode,
                    browser_dir: browser_dir.clone(),
                    on_action,
                    on_select_note,
                }
            }
            BottomBar {
                view,
                browser_dir,
            }
        }
    }
}
