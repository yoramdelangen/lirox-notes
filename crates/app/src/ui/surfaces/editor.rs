use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    app::Dispatcher,
    command::{CommandArgs, CommandId, CommandInvocation, CommandSource, SurfaceId},
    components::{
        button::{Button, ButtonVariant},
        empty::{
            Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyMediaVariant,
            EmptyTitle,
        },
    },
    ui::{bottom_bar::BottomBar, top_bar::EditorActions},
    AppContext,
};

#[cfg(target_arch = "wasm32")]
use crate::input::InputMode;

#[component]
pub fn EditorSurface(view: WorkspaceView, active: bool) -> Element {
    let _ = &view;
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let dispatcher = context.dispatcher.clone();
    let state_read = state.read();
    let selected = state_read.domain.selected_note.as_deref().and_then(|path| {
        state_read
            .domain
            .notes
            .iter()
            .find(|note| note.path == path)
    });
    let path = selected.map(|note| note.path.clone()).unwrap_or_default();
    let document = state_read.domain.document.clone();
    let vim_mode_enabled = state_read.config.editor.vim_mode_enabled;
    let has_notes = !state_read.domain.notes.is_empty();
    drop(state_read);

    let active_class = if active {
        "border-[var(--lirox-accent)]"
    } else {
        "border-[var(--lirox-surface)]"
    };

    rsx! {
        article {
            key: "{path}",
            class: "editor-surface relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--lirox-surface)] transition-shadow duration-150",
            onpointerdown: move |_| state.write().workspace.focus.active_surface = SurfaceId::EDITOR,
            onfocusin: move |_| state.write().workspace.focus.active_surface = SurfaceId::EDITOR,
            EditorActions {}
            div { class: "min-h-0 flex-1 overflow-auto md:px-4 pt-12 pb-10 border {active_class}",
                id: "editor-surface-container",
                if !has_notes {
                    EditorEmptyState {}
                } else {
                    div {
                        id: "lirox-editor-root",
                        class: "h-full min-h-0 w-full",
                        "data-lirox-editor-root": "true",
                        "data-initial-doc": "{document}",
                        "data-writing-width": "650px",
                        "data-line-numbers": "false",
                        "data-vim-mode-enabled": "{vim_mode_enabled}",
                        aria_label: "Edit note",
                        onmounted: move |event| mount_editor(event, state, dispatcher.clone()),
                    }
                },
                BottomBar { view, active }
            }
        }
    }
}

#[component]
fn EditorEmptyState() -> Element {
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let dispatcher = context.dispatcher;
    rsx! {
        div { class: "editor-empty-state flex h-full min-h-0 items-center justify-center p-4",
            Empty {
                class: "w-full max-w-md border-[var(--lirox-border)] bg-[var(--lirox-bg-alt)]",
                EmptyHeader {
                    EmptyMedia {
                        variant: EmptyMediaVariant::Icon,
                        class: "bg-[var(--lirox-surface-alt)] text-[var(--lirox-accent)]",
                        svg {
                            xmlns: "http://www.w3.org/2000/svg",
                            view_box: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            stroke_width: "1.5",
                            stroke_linecap: "round",
                            stroke_linejoin: "round",
                            "aria-hidden": "true",
                            path { d: "M13 3.75H7A2.25 2.25 0 0 0 4.75 6v12A2.25 2.25 0 0 0 7 20.25h10A2.25 2.25 0 0 0 19.25 18V9.5L13 3.75Z" }
                            path { d: "M13 3.75V9.5h6.25M8.5 13h7M8.5 16.5h7" }
                        }
                    }
                    EmptyTitle { class: "text-[var(--lirox-fg)]", "No notes yet" }
                    EmptyDescription { class: "max-w-sm leading-6 text-[var(--lirox-muted)]", "Create your first note to start writing in this workspace." }
                }
                EmptyContent {
                    Button {
                        variant: ButtonVariant::Default,
                        onclick: move |_| dispatcher.dispatch(
                            &mut state.write(),
                            CommandInvocation {
                                id: CommandId::new("editor.create_note"),
                                args: CommandArgs::None,
                                source: CommandSource::Pointer,
                            },
                        ),
                        "Create new note"
                    }
                }
            }
        }
    }
}

#[cfg(target_arch = "wasm32")]
fn mount_editor(
    event: dioxus::prelude::MountedEvent,
    mut state: Signal<crate::app::ApplicationState>,
    dispatcher: Dispatcher,
) {
    use dioxus::web::WebEventExt;
    use js_sys::{Function, Reflect};
    use wasm_bindgen::{closure::Closure, JsCast, JsValue};
    const LISTENER_PROPERTY: &str = "__liroxEditorChangeListener";
    const SAVE_LISTENER_PROPERTY: &str = "__liroxEditorSaveListener";

    let Some(root) = event.data().try_as_web_event() else {
        return;
    };
    if let Ok(previous) = Reflect::get(&root, &JsValue::from_str(LISTENER_PROPERTY)) {
        if let Ok(previous) = previous.dyn_into::<Function>() {
            let _ = root.remove_event_listener_with_callback("lirox-editor-change", &previous);
        }
    }
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
    let callback: &Function = listener.as_ref().unchecked_ref();
    let _ = root.add_event_listener_with_callback("lirox-editor-change", callback);
    let _ = Reflect::set(&root, &JsValue::from_str(LISTENER_PROPERTY), callback);
    listener.forget();

    if let Ok(previous) = Reflect::get(&root, &JsValue::from_str(SAVE_LISTENER_PROPERTY)) {
        if let Ok(previous) = previous.dyn_into::<Function>() {
            let _ = root.remove_event_listener_with_callback("lirox-editor-save", &previous);
        }
    }
    let save_listener = Closure::wrap(Box::new(move |_: web_sys::Event| {
        dispatcher.dispatch(
            &mut state.write(),
            CommandInvocation {
                id: CommandId::new("editor.save"),
                args: CommandArgs::None,
                source: CommandSource::Keyboard,
            },
        );
    }) as Box<dyn FnMut(_)>);
    let save_callback: &Function = save_listener.as_ref().unchecked_ref();
    let _ = root.add_event_listener_with_callback("lirox-editor-save", save_callback);
    let _ = Reflect::set(
        &root,
        &JsValue::from_str(SAVE_LISTENER_PROPERTY),
        save_callback,
    );
    save_listener.forget();

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
    _dispatcher: Dispatcher,
) {
}
