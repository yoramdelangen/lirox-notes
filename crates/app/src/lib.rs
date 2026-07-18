use dioxus::prelude::*;
use liroxnotes_shared::{mock_workspace_view, LabelSummary, NoteSummary, TreeEntry, TreeKind, WorkspaceView, APP_NAME};

const APP_CSS: Asset = asset!("/assets/app.css");
const EDITOR_JS: Asset = asset!("/assets/editor-bridge.js");

#[component]
pub fn App() -> Element {
    rsx! { WorkspaceShell { view: mock_workspace_view("notes/welcome.md") } }
}

#[component]
pub fn WorkspaceShell(view: WorkspaceView) -> Element {
    rsx! {
        document::Link { rel: "icon", href: "data:," }
        document::Stylesheet { href: APP_CSS }
        document::Script { src: EDITOR_JS, r#type: "module" }
        div { class: "grid h-screen overflow-hidden grid-rows-[2.75rem_minmax(0,1fr)_2.25rem] bg-shell-bg text-theme-text antialiased",
            TopBar { workspace_name: view.name.clone(), note_title: view.selected_note.title.clone(), source: view.source.clone() }
            div { class: "grid min-h-0 h-full grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]",
                Sidebar { view: view.clone() }
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
fn Sidebar(view: WorkspaceView) -> Element {
    rsx! {
        aside { class: "h-full min-h-0 overflow-auto border-r border-shell-border bg-shell-panel px-3 pt-1 pb-3",
            section { class: "space-y-3",
                div {
                    div { class: "mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "{APP_NAME}" }
                    ul { class: "list-none p-0 text-ui leading-6",
                        for row in view.tree {
                            TreeRow { slug: view.slug.clone(), row }
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
                            NoteRow { slug: view.slug.clone(), note }
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn TreeRow(slug: String, row: TreeEntry) -> Element {
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
                    a { class: format!("{classes} w-full {indent} pr-2"), href: note_href(&slug, &row.path),
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
fn NoteRow(slug: String, note: NoteSummary) -> Element {
    let classes = if note.active {
        "rounded-md bg-theme-surface/90 text-theme-text"
    } else {
        "rounded-md text-theme-muted hover:bg-theme-surface/60 hover:text-theme-text"
    };

    rsx! {
        li {
            a { class: format!("block px-2 py-1 text-ui {classes}"), href: note_href(&slug, &note.path),
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
                div { class: "shrink-0 text-[11px] text-theme-subtle", "{source}" }
            }
        }
    }
}

#[component]
fn EditorPane(view: WorkspaceView) -> Element {
    rsx! {
        section { class: "flex h-full min-h-0 flex-col bg-shell-editor",
            div { class: "flex items-start justify-between gap-4 border-b border-shell-border/70 px-4 py-3",
                div { class: "min-w-0",
                    div { class: "truncate text-sm font-medium text-theme-text", "{view.selected_note.title}" }
                    div { class: "mt-1 flex flex-wrap gap-1.5",
                        for label in view.selected_note.labels {
                            span { class: "rounded bg-theme-surface px-1.5 py-px text-[10px] text-theme-subtle", "{label}" }
                        }
                    }
                }
                div { class: "flex shrink-0 flex-wrap justify-end gap-1.5",
                    for link in view.selected_note.links {
                        a { class: "rounded bg-theme-surface/70 px-2 py-px text-[10px] text-theme-muted hover:text-theme-text", href: note_href(&view.slug, &link), "{link}" }
                    }
                }
            }
            div {
                class: "min-h-0 flex-1 w-full font-mono text-ui leading-6 text-theme-text",
                "data-lirox-editor-root": "true",
                "data-note-path": view.selected_note.path,
                "data-initial-doc": view.selected_note_body,
                "data-line-numbers": "false",
                "data-writing-width": "650px",
                "data-title-target": "[data-lirox-note-title]",
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
            span { "{label}" }
        }
    }
}
