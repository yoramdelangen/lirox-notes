use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::theme::theme_css_vars;
use crate::{
    app::{ApplicationState, Dispatcher},
    input::InputEvent,
    platform::web::keyboard,
    ui::workspace_renderer::WorkspaceRenderer,
    workspace::ViewportMode,
    AppContext, FocusTarget, SidebarMode,
};

#[component]
pub fn WorkspaceShell(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    if try_use_context::<AppContext>().is_some() {
        return rsx! {
            WorkspaceShellContent {
                view,
                focus,
                sidebar_mode,
                on_select_note,
            }
        };
    }

    rsx! {
        WorkspaceShellSsr {
            view,
            focus,
            sidebar_mode,
            on_select_note,
        }
    }
}

#[component]
fn WorkspaceShellSsr(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
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
            on_select_note,
        }
    }
}

#[component]
fn WorkspaceShellContent(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let theme = {
        let state = state.read();
        state
            .theme_preview
            .clone()
            .unwrap_or_else(|| state.theme.clone())
    };
    let theme_style = theme_css_vars(&theme);
    #[cfg_attr(not(target_arch = "wasm32"), allow(unused_mut))]
    let mut update_viewport = move || {
        let viewport = if crate::platform::web::viewport::is_narrow() {
            ViewportMode::Narrow
        } else {
            ViewportMode::Wide
        };
        state.write().workspace.set_viewport(viewport);
    };
    #[cfg(target_arch = "wasm32")]
    let _viewport_listener = use_hook(move || {
        update_viewport();
        crate::platform::web::viewport::ResizeListener::new(update_viewport).map(std::rc::Rc::new)
    });
    #[cfg(not(target_arch = "wasm32"))]
    use_hook(update_viewport);
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
            style: "{theme_style}",
            class: "flex h-screen min-h-0 flex-col bg-[var(--lirox-bg)] text-[var(--lirox-fg)]",
            onkeydown: onkeydown,
            main {
                class: "relative flex min-h-0 flex-1 overflow-hidden",
                WorkspaceRenderer {
                    view: view.clone(),
                    focus,
                    sidebar_mode,
                    on_select_note,
                }
            }
        }
    }
}
