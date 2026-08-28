use crate::{AppAction, FocusTarget, SidebarMode};
use dioxus::prelude::*;
use liroxnotes_shared::{LabelSummary, NoteSummary, TreeEntry, TreeKind, WorkspaceView, APP_NAME};
use std::collections::BTreeSet;

#[derive(Clone, Copy, PartialEq, Eq)]
enum SidebarView {
    FileTree,
    Oil,
    LabelsNotes,
    Files,
}

impl SidebarView {
    fn from_mode(mode: SidebarMode) -> Self {
        match mode {
            SidebarMode::Tree => Self::FileTree,
            SidebarMode::LabelsNotes => Self::LabelsNotes,
            SidebarMode::Files => Self::Files,
        }
    }
}

#[component]
fn DirtyMarker(note_path: String) -> Element {
    rsx! {
        span {
            class: "ml-auto shrink-0 text-theme-accent/70",
            "data-lirox-sidebar-dirty": "true",
            "data-note-path": note_path,
        }
    }
}

fn note_href(slug: &str, path: &str) -> String {
    format!("/workspace/{slug}/note/{path}")
}

fn sidebar_label(label: &str) -> String {
    label.strip_suffix(".md").unwrap_or(label).to_string()
}

fn folder_note_path(notes: &[NoteSummary], folder_path: &str) -> Option<String> {
    let folder_name = folder_path.rsplit('/').next().unwrap_or(folder_path);
    let readme = format!("{folder_path}/README.md");
    let same_name = format!("{folder_path}/{folder_name}.md");

    if notes.iter().any(|note| note.path == readme) {
        Some(readme)
    } else if notes.iter().any(|note| note.path == same_name) {
        Some(same_name)
    } else {
        None
    }
}

fn default_folder_note_path(folder_path: &str) -> String {
    format!("{folder_path}/README.md")
}

fn root_sidebar_notes(notes: &[NoteSummary]) -> Vec<NoteSummary> {
    ["README.md", "HOME.md"]
        .into_iter()
        .filter_map(|path| notes.iter().find(|note| note.path == path).cloned())
        .collect()
}

fn hidden_sidebar_note_path(notes: &[NoteSummary], path: &str) -> bool {
    if matches!(path, "README.md" | "HOME.md") {
        return true;
    }

    let Some((dir, file)) = path.rsplit_once('/') else {
        return false;
    };
    let folder_name = dir.rsplit('/').next().unwrap_or(dir);

    matches!(file, "README.md")
        || (file == format!("{folder_name}.md")
            && folder_note_path(notes, dir).as_deref() == Some(path))
}

fn visible_sidebar_notes(notes: &[NoteSummary]) -> Vec<NoteSummary> {
    notes
        .iter()
        .filter(|note| !hidden_sidebar_note_path(notes, &note.path))
        .cloned()
        .collect()
}

fn visible_tree_rows(notes: &[NoteSummary], rows: &[TreeEntry]) -> Vec<TreeEntry> {
    rows
        .iter()
        .filter(|row| row.kind != TreeKind::File || !hidden_sidebar_note_path(notes, &row.path))
        .cloned()
        .collect()
}

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
    let sidebar_view = SidebarView::from_mode(sidebar_mode);
    let root_notes = root_sidebar_notes(&view.notes);
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
                    if !root_notes.is_empty() {
                        ul { class: "sidebar-list",
                            for note in root_notes {
                                RootNoteRow { slug: view.slug.clone(), note, on_select_note: on_select_note.clone() }
                            }
                        }
                    }
                    match sidebar_view {
                        SidebarView::FileTree => rsx! {
                            FileTreeSidebar { view: view.clone(), on_select_note: on_select_note.clone() }
                        },
                        SidebarView::Oil => rsx! {
                            OilSidebar { view: view.clone(), browser_dir, on_action: on_action.clone(), on_select_note: on_select_note.clone() }
                        },
                        SidebarView::LabelsNotes => rsx! {
                            LabelsNotesSidebar { view: view.clone(), on_select_note: on_select_note.clone() }
                        },
                        SidebarView::Files => rsx! {
                            FilesListSidebar { view: view.clone(), on_select_note: on_select_note.clone() }
                        },
                    }
                }
            }
        }
    }
}

