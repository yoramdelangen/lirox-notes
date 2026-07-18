use dioxus::prelude::*;
use liroxnotes_shared::{mock_workspace_view, LabelSummary, NoteSummary, TreeEntry, TreeKind, WorkspaceView, APP_NAME};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::{closure::Closure, JsCast, JsValue};

const APP_CSS: Asset = asset!("/assets/app.css");
const EDITOR_JS: Asset = asset!("/assets/editor.js");
const EDITOR_BRIDGE_JS: Asset = asset!("/assets/editor-bridge.js");

#[component]
pub fn App() -> Element {
    let initial_note_path = selected_note_path().unwrap_or_else(|| "notes/welcome.md".to_string());
    let mut selected_note = use_signal(|| initial_note_path.clone());
    let mut selected_note_body = use_signal(|| mock_workspace_view(&initial_note_path).selected_note_body);

    use_effect(move || {
        #[cfg(target_arch = "wasm32")]
        {
            let window = web_sys::window().expect("window");
            let mut selected_note = selected_note;
            let mut selected_note_body = selected_note_body;

            let popstate = Closure::wrap(Box::new(move |_event: web_sys::PopStateEvent| {
                if let Some(path) = selected_note_path() {
                    selected_note_body.set(mock_workspace_view(&path).selected_note_body);
                    selected_note.set(path);
                }
            }) as Box<dyn FnMut(web_sys::PopStateEvent)>);

            let editor_change = Closure::wrap(Box::new(move |event: web_sys::Event| {
                let Ok(custom_event) = event.dyn_into::<web_sys::CustomEvent>() else {
                    return;
                };

                let detail = custom_event.detail();
                let doc = js_sys::Reflect::get(&detail, &JsValue::from_str("doc"))
                    .ok()
                    .and_then(|value| value.as_string());

                if let Some(doc) = doc {
                    selected_note_body.set(doc);
                }
            }) as Box<dyn FnMut(web_sys::Event)>);

            window.set_onpopstate(Some(popstate.as_ref().unchecked_ref()));
            window.add_event_listener_with_callback("lirox-notes-editor-change", editor_change.as_ref().unchecked_ref()).expect("editor listener");
            popstate.forget();
            editor_change.forget();
        }
    });

    let selected_note_path = selected_note.read().clone();
    let selected_note_body_value = selected_note_body.read().clone();
    let view = liroxnotes_shared::workspace_view_with_body(&liroxnotes_shared::DEMO_WORKSPACE, &selected_note_path, &selected_note_body_value);
    let workspace_slug = view.slug.clone();

    rsx! {
        WorkspaceShell {
            view,
            on_select_note: move |path: String| {
                selected_note_body.set(mock_workspace_view(&path).selected_note_body);
                selected_note.set(path.clone());
                push_workspace_note(&workspace_slug, &path);
            }
        }
    }
}

#[cfg(target_arch = "wasm32")]
fn selected_note_path() -> Option<String> {
    let path = web_sys::window()?.location().pathname().ok()?;
    workspace_note_path_from_location(&path).map(str::to_string)
}

#[cfg(not(target_arch = "wasm32"))]
fn selected_note_path() -> Option<String> {
    None
}

#[cfg(target_arch = "wasm32")]
fn push_workspace_note(slug: &str, path: &str) {
    let Some(window) = web_sys::window() else {
        return;
    };

    let Ok(history) = window.history() else {
        return;
    };

    let _ = history.push_state_with_url(&JsValue::NULL, "", Some(&format!("/workspace/{slug}/note/{path}")));
}

#[cfg(not(target_arch = "wasm32"))]
fn push_workspace_note(_slug: &str, _path: &str) {}

#[cfg(any(test, target_arch = "wasm32"))]
fn workspace_note_path_from_location(path: &str) -> Option<&str> {
    path.strip_prefix("/workspace/demo/note/")
}

