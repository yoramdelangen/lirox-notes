use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    input::InputEvent,
    platform::web::keyboard,
    ui::{bottom_bar::BottomBar, top_bar::TopBar, workspace_renderer::WorkspaceRenderer},
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
    let context = use_context::<AppContext>();
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
