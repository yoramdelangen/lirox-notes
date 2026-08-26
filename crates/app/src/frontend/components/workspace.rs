use crate::{AppAction, FocusTarget, SidebarMode};
use dioxus::prelude::*;
use liroxnotes_shared::{LabelSummary, NoteSummary, TreeEntry, TreeKind, WorkspaceView, APP_NAME};
use std::collections::BTreeSet;

#[allow(dead_code)]
fn note_href(slug: &str, path: &str) -> String {
    format!("/workspace/{slug}/note/{path}")
}

#[allow(dead_code)]
#[component]
pub(crate) fn Sidebar(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let focused = matches!(focus, FocusTarget::Sidebar);
    let shell_classes = if focused {
        "h-full min-h-0 overflow-auto border-r border-theme-accent/50 bg-shell-panel px-3 pt-1 pb-3 outline outline-1 outline-theme-accent/40"
    } else {
        "h-full min-h-0 overflow-auto border-r border-shell-border bg-shell-panel px-3 pt-1 pb-3"
    };

    rsx! {
        aside { class: shell_classes, tabindex: "0", "data-lirox-sidebar-root": "true",
            section { class: "space-y-3",
                div {
                    div { class: "sidebar-heading", "{APP_NAME}" }
                    match sidebar_mode {
                        SidebarMode::Tree => rsx! {
                            ul { class: "sidebar-list",
                                for row in view.tree {
                                    TreeRow { slug: view.slug.clone(), row, on_select_note: on_select_note.clone() }
                                }
                            }
                        },
                        SidebarMode::LabelsNotes => rsx! {
                            LabelsNotesSidebar { view: view.clone(), on_select_note: on_select_note.clone() }
                        },
                        SidebarMode::Files => rsx! {
                            FilesSidebar { view: view.clone(), browser_dir: browser_dir.clone(), on_action: on_action.clone(), on_select_note: on_select_note.clone() }
                        },
                    }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn LabelsNotesSidebar(
    view: WorkspaceView,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    rsx! {
        div { class: "flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden lg:grid lg:grid-cols-[max-content_fit-content(24rem)] lg:gap-2",
            section { class: "min-w-0 w-fit",
                div { class: "sidebar-heading", "Labels" }
                ul { class: "sidebar-list",
                    for label in view.labels {
                        LabelRow { label }
                    }
                }
            }
            section { class: "min-w-0 w-full max-w-[24rem] lg:border-l lg:border-shell-border/60 lg:pl-2",
                div { class: "sidebar-heading", "Notes" }
                ul { class: "sidebar-list",
                    for note in view.notes {
                        NoteRow { slug: view.slug.clone(), note, on_select_note: on_select_note.clone() }
                    }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn FilesSidebar(
    view: WorkspaceView,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let entries = directory_entries(&view.notes, &browser_dir);
    let has_parent = !browser_dir.is_empty();
    let directory_label = if browser_dir.is_empty() {
        "/"
    } else {
        browser_dir.as_str()
    };

    rsx! {
        div { class: "space-y-3",
            div { class: "sidebar-heading", "{directory_label}" }
            ul { class: "sidebar-list",
                if has_parent {
                    li {
                        button { class: "sidebar-nav-button", onclick: move |_| if let Some(on_action) = &on_action { on_action.call(AppAction::GoUpDirectory) }, ".." }
                    }
                }
                for entry in entries {
                    BrowserEntryRow { slug: view.slug.clone(), notes: view.notes.clone(), kind: entry.kind, path: entry.path, label: entry.label, on_action: on_action.clone(), on_select_note: on_select_note.clone() }
                }
            }
        }
    }
}

#[allow(dead_code)]
fn parent_directory(path: &str) -> Option<&str> {
    if path.is_empty() {
        None
    } else {
        Some(path.rsplit_once('/').map(|(dir, _)| dir).unwrap_or(""))
    }
}

#[allow(dead_code)]
#[derive(Clone, PartialEq)]
struct BrowserEntry {
    kind: TreeKind,
    label: String,
    path: String,
}

#[allow(dead_code)]
fn directory_entries(notes: &[NoteSummary], directory: &str) -> Vec<BrowserEntry> {
    let mut folders = BTreeSet::new();
    let mut files = Vec::new();
    let prefix = if directory.is_empty() {
        String::new()
    } else {
        format!("{directory}/")
    };

    for note in notes {
        if !directory.is_empty() && !note.path.starts_with(&prefix) {
            continue;
        }

        let rest = if directory.is_empty() {
            note.path.as_str()
        } else {
            &note.path[prefix.len()..]
        };
        let mut parts = rest.split('/');
        let Some(first) = parts.next() else {
            continue;
        };

        if parts.next().is_some() {
            folders.insert(first.to_string());
        } else {
            files.push(BrowserEntry {
                kind: TreeKind::File,
                label: first.to_string(),
                path: note.path.clone(),
            });
        }
    }

    let mut entries: Vec<BrowserEntry> = folders
        .into_iter()
        .map(|folder| BrowserEntry {
            kind: TreeKind::Folder,
            path: if directory.is_empty() {
                folder.clone()
            } else {
                format!("{directory}/{folder}")
            },
            label: folder,
        })
        .collect();
    entries.extend(files);
    entries.sort_by(|a, b| a.label.cmp(&b.label));
    entries
}

#[allow(dead_code)]
#[component]
fn TreeRow(slug: String, row: TreeEntry, on_select_note: Option<EventHandler<String>>) -> Element {
    let indent = if row.depth == 0 { "pl-1" } else { "pl-4" };
    let classes = if row.active {
        "flex items-center sidebar-item-active"
    } else {
        "flex items-center sidebar-item-idle"
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
                        if let Some(on_select_note) = &on_select_note { on_select_note.call(row.path.clone()); }
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

#[allow(dead_code)]
#[component]
fn BrowserEntryRow(
    slug: String,
    notes: Vec<NoteSummary>,
    kind: TreeKind,
    path: String,
    label: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let path_for_action = path.clone();
    let path_for_lookup = path.clone();
    let path_for_fallback = path;
    let label_for_fallback = label.clone();
    match kind {
        TreeKind::Folder => rsx! {
            li {
                button { class: "sidebar-item-button", onclick: move |_| if let Some(on_action) = &on_action { on_action.call(AppAction::SetBrowserDir(path_for_action.clone())) },
                    span { class: "w-4 shrink-0 text-theme-subtle", "󰉋" }
                    span { "{label}" }
                }
            }
        },
        TreeKind::File => {
            let note = notes
                .into_iter()
                .find(|note| note.path == path_for_lookup)
                .unwrap_or(NoteSummary {
                    path: path_for_fallback,
                    title: label_for_fallback,
                    labels: Vec::new(),
                    links: Vec::new(),
                    active: false,
                });

            let classes = if note.active {
                "sidebar-item-active"
            } else {
                "sidebar-item-idle"
            };

            rsx! {
                li {
                    a { class: format!("flex items-center gap-2 px-2 py-1 text-ui {classes}"), href: note_href(&slug, &note.path), onclick: move |event| {
                        event.prevent_default();
                        if let Some(on_select_note) = &on_select_note { on_select_note.call(note.path.clone()); }
                    },
                        span { class: "w-4 shrink-0 text-theme-subtle", "󰈔" }
                        span { class: "truncate font-medium", "{label}" }
                    }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn FileRow(
    slug: String,
    note: NoteSummary,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let classes = if note.active {
        "rounded-md bg-theme-surface/90 text-theme-text"
    } else {
        "rounded-md text-theme-muted hover:bg-theme-surface/60 hover:text-theme-text"
    };

    rsx! {
        li {
            a { class: format!("block px-2 py-1 text-ui {classes}"), href: note_href(&slug, &note.path), onclick: move |event| {
                event.prevent_default();
                if let Some(on_select_note) = &on_select_note { on_select_note.call(note.path.clone()); }
            },
                div { class: "flex items-center justify-between gap-2",
                    span { class: "truncate font-medium", "{note.title}" }
                    span { class: "note-path", "{note.path}" }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn LabelRow(label: LabelSummary) -> Element {
    let depth = label.name.matches('/').count();
    let indent = if depth == 0 { "pl-1" } else { "pl-4" };

    rsx! {
        li {
            div { class: format!("flex items-center justify-between rounded-md {indent} pr-2 py-px text-ui text-theme-muted"),
                span { class: "truncate", "{label.name}" }
                span { class: "note-path", "{label.count}" }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn NoteRow(
    slug: String,
    note: NoteSummary,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let classes = if note.active {
        "sidebar-item-active"
    } else {
        "sidebar-item-idle"
    };

    rsx! {
        li {
            a { class: format!("block px-2 py-1 text-ui {classes}"), href: note_href(&slug, &note.path), onclick: move |event| {
                event.prevent_default();
                if let Some(on_select_note) = &on_select_note { on_select_note.call(note.path.clone()); }
            },
                div { class: "flex items-center justify-between gap-2",
                    span { class: "truncate font-medium", "{note.title}" }
                    span { class: "note-path", "{note.path}" }
                }
                div { class: "mt-0.5 flex flex-wrap gap-1",
                    for label in note.labels.iter().take(3) {
                        span { class: "note-label-chip", "{label}" }
                    }
                }
            }
        }
    }
}

#[component]
pub(crate) fn TopBar(workspace_name: String, note_title: String, source: String) -> Element {
    rsx! {
        header { class: "topbar-shell",
            div { class: "flex items-center px-3",
                button { class: "topbar-workspace-button",
                    span { class: "font-icon w-3 shrink-0 text-center text-theme-subtle", "󰙅" }
                    span { class: "truncate", "{workspace_name}" }
                }
            }
            div { class: "flex min-w-0 items-center justify-between gap-3 px-3 lg:px-4",
                div { class: "flex min-w-0 items-center gap-2 text-ui",
                    // span { class: "h-1.5 w-1.5 shrink-0 rounded-full bg-theme-warn" }
                    // h1 { class: "truncate font-medium text-theme-text", "data-lirox-note-title": "true", "{note_title}" }
                }
                div { class: "flex shrink-0 items-center gap-2 text-[11px] text-theme-subtle",
                    // button { class: "topbar-action", type: "button", "data-lirox-save-button": "true", "Saved" }
                    // form { method: "post", action: "/logout",
                    //     button { class: "topbar-action", type: "submit", "Logout" }
                    // }
                    span { "{source}" }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
pub(crate) fn EditorPane(
    view: WorkspaceView,
    on_action: Option<EventHandler<AppAction>>,
) -> Element {
    let _ = on_action;

    rsx! {
        section { class: "flex h-full min-h-0 flex-col pt-4 bg-shell-editor",
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

#[allow(dead_code)]
#[component]
pub(crate) fn StatusBar(
    note_path: String,
    branch: String,
    changed_notes: usize,
    note_count: usize,
    source: String,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    on_action: Option<EventHandler<AppAction>>,
) -> Element {
    let focused = matches!(focus, FocusTarget::Sidebar);
    rsx! {
        footer { class: "statusbar-shell",
            div { class: "flex items-center justify-between px-2",
                div { class: "flex items-center gap-1.5",
                    ModeButton { label: "󰙅", title: "Tree", active: matches!(sidebar_mode, SidebarMode::Tree), action: AppAction::SetSidebarMode(SidebarMode::Tree), on_action: on_action.clone() }
                    ModeButton { label: "󰓹", title: "Labels + Notes", active: matches!(sidebar_mode, SidebarMode::LabelsNotes), action: AppAction::SetSidebarMode(SidebarMode::LabelsNotes), on_action: on_action.clone() }
                    ModeButton { label: "󱞁", title: "Files", active: matches!(sidebar_mode, SidebarMode::Files), action: AppAction::SetSidebarMode(SidebarMode::Files), on_action: on_action.clone() }
                }
                span { class: "flex items-center gap-1 text-theme-subtle",
                    span { class: "font-icon text-[10px]", if focused { "󰟝" } else { "󰙅" } }
                    span { if focused { "Focused" } else { "Sidebar" } }
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

#[allow(dead_code)]
#[component]
fn ModeButton(
    label: &'static str,
    title: &'static str,
    active: bool,
    action: AppAction,
    on_action: Option<EventHandler<AppAction>>,
) -> Element {
    let classes = if active {
        "flex h-6 w-6 items-center justify-center rounded bg-theme-surface-alt text-[10px] font-semibold text-theme-text"
    } else {
        "flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold text-theme-subtle transition hover:bg-theme-surface hover:text-theme-text"
    };

    rsx! {
        button { class: classes, title: title, aria_label: title, onclick: move |_| if let Some(on_action) = &on_action { on_action.call(action.clone()) }, "{label}" }
    }
}

#[allow(dead_code)]
#[component]
fn StatusPill(icon: &'static str, label: String) -> Element {
    rsx! {
        span { class: "status-pill",
            span { class: "font-icon w-3 shrink-0 text-center text-[10px] text-theme-accent/70", "{icon}" }
            span { "data-lirox-changed-count": "true", "{label}" }
        }
    }
}
