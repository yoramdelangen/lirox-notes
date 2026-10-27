use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    app::{ActionMenu, Dispatcher},
    command::{CommandArgs, Direction, SurfaceId},
    input::InputMode,
    ui::{
        actions::{run, run_from, text},
        model::{action_menu_items, action_menu_title, current_outline_index, outline},
    },
    AppContext,
};

#[component]
pub fn EditorSurface(view: WorkspaceView, active: bool) -> Element {
    let _ = &view;
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let dispatcher = context.dispatcher.clone();
    let state_read = state.read();
    let path = state_read.domain.selected_note.clone().unwrap_or_default();
    let document = state_read.domain.document.clone();
    let vim_mode_enabled = crate::app::effective_vim(&state_read);
    let has_notes = !state_read.domain.notes.is_empty();
    let ui = state_read.ui.clone();
    drop(state_read);
    let touch_context = context.clone();

    rsx! {
        article {
            key: "{path}",
            class: "lx-editor",
            onpointerdown: move |event: PointerEvent| {
                state.write().workspace.focus.active_surface = SurfaceId::EDITOR;
                if event.data().pointer_type() == "touch" {
                    run(&touch_context, "ui.set_input_device", text("touch"));
                }
            },
            onfocusin: move |_| state.write().workspace.focus.active_surface = SurfaceId::EDITOR,
            EditorTopBar {}
            if ui.outline {
                OutlinePanel {}
            }
            div { class: "lx-doc",
                if !has_notes {
                    EditorEmptyState {}
                } else {
                    div {
                        id: "lirox-editor-root",
                        class: "h-full min-h-0 w-full",
                        style: "font-size: {ui.font_size}px;",
                        "data-lirox-editor-root": "true",
                        "data-initial-doc": "{document}",
                        "data-line-numbers": "false",
                        "data-vim-mode-enabled": "{vim_mode_enabled}",
                        "data-autofocus": "{active}",
                        aria_label: "Edit note",
                        onmounted: move |event| mount_editor(event, state, dispatcher.clone()),
                    }
                }
            }
            if has_notes {
                if let Some(menu) = ui.action_menu {
                    ActionDropdown { menu, index: ui.action_menu_index }
                }
                if ui.action_bar || ui.touch {
                    ActionBar {}
                }
            }
            if !ui.touch {
                StatusLine {}
            }
        }
    }
}

#[component]
fn EditorTopBar() -> Element {
    let context = use_context::<AppContext>();
    let (sticky, action_bar, outline_open) = {
        let state = context.state.read();
        (
            state.ui.sticky_heading.clone(),
            state.ui.action_bar,
            state.ui.outline,
        )
    };
    let tree = context.clone();
    let bar = context.clone();
    let outline = context.clone();

    rsx! {
        header { class: "lx-topbar",
            button {
                class: "lx-icon-btn",
                r#type: "button",
                aria_label: "Toggle file tree",
                title: "File tree (⌘\\)",
                onclick: move |_| run(&tree, "workspace.toggle_file_tree", CommandArgs::None),
                "≡"
            }
            div { class: "lx-crumb",
                if !sticky.is_empty() {
                    span { "#" }
                    span { "{sticky}" }
                }
            }
            div { class: "lx-seg", role: "group", aria_label: "Editor panels",
                button {
                    r#type: "button",
                    class: if action_bar { "is-active" },
                    aria_pressed: "{action_bar}",
                    onclick: move |_| run(&bar, "ui.toggle_action_bar", CommandArgs::None),
                    "Actionbar"
                }
                button {
                    r#type: "button",
                    class: if outline_open { "is-active" },
                    aria_pressed: "{outline_open}",
                    onclick: move |_| run(&outline, "ui.toggle_outline", CommandArgs::None),
                    "Outline"
                }
            }
        }
    }
}

