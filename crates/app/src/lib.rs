use dioxus::prelude::*;
use liroxnotes_shared::{mock_workspace, APP_NAME};

const APP_CSS: Asset = asset!("/assets/app.css");

#[component]
pub fn App() -> Element {
    let workspace = mock_workspace();
    let note_path = "drafts/mvp-shell.md";
    let note_body = "# MVP shell\n\nThis is the first vertical slice.\n\n- Rust workspace exists\n- Actix serves the app\n- Dioxus renders the shell\n- Tailwind styles the shell\n";

    rsx! {
        document::Link { rel: "icon", href: "data:," }
        document::Stylesheet { href: APP_CSS }
        div { class: "grid h-screen overflow-hidden grid-rows-[2.75rem_minmax(0,1fr)_2.25rem] bg-shell-bg text-theme-text antialiased",
            TopBar { workspace_name: workspace.name, note_path }
            div { class: "grid min-h-0 h-full grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]",
                Sidebar {}
                EditorPane { note_body }
            }
            StatusBar {
                branch: workspace.branch,
                changed_notes: workspace.changed_notes,
                online: true,
            }
        }
    }
}

#[component]
fn Sidebar() -> Element {
    rsx! {
        aside { class: "h-full min-h-0 overflow-auto border-r border-shell-border bg-shell-panel px-3 pt-1 pb-3",
            section {
                div { class: "mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "{APP_NAME}" }
                ul { class: "list-none p-0 text-ui leading-6",
                    TreeRow { label: "drafts", depth: 0, kind: TreeKind::Folder, active: false, changed: false }
                    TreeRow { label: "mvp-shell.md", depth: 1, kind: TreeKind::File, active: true, changed: true }
                    TreeRow { label: "notes", depth: 0, kind: TreeKind::Folder, active: false, changed: false }
                    TreeRow { label: "roadmap.md", depth: 1, kind: TreeKind::File, active: false, changed: false }
                    TreeRow { label: "welcome.md", depth: 1, kind: TreeKind::File, active: false, changed: false }
                }
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

#[derive(Clone, Copy, PartialEq, Eq)]
enum TreeKind {
    Folder,
    File,
}

#[component]
fn TreeRow(label: &'static str, depth: usize, kind: TreeKind, active: bool, changed: bool) -> Element {
    let icon = match kind {
        TreeKind::Folder => "▸",
        TreeKind::File => "",
    };
    let depth_class = match depth {
        0 => "pl-1",
        _ => "pl-4",
    };
    let classes = if active {
        "flex items-center rounded-md bg-theme-surface/90 text-theme-text"
    } else {
        "flex items-center rounded-md text-theme-muted hover:bg-theme-surface/60 hover:text-theme-text"
    };

    rsx! {
        li {
            div { class: "flex items-center gap-2 py-px text-ui",
                div { class: format!("{classes} w-full {depth_class} pr-2"),
                    span { class: "w-3 shrink-0 text-theme-subtle", "{icon}" }
                    span { class: "truncate", "{label}" }
                    if changed {
                        span { class: "ml-auto h-1.5 w-1.5 rounded-full bg-theme-warn" }
                    }
                }
            }
        }
    }
}

#[component]
fn TopBar(workspace_name: &'static str, note_path: &'static str) -> Element {
    rsx! {
        header { class: "grid h-11 grid-cols-1 border-b border-shell-border bg-shell-bg lg:grid-cols-[220px_1fr]",
            div { class: "flex items-center px-3",
                button { class: "flex h-7 min-w-0 items-center gap-2 rounded-md bg-theme-surface/70 px-2 text-[11px] text-theme-muted",
                    span { class: "font-icon w-3 shrink-0 text-center text-theme-subtle", "󰙅" }
                    span { class: "truncate", "{workspace_name}" }
                }
            }
            div { class: "flex min-w-0 items-center justify-between gap-3 px-3 lg:px-4",
                div { class: "flex min-w-0 items-center gap-2 text-ui",
                    span { class: "h-1.5 w-1.5 shrink-0 rounded-full bg-theme-warn" }
                    h1 { class: "truncate font-medium text-theme-text" , "{note_path}" }
                }
                div { class: "shrink-0 text-[11px] text-theme-subtle", "Editing" }
            }
        }
    }
}

#[component]
fn EditorPane(note_body: &'static str) -> Element {
    rsx! {
        section { class: "h-full min-h-0 bg-shell-editor",
            pre { class: "h-full w-full overflow-auto whitespace-pre-wrap border-0 bg-shell-editor px-6 pt-3 pb-5 font-mono text-ui leading-6 text-theme-text outline-none",
                "{note_body}"
            }
        }
    }
}

#[component]
fn StatusBar(branch: &'static str, changed_notes: usize, online: bool) -> Element {
    rsx! {
        footer { class: "grid h-9 grid-cols-1 border-t border-shell-border bg-shell-chrome text-[11px] lg:grid-cols-[220px_1fr]",
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
                StatusPill { icon: "", label: branch.to_string() }
                StatusPill { icon: "+", label: changed_notes.to_string() }
                ConnectivityPill { online }
            }
        }
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

#[component]
fn ConnectivityPill(online: bool) -> Element {
    let dot_class = if online {
        "h-1.5 w-1.5 rounded-full bg-emerald-400"
    } else {
        "h-1.5 w-1.5 rounded-full bg-rose-400"
    };
    let label = if online { "Online" } else { "Offline" };

    rsx! {
        span { class: "flex items-center gap-1 rounded px-2 py-px text-theme-muted",
            span { class: dot_class }
            span { "{label}" }
        }
    }
}