#[component]
pub fn WorkspaceShell(view: WorkspaceView, on_select_note: EventHandler<String>) -> Element {
    rsx! {
        document::Link { rel: "icon", href: "data:," }
        document::Stylesheet { href: APP_CSS }
        document::Script { src: EDITOR_JS, r#type: "module" }
        document::Script { src: EDITOR_BRIDGE_JS }
        div { class: "grid h-screen overflow-hidden grid-rows-[2.75rem_minmax(0,1fr)_2.25rem] bg-shell-bg text-theme-text antialiased",
            TopBar { workspace_name: view.name.clone(), note_title: view.selected_note.title.clone(), source: view.source.clone() }
            div { class: "grid min-h-0 h-full grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]",
                Sidebar { view: view.clone(), on_select_note: on_select_note.clone() }
                EditorPane { view: view.clone() }
            }
            StatusBar {
                note_path: view.selected_note.path.clone(),
                branch: view.branch.clone(),
                changed_notes: view.changed_notes,
                note_count: view.note_count,
                source: view.source.clone(),
            }
        }
    }
}

fn note_href(slug: &str, path: &str) -> String {
    format!("/workspace/{slug}/note/{path}")
}

#[component]
fn Sidebar(view: WorkspaceView, on_select_note: EventHandler<String>) -> Element {
    rsx! {
        aside { class: "h-full min-h-0 overflow-auto border-r border-shell-border bg-shell-panel px-3 pt-1 pb-3",
            section { class: "space-y-3",
                div {
                    div { class: "mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "{APP_NAME}" }
                    ul { class: "list-none p-0 text-ui leading-6",
                        for row in view.tree {
                            TreeRow { slug: view.slug.clone(), row, on_select_note: on_select_note.clone() }
                        }
                    }
                }
                div {
                    div { class: "mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "Labels" }
                    ul { class: "list-none p-0 text-ui leading-6",
                        for label in view.labels {
                            LabelRow { label }
                        }
                    }
                }
                div {
                    div { class: "mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "Notes" }
                    ul { class: "list-none p-0 text-ui leading-6",
                        for note in view.notes {
                            NoteRow { slug: view.slug.clone(), note, on_select_note: on_select_note.clone() }
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn TreeRow(slug: String, row: TreeEntry, on_select_note: EventHandler<String>) -> Element {
    let indent = if row.depth == 0 { "pl-1" } else { "pl-4" };
    let classes = if row.active {
        "flex items-center rounded-md bg-theme-surface/90 text-theme-text"
    } else {
        "flex items-center rounded-md text-theme-muted hover:bg-theme-surface/60 hover:text-theme-text"
    };
    let icon = match row.kind {
        TreeKind::Folder => "▸",
        TreeKind::File => "",
    };

    rsx! {
        li {
            div { class: "flex items-center gap-2 py-px text-ui",
                if row.kind == TreeKind::File {
                    a { class: format!("{classes} w-full {indent} pr-2"), href: note_href(&slug, &row.path), onclick: move |event| {
                        event.prevent_default();
                        on_select_note.call(row.path.clone());
                    },
                        span { class: "w-3 shrink-0 text-theme-subtle", "{icon}" }
                        span { class: "truncate", "{row.label}" }
                    }
                } else {
                    div { class: format!("{classes} w-full {indent} pr-2"),
                        span { class: "w-3 shrink-0 text-theme-subtle", "{icon}" }
                        span { class: "truncate", "{row.label}" }
                    }
                }
            }
        }
    }
}

#[component]
fn LabelRow(label: LabelSummary) -> Element {
    let depth = label.name.matches('/').count();
    let indent = if depth == 0 { "pl-1" } else { "pl-4" };

    rsx! {
        li {
            div { class: format!("flex items-center justify-between rounded-md {indent} pr-2 py-px text-ui text-theme-muted"),
                span { class: "truncate", "{label.name}" }
                span { class: "text-[10px] text-theme-subtle", "{label.count}" }
            }
        }
    }
}

#[component]
fn NoteRow(slug: String, note: NoteSummary, on_select_note: EventHandler<String>) -> Element {
    let classes = if note.active {
        "rounded-md bg-theme-surface/90 text-theme-text"
    } else {
        "rounded-md text-theme-muted hover:bg-theme-surface/60 hover:text-theme-text"
    };

    rsx! {
        li {
            a { class: format!("block px-2 py-1 text-ui {classes}"), href: note_href(&slug, &note.path), onclick: move |event| {
                event.prevent_default();
                on_select_note.call(note.path.clone());
            },
                div { class: "flex items-center justify-between gap-2",
                    span { class: "truncate font-medium", "{note.title}" }
                    span { class: "shrink-0 text-[10px] text-theme-subtle", "{note.path}" }
                }
                div { class: "mt-0.5 flex flex-wrap gap-1",
                    for label in note.labels.iter().take(3) {
                        span { class: "rounded bg-theme-surface px-1.5 py-px text-[10px] text-theme-subtle", "{label}" }
                    }
                }
            }
        }
    }
}

#[component]
fn TopBar(workspace_name: String, note_title: String, source: String) -> Element {
    rsx! {
        header { class: "grid h-11 grid-cols-1 border-b border-shell-border bg-shell-bg lg:grid-cols-[18rem_1fr]",
            div { class: "flex items-center px-3",
                button { class: "flex h-7 min-w-0 items-center gap-2 rounded-md bg-theme-surface/70 px-2 text-[11px] text-theme-muted",
                    span { class: "font-icon w-3 shrink-0 text-center text-theme-subtle", "󰙅" }
                    span { class: "truncate", "{workspace_name}" }
                }
            }
            div { class: "flex min-w-0 items-center justify-between gap-3 px-3 lg:px-4",
                div { class: "flex min-w-0 items-center gap-2 text-ui",
                    span { class: "h-1.5 w-1.5 shrink-0 rounded-full bg-theme-warn" }
                    h1 { class: "truncate font-medium text-theme-text", "data-lirox-note-title": "true", "{note_title}" }
                }
                div { class: "flex shrink-0 items-center gap-2 text-[11px] text-theme-subtle",
                    button { class: "rounded bg-theme-surface/70 px-2 py-px text-theme-muted hover:text-theme-text", type: "button", "data-lirox-save-button": "true", "Saved" }
                    span { "data-lirox-save-state": "true", "Saved" }
                    span { "{source}" }
                }
            }
        }
    }
}

#[component]
fn EditorPane(view: WorkspaceView) -> Element {
    rsx! {
        section { class: "flex h-full min-h-0 flex-col bg-shell-editor",
            div {
                class: "min-h-0 flex-1 w-full font-mono text-ui leading-6 text-theme-text",
                "data-lirox-editor-root": "true",
                "data-note-path": view.selected_note.path,
                "data-note-title": view.selected_note.title,
                "data-initial-doc": view.selected_note_body,
                "data-line-numbers": "false",
                "data-writing-width": "650px",
                aria_label: "Markdown editor"
            }
        }
    }
}

#[component]
fn StatusBar(note_path: String, branch: String, changed_notes: usize, note_count: usize, source: String) -> Element {
    rsx! {
        footer { class: "grid h-9 grid-cols-1 border-t border-shell-border bg-shell-chrome text-[11px] lg:grid-cols-[18rem_1fr]",
            div { class: "flex items-center justify-between px-2",
                div { class: "flex items-center gap-1.5",
                    ModeButton { label: "󰈙", title: "Files", active: true }
                    ModeButton { label: "󰓹", title: "Labels", active: false }
                    ModeButton { label: "󱞁", title: "Notes", active: false }
                }
                span { class: "flex items-center gap-1 text-theme-subtle",
                    span { class: "font-icon text-[10px]", "󰙅" }
                    span { "Tree" }
                }
            }
            div { class: "flex items-center justify-end gap-2 px-3",
                span { class: "truncate text-theme-subtle", "data-lirox-note-path": "true", "{note_path}" }
                StatusPill { icon: "", label: branch }
                StatusPill { icon: "+", label: changed_notes.to_string() }
                StatusPill { icon: "󰎄", label: note_count.to_string() }
                StatusPill { icon: "󱁕", label: source }
            }
        }
    }
}

#[component]
fn ModeButton(label: &'static str, title: &'static str, active: bool) -> Element {
    let classes = if active {
        "flex h-6 w-6 items-center justify-center rounded bg-theme-surface-alt text-[10px] font-semibold text-theme-text"
    } else {
        "flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold text-theme-subtle transition hover:bg-theme-surface hover:text-theme-text"
    };

    rsx! {
        button { class: classes, title: title, aria_label: title, "{label}" }
    }
}

#[component]
fn StatusPill(icon: &'static str, label: String) -> Element {
    rsx! {
        span { class: "flex items-center gap-1 rounded px-2 py-px text-theme-muted",
            span { class: "font-icon w-3 shrink-0 text-center text-[10px] text-theme-accent/70", "{icon}" }
            span { "data-lirox-changed-count": "true", "{label}" }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::workspace_note_path_from_location;

    #[test]
    fn parses_selected_note_from_workspace_route() {
        assert_eq!(workspace_note_path_from_location("/workspace/demo/note/notes/roadmap.md"), Some("notes/roadmap.md"));
        assert_eq!(workspace_note_path_from_location("/workspace/demo"), None);
    }
}
