use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::theme::theme_css_vars;
use crate::{
    app::{ApplicationState, Dispatcher},
    input::InputEvent,
    platform::web::keyboard,
    ui::{
        overlays::{CheatSheet, Palette, Toast},
        workspace_renderer::WorkspaceRenderer,
    },
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
    // Keys an on-screen keyboard cannot send (Esc, Tab, arrows, ⌘/Ctrl/Alt
    // chords) mean a hardware keyboard is attached, wherever focus is.
    #[cfg(target_arch = "wasm32")]
    let _keyboard_listener = use_hook({
        let context = context.clone();
        move || {
            crate::platform::web::viewport::WindowListener::on("keydown", move |event| {
                use wasm_bindgen::JsCast;
                let Some(event) = event.dyn_ref::<web_sys::KeyboardEvent>() else {
                    return;
                };
                let hardware = event.meta_key()
                    || event.ctrl_key()
                    || event.alt_key()
                    || matches!(event.key().as_str(), "Escape" | "Tab")
                    || event.key().starts_with("Arrow");
                if hardware && context.state.peek().ui.touch {
                    crate::ui::actions::run_from(
                        &context,
                        "ui.set_input_device",
                        crate::ui::actions::text("keyboard"),
                        crate::command::CommandSource::Keyboard,
                    );
                }
                // Keys pressed while focus sits outside the shell (e.g. on
                // <body> after the focused button was removed) still go
                // through the keymap; the shell's own handler covers the rest.
                let inside_shell = event
                    .target()
                    .and_then(|target| target.dyn_into::<web_sys::Element>().ok())
                    .is_some_and(|element| {
                        element.closest("#workspace-shell").ok().flatten().is_some()
                    });
                if inside_shell {
                    return;
                }
                let Some(InputEvent::Key(stroke)) = keyboard::normalize_dom_key(
                    &event.key(),
                    event.ctrl_key(),
                    event.alt_key(),
                    event.shift_key(),
                    event.meta_key(),
                ) else {
                    return;
                };
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
            })
            .map(std::rc::Rc::new)
        }
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

    let touch_class = if state.read().ui.touch {
        "lx-touch"
    } else {
        ""
    };

    rsx! {
        div {
            id: "workspace-shell",
            style: "{theme_style}",
            class: "lx-root relative flex h-screen min-h-0 flex-col {touch_class}",
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
            Palette {}
            CheatSheet {}
            Toast {}
        }
    }
}