#[component]
fn OutlinePanel() -> Element {
    let context = use_context::<AppContext>();
    let (items, file_name, current) = {
        let state = context.state.read();
        let items = outline(&state.domain.document);
        let current = current_outline_index(&items, state.ui.cursor.0);
        let file_name = state
            .domain
            .selected_note
            .as_deref()
            .and_then(|path| path.rsplit('/').next())
            .unwrap_or_default()
            .to_string();
        (items, file_name, current)
    };
    let close = context.clone();

    rsx! {
        div { class: "lx-popover lx-outline", role: "dialog", aria_label: "Outline",
            div { class: "lx-legend", "Outline" }
            button {
                class: "lx-close",
                r#type: "button",
                onclick: move |_| run(&close, "ui.toggle_outline", CommandArgs::None),
                "esc ✕"
            }
            div { class: "lx-outline-list",
                div { class: "lx-hint", style: "padding: 0 14px 6px;", "{file_name}" }
                if items.is_empty() {
                    div { class: "lx-hint", style: "padding: 4px 14px;", "no headings" }
                }
                for (index, item) in items.into_iter().enumerate() {
                    {
                        let context = context.clone();
                        let hashes = format!("{}{}", "  ".repeat(item.level - 1), "#".repeat(item.level));
                        rsx! {
                            button {
                                key: "{item.line}",
                                r#type: "button",
                                class: if current == Some(index) { "lx-row is-current" } else { "lx-row" },
                                onclick: move |_| run(&context, "editor.goto_line", CommandArgs::Count(item.line as u32)),
                                span { class: "lx-key", "{hashes} " }
                                span { class: "lx-row-label", "{item.text}" }
                            }
                        }
                    }
                }
            }
        }
    }
}

struct Tool {
    id: &'static str,
    label: &'static str,
    key: &'static str,
    menu: Option<ActionMenu>,
    style: &'static str,
}

const fn tool(id: &'static str, label: &'static str, key: &'static str) -> Tool {
    Tool {
        id,
        label,
        key,
        menu: None,
        style: "",
    }
}

const TOOLS: &[Option<Tool>] = &[
    Some(Tool {
        menu: Some(ActionMenu::Heading),
        style: "font-weight: 700",
        ..tool("heading", "H", "h")
    }),
    Some(tool("task", "Task", "t")),
    Some(Tool {
        menu: Some(ActionMenu::Lists),
        ..tool("lists", "Lists", "l")
    }),
    Some(Tool {
        style: "font-weight: 700",
        ..tool("bold", "B", "b")
    }),
    Some(Tool {
        style: "font-style: italic",
        ..tool("italic", "I", "i")
    }),
    Some(Tool {
        menu: Some(ActionMenu::Format),
        ..tool("format", "Format", "f")
    }),
    Some(tool("link", "Link", "k")),
    None,
    Some(tool("table", "Table", "T")),
    Some(tool("image", "Image", "m")),
    Some(Tool {
        menu: Some(ActionMenu::More),
        ..tool("more", "More", ".")
    }),
];