#[component]
fn FileTreeSidebar(
    view: WorkspaceView,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let rows = visible_tree_rows(&view.notes, &view.tree);

    rsx! {
        ul { class: "sidebar-list",
            for row in rows {
                TreeRow { slug: view.slug.clone(), notes: view.notes.clone(), selected_note_path: view.selected_note.path.clone(), row, on_select_note: on_select_note.clone() }
            }
        }
    }
}

#[component]
fn LabelsNotesSidebar(
    view: WorkspaceView,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let notes = visible_sidebar_notes(&view.notes);

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
                    for note in notes {
                        NoteRow { slug: view.slug.clone(), note, on_select_note: on_select_note.clone() }
                    }
                }
            }
        }
    }
}

#[component]
fn OilSidebar(
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

#[component]
fn FilesListSidebar(
    view: WorkspaceView,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let notes = visible_sidebar_notes(&view.notes);

    rsx! {
        div { class: "space-y-3",
            div { class: "sidebar-heading", "Files" }
            ul { class: "sidebar-list",
                for note in notes {
                    FileRow { slug: view.slug.clone(), note, on_select_note: on_select_note.clone() }
                }
            }
        }
    }
}

fn parent_directory(path: &str) -> Option<&str> {
    if path.is_empty() {
        None
    } else {
        Some(path.rsplit_once('/').map(|(dir, _)| dir).unwrap_or(""))
    }
}

#[derive(Clone, PartialEq)]
struct BrowserEntry {
    kind: TreeKind,
    label: String,
    path: String,
}

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
            if hidden_sidebar_note_path(notes, &note.path) {
                continue;
            }
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

#[component]
fn RootNoteRow(slug: String, note: NoteSummary, on_select_note: Option<EventHandler<String>>) -> Element {
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
                    span { class: "truncate font-medium", "{sidebar_label(&note.path)}" }
                    DirtyMarker { note_path: note.path.clone() }
                }
            }
        }
    }
}

