use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{input::InputMode, AppContext};

#[component]
pub fn EditorSurface(view: WorkspaceView, active: bool) -> Element {
    let _ = view;
    let context = use_context::<AppContext>();
    let state = context.state;
    let state_read = state.read();
    let mode = state_read.input.mode;
    let selected = state_read.domain.selected_note.as_deref().and_then(|path| {
        state_read
            .domain
            .notes
            .iter()
            .find(|note| note.path == path)
    });
    let title = selected.map(|note| note.title.clone()).unwrap_or_default();
    let path = selected.map(|note| note.path.clone()).unwrap_or_default();
    let document = state_read.domain.document.clone();
    let has_notes = !state_read.domain.notes.is_empty();
    drop(state_read);
    let mode_label = match mode {
        InputMode::Normal => "NORMAL",
        InputMode::Insert => "INSERT",
        InputMode::Visual => "VISUAL",
        InputMode::VisualLine => "VISUAL LINE",
        InputMode::VisualBlock => "VISUAL BLOCK",
        InputMode::Replace => "REPLACE",
    };
    let active_class = if active {
        "ring-1 ring-inset ring-[var(--lirox-accent)]"
    } else {
        ""
    };
    let mode_class = if mode == InputMode::Normal {
        "text-[var(--lirox-accent)]"
    } else {
        "text-[var(--lirox-muted)]"
    };
    rsx! {
        article {
            key: "{path}",
            class: "flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--lirox-surface)] {active_class}",
            aria_label: "Editor",
            header { class: "flex items-center justify-between border-b border-[var(--lirox-border)] px-4 py-3",
                div {
                     h1 { class: "text-sm font-semibold", "{title}" }
                     p { class: "text-xs text-[var(--lirox-muted)]", "{path}" }
                }
                span { class: "text-xs {mode_class}", "{mode_label}" }
            }
            div { class: "h-full min-h-0 flex-1 overflow-auto p-4",
                 if !has_notes {
                     p { class: "text-sm text-[var(--lirox-muted)]", "No note selected" }
                 } else {
                     div {
                         id: "lirox-editor-root",
                         class: "h-full min-h-0 w-full",
                         "data-lirox-editor-root": "true",
                         "data-initial-doc": "{document}",
                         "data-writing-width": "100%",
                         "data-line-numbers": "false",
                         aria_label: "Edit note",
                         onmounted: move |event| mount_editor(event, state),
                     }
                 }
            }
        }
    }
}

#[cfg(target_arch = "wasm32")]
fn mount_editor(event: dioxus::prelude::MountedEvent, state: Signal<crate::app::ApplicationState>) {
    use dioxus::web::WebEventExt;
    use js_sys::{Function, Reflect};
    use wasm_bindgen::{closure::Closure, JsCast, JsValue};

    let Some(root) = event.data().try_as_web_event() else {
        return;
    };
    let listener = Closure::wrap(Box::new(move |event: web_sys::Event| {
        let Some(event) = event.dyn_ref::<web_sys::CustomEvent>() else {
            return;
        };
        let detail = event.detail();
        let document = Reflect::get(&detail, &JsValue::from_str("doc"))
            .ok()
            .and_then(|value| value.as_string());
        let mode = Reflect::get(&detail, &JsValue::from_str("mode"))
            .ok()
            .and_then(|value| value.as_string());
        let Some(mode) = mode else { return };
        let mode = match mode.as_str() {
            "insert" => InputMode::Insert,
            "visual" => InputMode::Visual,
            "visual line" => InputMode::VisualLine,
            "visual block" => InputMode::VisualBlock,
            "replace" => InputMode::Replace,
            _ => InputMode::Normal,
        };
        let mut state = state;
        let mut state = state.write();
        state.input.mode = mode;
        if let Some(document) = document {
            state.domain.document = document;
        }
    }) as Box<dyn FnMut(_)>);
    let _ = root
        .add_event_listener_with_callback("lirox-editor-change", listener.as_ref().unchecked_ref());
    listener.forget();

    let Some(window) = web_sys::window() else {
        return;
    };
    let Ok(api) = Reflect::get(&window, &JsValue::from_str("LiroxNotesEditor")) else {
        return;
    };
    let Ok(mount) = Reflect::get(&api, &JsValue::from_str("mountAllLiroxNotesEditors")) else {
        return;
    };
    let Ok(mount) = mount.dyn_into::<Function>() else {
        return;
    };
    let _ = mount.call0(&api);
}

#[cfg(not(target_arch = "wasm32"))]
fn mount_editor(
    _event: dioxus::prelude::MountedEvent,
    _state: Signal<crate::app::ApplicationState>,
) {
}