#[component]
fn ActionBar() -> Element {
    let context = use_context::<AppContext>();
    let (open_menu, show_keys) = {
        let state = context.state.read();
        (state.ui.action_menu, state.ui.key_hints && !state.ui.touch)
    };

    rsx! {
        div { class: "lx-actionbar-wrap",
            div { class: "lx-actionbar", role: "toolbar", aria_label: "Formatting",
                for entry in TOOLS.iter() {
                    match entry {
                        None => rsx! { div { class: "lx-tool-sep", role: "separator" } },
                        Some(tool) => {
                            let context = context.clone();
                            let active = tool.menu.is_some() && tool.menu == open_menu;
                            rsx! {
                                button {
                                    key: "{tool.id}",
                                    r#type: "button",
                                    class: if active { "lx-tool is-active" } else { "lx-tool" },
                                    title: "␣ {tool.key}",
                                    aria_haspopup: if tool.menu.is_some() { "menu" },
                                    onmousedown: move |event| event.prevent_default(),
                                    onclick: move |_| match tool.menu {
                                        Some(_) => run(&context, "ui.open_action_menu", text(tool.id)),
                                        None => run(&context, "editor.action", text(tool.id)),
                                    },
                                    span { style: "{tool.style}", "{tool.label}" }
                                    if tool.menu.is_some() {
                                        span { class: "lx-tool-caret", "▾" }
                                    }
                                    if show_keys {
                                        span { class: "lx-tool-key", "{tool.key}" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn ActionDropdown(menu: ActionMenu, index: usize) -> Element {
    let context = use_context::<AppContext>();
    let keys = context.clone();
    let keyboard = !context.state.read().ui.touch;
    let items = action_menu_items(menu);

    rsx! {
        div {
            class: "lx-dropdown",
            role: "menu",
            tabindex: "-1",
            onmounted: move |event| async move {
                let _ = event.data().set_focus(true).await;
            },
            onkeydown: move |event: KeyboardEvent| {
                event.stop_propagation();
                let key = event.data().key().to_string();
                let (id, args) = match key.as_str() {
                    "j" | "ArrowDown" => ("ui.action_menu_move", CommandArgs::Direction(Direction::Down)),
                    "k" | "ArrowUp" => ("ui.action_menu_move", CommandArgs::Direction(Direction::Up)),
                    "Enter" => ("ui.action_menu_accept", CommandArgs::None),
                    "Escape" | "q" => ("overlay.close_top", CommandArgs::None),
                    digit => match digit.parse::<u32>() {
                        Ok(n) if (1..=items.len() as u32).contains(&n) => {
                            ("ui.action_menu_accept", CommandArgs::Count(n - 1))
                        }
                        _ => return,
                    },
                };
                event.prevent_default();
                run_from(&keys, id, args, crate::command::CommandSource::Keyboard);
            },
            div { class: "lx-legend", "{action_menu_title(menu)}" }
            for (position, item) in items.iter().enumerate() {
                {
                    let context = context.clone();
                    rsx! {
                        button {
                            key: "{item.action}",
                            r#type: "button",
                            role: "menuitem",
                            class: if keyboard && position == index { "lx-row is-current" } else { "lx-row" },
                            onmousedown: move |event| event.prevent_default(),
                            onclick: move |_| run(&context, "ui.action_menu_accept", CommandArgs::Count(position as u32)),
                            span { class: "lx-key", "{position + 1}" }
                            span { class: "lx-row-label", "{item.label}" }
                            span { class: "lx-row-hint", "{item.syntax}" }
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn StatusLine() -> Element {
    let context = use_context::<AppContext>();
    let state = context.state.read();
    let (label, class) = if !state.config.editor.vim_mode_enabled {
        ("EDIT", "lx-mode-plain")
    } else {
        match state.input.mode {
            InputMode::Normal => ("NORMAL", "lx-mode-normal"),
            InputMode::Insert | InputMode::Replace => ("INSERT", "lx-mode-insert"),
            InputMode::Visual | InputMode::VisualLine | InputMode::VisualBlock => {
                ("VISUAL", "lx-mode-visual")
            }
        }
    };
    let file_name = state
        .domain
        .selected_note
        .as_deref()
        .and_then(|path| path.rsplit('/').next())
        .unwrap_or_default()
        .to_string();
    let (line, column) = state.ui.cursor;

    rsx! {
        footer { class: "lx-statusline",
            span { class: "lx-mode {class}", "{label}" }
            span { class: "lx-file", "{file_name}" }
            span { class: "lx-pos", "{line}:{column}" }
        }
    }
}

#[component]
fn EditorEmptyState() -> Element {
    let context = use_context::<AppContext>();
    rsx! {
        div { class: "lx-empty",
            span { "no notes yet" }
            button {
                class: "lx-btn-primary",
                r#type: "button",
                onclick: move |_| run(&context, "editor.create_note", CommandArgs::None),
                "Create new note"
            }
        }
    }
}

#[cfg(target_arch = "wasm32")]
fn mount_editor(
    event: dioxus::prelude::MountedEvent,
    state: Signal<crate::app::ApplicationState>,
    dispatcher: Dispatcher,
) {
    use crate::command::{CommandId, CommandInvocation, CommandSource};
    use dioxus::web::WebEventExt;
    use js_sys::{Function, Reflect};
    use wasm_bindgen::{closure::Closure, JsCast, JsValue};

    let Some(root) = event.data().try_as_web_event() else {
        return;
    };
    // Re-mounting the same root replaces its listeners instead of stacking them.
    let listen = |name: &str, property: &str, handler: Box<dyn FnMut(web_sys::Event)>| {
        if let Ok(previous) = Reflect::get(&root, &JsValue::from_str(property)) {
            if let Ok(previous) = previous.dyn_into::<Function>() {
                let _ = root.remove_event_listener_with_callback(name, &previous);
            }
        }
        let listener = Closure::wrap(handler);
        let callback: &Function = listener.as_ref().unchecked_ref();
        let _ = root.add_event_listener_with_callback(name, callback);
        let _ = Reflect::set(&root, &JsValue::from_str(property), callback);
        listener.forget();
    };
    let detail = |event: &web_sys::Event, field: &str| {
        event
            .dyn_ref::<web_sys::CustomEvent>()
            .and_then(|event| Reflect::get(&event.detail(), &JsValue::from_str(field)).ok())
    };

    listen(
        "lirox-editor-change",
        "__liroxEditorChangeListener",
        Box::new(move |event: web_sys::Event| {
            let Some(mode) = detail(&event, "mode").and_then(|value| value.as_string()) else {
                return;
            };
            let mode = match mode.as_str() {
                "insert" | "plain" => InputMode::Insert,
                "visual" => InputMode::Visual,
                "visual line" => InputMode::VisualLine,
                "visual block" => InputMode::VisualBlock,
                "replace" => InputMode::Replace,
                _ => InputMode::Normal,
            };
            let document = detail(&event, "doc").and_then(|value| value.as_string());
            let line = detail(&event, "line").and_then(|value| value.as_f64());
            let column = detail(&event, "col").and_then(|value| value.as_f64());
            let mut state = state;
            let mut state = state.write();
            state.input.mode = mode;
            if let Some(document) = document {
                state.domain.document = document;
            }
            if let (Some(line), Some(column)) = (line, column) {
                state.ui.cursor = (line as usize, column as usize);
            }
        }),
    );

    listen(
        "lirox-editor-scroll",
        "__liroxEditorScrollListener",
        Box::new(move |event: web_sys::Event| {
            let sticky = detail(&event, "sticky")
                .and_then(|value| value.as_string())
                .unwrap_or_default();
            let mut state = state;
            state.write().ui.sticky_heading = sticky;
        }),
    );

    let save_dispatcher = dispatcher.clone();
    listen(
        "lirox-editor-save",
        "__liroxEditorSaveListener",
        Box::new(move |_: web_sys::Event| {
            let mut state = state;
            save_dispatcher.dispatch(
                &mut state.write(),
                CommandInvocation {
                    id: CommandId::new("editor.save"),
                    args: CommandArgs::None,
                    source: CommandSource::Keyboard,
                },
            );
        }),
    );

    // Vim leader keys that open interface panels rather than edit text.
    listen(
        "lirox-editor-command",
        "__liroxEditorCommandListener",
        Box::new(move |event: web_sys::Event| {
            let Some(id) = detail(&event, "id").and_then(|value| value.as_string()) else {
                return;
            };
            let (command, args) = match id.as_str() {
                "palette" => ("ui.open_palette", CommandArgs::None),
                "cheat" => ("ui.toggle_cheat_sheet", CommandArgs::None),
                menu => match menu.strip_prefix("menu:") {
                    Some(menu) => ("ui.open_action_menu", text(menu)),
                    None => return,
                },
            };
            let mut state = state;
            dispatcher.dispatch(
                &mut state.write(),
                CommandInvocation {
                    id: CommandId::new(command),
                    args,
                    source: CommandSource::Keyboard,
                },
            );
        }),
    );

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