#[component]
fn TreeRow(
    slug: String,
    notes: Vec<NoteSummary>,
    selected_note_path: String,
    row: TreeEntry,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let indent = if row.depth == 0 { "pl-1" } else { "pl-4" };
    let icon = match row.kind {
        TreeKind::Folder => "▸",
        TreeKind::File => "",
    };
    let row_path = row.path.clone();
    let folder_target = folder_note_path(&notes, &row.path)
        .unwrap_or_else(|| default_folder_note_path(&row.path));
    let active = if row.kind == TreeKind::Folder {
        folder_target == selected_note_path
    } else {
        row.active
    };
    let classes = if active {
        "flex items-center sidebar-item-active"
    } else {
        "flex items-center sidebar-item-idle"
    };
    let label = sidebar_label(&row.label);

    rsx! {
        li {
            div { class: "flex items-center gap-2 py-px text-ui",
                if row.kind == TreeKind::File {
                    a { class: format!("{classes} w-full {indent} pr-2"), href: note_href(&slug, &row.path), onclick: move |event| {
                        event.prevent_default();
                        if let Some(on_select_note) = &on_select_note { on_select_note.call(row.path.clone()); }
                    },
                        span { class: "w-3 shrink-0 text-theme-subtle", "{icon}" }
                        span { class: "truncate", "{label}" }
                        DirtyMarker { note_path: row_path }
                    }
                } else {
                    a { class: format!("{classes} w-full {indent} pr-2"), href: note_href(&slug, &folder_target), onclick: move |event| {
                        event.prevent_default();
                        if let Some(on_select_note) = &on_select_note { on_select_note.call(folder_target.clone()); }
                    },
                        span { class: "w-3 shrink-0 text-theme-subtle", "{icon}" }
                        span { class: "truncate", "{label}" }
                    }
                }
            }
        }
    }
}

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
    let display_label = sidebar_label(&label);
    match kind {
        TreeKind::Folder => {
            let folder_target = folder_note_path(&notes, &path_for_lookup);

            rsx! {
                li {
                    if let Some(target) = folder_target {
                        a { class: "sidebar-item-button", href: note_href(&slug, &target), onclick: move |event| {
                            event.prevent_default();
                            if let Some(on_select_note) = &on_select_note { on_select_note.call(target.clone()); }
                        },
                            span { class: "w-4 shrink-0 text-theme-subtle", "󰉋" }
                            span { "{display_label}" }
                        }
                    } else {
                        button { class: "sidebar-item-button", onclick: move |_| if let Some(on_action) = &on_action { on_action.call(AppAction::SetBrowserDir(path_for_action.clone())) },
                            span { class: "w-4 shrink-0 text-theme-subtle", "󰉋" }
                            span { "{display_label}" }
                        }
                    }
                }
            }
        }
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
            let note_path = note.path.clone();

            rsx! {
                li {
                    a { class: format!("flex items-center gap-2 px-2 py-1 text-ui {classes}"), href: note_href(&slug, &note.path), onclick: move |event| {
                        event.prevent_default();
                        if let Some(on_select_note) = &on_select_note { on_select_note.call(note.path.clone()); }
                    },
                        span { class: "w-4 shrink-0 text-theme-subtle", "󰈔" }
                        span { class: "truncate font-medium", "{display_label}" }
                        DirtyMarker { note_path }
                    }
                }
            }
        }
    }
}

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
                    div { class: "flex items-center gap-2",
                        DirtyMarker { note_path: note.path.clone() }
                        span { class: "note-path", "{note.path}" }
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
                span { class: "note-path", "{label.count}" }
            }
        }
    }
}

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
                    div { class: "flex items-center gap-2",
                        DirtyMarker { note_path: note.path.clone() }
                        span { class: "note-path", "{note.path}" }
                    }
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

#[component]
pub(crate) fn EditorPane(
    view: WorkspaceView,
    on_action: Option<EventHandler<AppAction>>,
) -> Element {
    let _ = on_action;
    let virtual_note = !view
        .tree
        .iter()
        .any(|row| row.kind == TreeKind::File && row.path == view.selected_note.path);

    rsx! {
        section { class: "flex h-full min-h-0 flex-col pt-4 bg-shell-editor",
            div {
                class: "min-h-0 flex-1 w-full font-mono text-ui leading-6 text-theme-text",
                "data-lirox-editor-root": "true",
                "data-note-path": view.selected_note.path,
                "data-note-title": view.selected_note.title,
                "data-initial-doc": view.selected_note_body,
                "data-virtual-note": if virtual_note { "true" } else { "false" },
                "data-line-numbers": "false",
                "data-writing-width": "650px",
                aria_label: "Markdown editor"
            }
        }
    }
}

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
                ChangeStatusPill { changed_notes }
                StatusPill { icon: "󰎄", label: note_count.to_string() }
                StatusPill { icon: "󱁕", label: source }
            }
        }
    }
}

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

#[component]
fn ChangeStatusPill(changed_notes: usize) -> Element {
    let label = if changed_notes == 1 {
        "1 change".to_string()
    } else {
        format!("{changed_notes} changes")
    };

    rsx! {
        span { class: "status-pill",
            span { class: "font-icon w-3 shrink-0 text-center text-[10px] text-theme-accent/70", "+" }
            span { "data-lirox-change-label": "true", "{label}" }
        }
    }
}

#[component]
fn StatusPill(icon: &'static str, label: String) -> Element {
    rsx! {
        span { class: "status-pill",
            span { class: "font-icon w-3 shrink-0 text-center text-[10px] text-theme-accent/70", "{icon}" }
            span { "{label}" }
        }
    }
}
