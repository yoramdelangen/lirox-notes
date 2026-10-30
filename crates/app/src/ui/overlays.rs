use dioxus::prelude::*;

use crate::{
    app::{ApplicationEvent, StatusEvent},
    command::CommandArgs,
    ui::{
        actions::{run, text},
        model::palette_items,
    },
    AppContext,
};

/// ⌘K: fuzzy-find a note, or run a command after `>`.
#[component]
pub fn Palette() -> Element {
    let context = use_context::<AppContext>();
    let Some(palette) = context.state.read().ui.palette.clone() else {
        return rsx! {};
    };
    let (items, total, vim) = {
        let state = context.state.read();
        let notes: Vec<String> = state
            .domain
            .notes
            .iter()
            .map(|note| note.path.clone())
            .collect();
        let vim = state.config.editor.vim_mode_enabled;
        (palette_items(&palette.query, &notes, vim), notes.len(), vim)
    };
    let _ = vim;
    let close = context.clone();
    let input = context.clone();
    let keys = context.clone();
    let count = items.len();

    rsx! {
        button {
            class: "lx-backdrop",
            r#type: "button",
            aria_label: "Close find",
            onclick: move |_| run(&close, "overlay.close_top", CommandArgs::None),
        }
        div { class: "lx-modal", role: "dialog", aria_label: "Find",
            div { class: "lx-legend", "Find" }
            div { class: "lx-palette-input",
                b { "›" }
                input {
                    value: "{palette.query}",
                    placeholder: "file, or > for commands",
                    autocomplete: "off",
                    spellcheck: "false",
                    aria_label: "Find a note or command",
                    onmounted: move |event| async move {
                        let _ = event.data().set_focus(true).await;
                    },
                    oninput: move |event: FormEvent| run(&input, "ui.palette_query", text(event.value())),
                    onkeydown: move |event: KeyboardEvent| {
                        crate::ui::actions::handle_key(&keys, "palette", &event);
                    },
                }
                span { class: "lx-hint", "{count} / {total}" }
            }
            div { class: "lx-palette-list", role: "listbox",
                for (index, item) in items.into_iter().enumerate() {
                    {
                        let context = context.clone();
                        rsx! {
                            button {
                                key: "{item.prefix}{item.label}",
                                r#type: "button",
                                role: "option",
                                aria_selected: "{index == palette.index}",
                                class: if index == palette.index { "lx-row is-current" } else { "lx-row" },
                                onclick: move |_| run(&context, "ui.palette_accept", CommandArgs::Count(index as u32)),
                                span { class: "lx-row-prefix", "{item.prefix}" }
                                span { class: "lx-row-label", "{item.label}" }
                                span { class: "lx-row-hint", "{item.hint}" }
                            }
                        }
                    }
                }
            }
        }
    }
}

/// Vim's own motions and edits; not part of the configurable keymap.
const VIM_BUILT_IN: &[(&str, &str)] = &[
    ("move", "h j k l"),
    ("word fwd / back", "w  b"),
    ("line start / end", "0  $"),
    ("top / bottom", "gg  G"),
    ("insert / append", "i  a  A"),
    ("open line below / above", "o  O"),
    ("delete char / line", "x  dd"),
    ("visual select", "v"),
    ("yank / paste", "y  p"),
    ("undo / redo", "u  ^r"),
    ("save", ":w"),
];

#[component]
pub fn CheatSheet() -> Element {
    let context = use_context::<AppContext>();
    if !context.state.read().ui.cheat_sheet {
        return rsx! {};
    }
    let sheet = crate::ui::model::keymap_sheet(&context.state.read().config.keymaps);
    let backdrop = context.clone();
    let close = context.clone();
    let keys = context.clone();

    rsx! {
        button {
            class: "lx-backdrop",
            r#type: "button",
            aria_label: "Close keys",
            onclick: move |_| run(&backdrop, "overlay.close_top", CommandArgs::None),
        }
        div {
            class: "lx-modal lx-cheat",
            role: "dialog",
            aria_label: "Keys",
            tabindex: "-1",
            onmounted: move |event| async move {
                let _ = event.data().set_focus(true).await;
            },
            onkeydown: move |event: KeyboardEvent| {
                crate::ui::actions::handle_key(&keys, "cheat-sheet", &event);
            },
            div { class: "lx-legend", "Keys" }
            button {
                class: "lx-close",
                style: "top: 6px; right: 8px",
                r#type: "button",
                onclick: move |_| run(&close, "overlay.close_top", CommandArgs::None),
                "esc ✕"
            }
            div { class: "lx-cheat-body",
                div { class: "lx-cheat-group",
                    h3 { "VIM (built in)" }
                    for (label, keys) in VIM_BUILT_IN.iter() {
                        div { key: "{label}", class: "lx-cheat-item",
                            span { "{label}" }
                            kbd { "{keys}" }
                        }
                    }
                }
                for (title, items) in sheet {
                    div { key: "{title}", class: "lx-cheat-group",
                        h3 { "{title}" }
                        for (label, keys) in items {
                            div { key: "{label}", class: "lx-cheat-item",
                                span { "{label}" }
                                kbd { "{keys}" }
                            }
                        }
                    }
                }
                div { class: "lx-hint", "Remap in ~/.config/lirox-notes/config.toml" }
            }
        }
    }
}

/// Shows the latest status message briefly.
#[component]
pub fn Toast() -> Element {
    let context = use_context::<AppContext>();
    let state = context.state;
    let message = use_memo(move || state.read().status.message.clone());
    let dispatcher = context.dispatcher.clone();
    use_effect(move || {
        let Some(shown) = message() else {
            return;
        };
        let dispatcher = dispatcher.clone();
        spawn(async move {
            crate::platform::web::timer::sleep(1800).await;
            let mut state = state;
            if state.read().status.message.as_deref() == Some(shown.as_str()) {
                dispatcher.dispatch_event(
                    &mut state.write(),
                    ApplicationEvent::Status(StatusEvent::Cleared),
                );
            }
        });
    });

    match message() {
        Some(message) => rsx! {
            div { class: "lx-toast", role: "status", aria_live: "polite",
                span { "{message}" }
            }
        },
        None => rsx! {},
    }
}
