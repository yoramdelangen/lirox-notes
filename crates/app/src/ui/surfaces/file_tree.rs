use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    app::{AuthCommand, Popover, SidebarTab},
    command::{CommandArgs, SurfaceId},
    input::InputMode,
    theme::{active_preset_id, theme_presets},
    ui::{
        actions::{run, text},
        model::tree_rows,
    },
    AppContext, FocusTarget, SidebarMode,
};

#[component]
pub fn FileTreeSurface(
    view: WorkspaceView,
    active: bool,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    #[props(default = false)] in_sheet: bool,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let _ = (focus, sidebar_mode);
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let (tab, popover) = {
        let state = state.read();
        (state.ui.sidebar_tab, state.ui.popover)
    };

    // Take keyboard focus when the tree becomes the active surface (⌘\), so
    // j/k/h/l reach the shell's keymap instead of the editor.
    let mut element = use_signal(|| None::<std::rc::Rc<MountedData>>);
    let tree_active =
        use_memo(move || state.read().workspace.focus.active_surface == SurfaceId::FILE_TREE);
    use_effect(move || {
        if tree_active() {
            if let Some(element) = element() {
                spawn(async move {
                    let _ = element.set_focus(true).await;
                });
            }
        }
    });

    rsx! {
        aside {
            class: if in_sheet { "lx-sidebar lx-in-sheet" } else { "lx-sidebar" },
            tabindex: "-1",
            aria_label: "Workspace",
            onmounted: move |event| element.set(Some(event.data())),
            onpointerdown: move |_| {
                let mut state = state.write();
                state.workspace.focus.active_surface = SurfaceId::FILE_TREE;
                state.input.mode = InputMode::Normal;
            },
            SidebarHeader { view: view.clone(), in_sheet, popover }
            if popover == Some(Popover::Git) {
                GitPopover { view: view.clone() }
            }
            if popover == Some(Popover::Workspaces) {
                WorkspacesPopover {}
            }
            match tab {
                SidebarTab::Files => rsx! { FileTreeList { view: view.clone(), active, on_select_note } },
                SidebarTab::Settings => rsx! { SettingsPanel { view: view.clone() } },
            }
            UserBar { popover }
        }
    }
}

#[component]
fn SidebarHeader(view: WorkspaceView, in_sheet: bool, popover: Option<Popover>) -> Element {
    let context = use_context::<AppContext>();
    let close = context.clone();
    let workspaces = context.clone();
    let git = context.clone();
    let changed = view.changed_notes;

    rsx! {
        div { class: "lx-sidebar-head",
            if in_sheet {
                button {
                    class: "lx-icon-btn",
                    style: "font-size: 13px",
                    r#type: "button",
                    aria_label: "Close file tree",
                    onclick: move |_| run(&close, "workspace.toggle_file_tree", CommandArgs::None),
                    "✕"
                }
            }
            button {
                r#type: "button",
                class: if popover == Some(Popover::Workspaces) { "lx-chip is-open" } else { "lx-chip" },
                aria_label: "Switch workspace",
                aria_expanded: "{popover == Some(Popover::Workspaces)}",
                onclick: move |_| run(&workspaces, "ui.toggle_popover", text("workspaces")),
                span { class: "lx-chip-label", "{view.name}" }
                span { class: "lx-tool-caret", "▾" }
            }
            div { style: "flex: 1" }
            button {
                r#type: "button",
                class: if popover == Some(Popover::Git) { "lx-chip lx-chip-git is-open" } else { "lx-chip lx-chip-git" },
                title: "Git",
                aria_label: "Git: {view.unpushed_commits} unpushed commits, {changed} uncommitted notes",
                onclick: move |_| run(&git, "ui.toggle_popover", text("git")),
                span { "⎇ {view.branch}" }
                span { "↑{view.unpushed_commits}" }
                if changed > 0 {
                    span { class: "lx-mod", "M{changed}" }
                }
            }
        }
    }
}

#[component]
fn GitPopover(view: WorkspaceView) -> Element {
    let context = use_context::<AppContext>();
    let close = context.clone();
    let pull = context.clone();
    let push = context.clone();
    let changed = view.changed_notes;

    rsx! {
        div { class: "lx-popover", role: "dialog", aria_label: "Git",
            div { class: "lx-legend", "Git" }
            button {
                class: "lx-close",
                r#type: "button",
                onclick: move |_| run(&close, "ui.toggle_popover", text("git")),
                "esc ✕"
            }
            div { class: "lx-git-body",
                div { style: "display: flex; justify-content: space-between; color: var(--dim)",
                    span { "⎇ {view.branch} → origin" }
                    span { "↑{view.unpushed_commits}" }
                }
                div { class: "lx-rule", style: "padding-top: 8px",
                    if changed > 0 {
                        div { style: "display: flex; gap: 10px",
                            span { class: "lx-mod", "M" }
                            span { "{changed} uncommitted note(s)" }
                        }
                    } else {
                        div { class: "lx-hint", style: "font-size: 12.5px", "working tree clean" }
                    }
                }
                div { style: "display: flex; gap: 10px",
                    button {
                        class: "lx-btn",
                        style: "flex: 1",
                        r#type: "button",
                        onclick: move |_| run(&pull, "git.pull", CommandArgs::None),
                        "Pull"
                    }
                    button {
                        class: "lx-btn-primary",
                        style: "flex: 1.6",
                        r#type: "button",
                        onclick: move |_| run(&push, "git.push", CommandArgs::None),
                        "Commit & push"
                    }
                }
            }
        }
    }
}

#[component]
fn WorkspacesPopover() -> Element {
    let context = use_context::<AppContext>();
    let (registered, available) = {
        let state = context.state.read();
        (
            state.auth.registered_workspaces.clone(),
            state.auth.existing_workspaces.clone(),
        )
    };
    let mut repositories: Vec<String> = registered.iter().map(|w| w.repository.clone()).collect();
    repositories.dedup();
    let close = context.clone();
    let add = context.clone();

    rsx! {
        div { class: "lx-popover lx-ws-popover", style: "z-index: 21", role: "dialog", aria_label: "Workspaces",
            div { class: "lx-legend", "Workspaces" }
            button {
                class: "lx-close",
                r#type: "button",
                onclick: move |_| run(&close, "ui.toggle_popover", text("workspaces")),
                "esc ✕"
            }
            div { style: "display: flex; flex-direction: column; gap: 14px; padding: 20px 0 6px",
                if registered.is_empty() && available.is_empty() {
                    div { class: "lx-hint", style: "padding: 0 14px", "loading…" }
                }
                for repository in repositories {
                    {
                        let members: Vec<_> = registered.iter().filter(|w| w.repository == repository).cloned().collect();
                        let count = members.len();
                        rsx! {
                            div { key: "{repository}", style: "display: flex; flex-direction: column",
                                div { class: "lx-ws-group-label", "{repository}" }
                                for (index, workspace) in members.into_iter().enumerate() {
                                    {
                                        let context = context.clone();
                                        let guide = if index + 1 == count { "└─" } else { "├─" };
                                        let location = if workspace.path.is_empty() { "{repo-root}/".to_string() } else { format!("{}/", workspace.path.trim_end_matches('/')) };
                                        rsx! {
                                            button {
                                                key: "{workspace.slug}",
                                                r#type: "button",
                                                class: if workspace.active { "lx-row is-current" } else { "lx-row" },
                                                aria_current: if workspace.active { "true" },
                                                onclick: move |_| {
                                                    let mut state = context.state;
                                                    state.write().ui.popover = None;
                                                    if !workspace.active {
                                                        context.dispatcher.dispatch_auth_command(
                                                            &mut state.write(),
                                                            AuthCommand::SwitchWorkspace(workspace.slug.clone()),
                                                        );
                                                    }
                                                },
                                                span { class: "lx-guide", "{guide}" }
                                                span { class: "lx-key", if workspace.active { "●" } else { "○" } }
                                                span { class: "lx-row-label", "{workspace.name}" }
                                                span { class: "lx-row-hint", "{location}" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if !available.is_empty() {
                    div { style: "display: flex; flex-direction: column",
                        div { class: "lx-ws-group-label", "available in your repositories" }
                        for workspace in available {
                            {
                                let context = context.clone();
                                rsx! {
                                    button {
                                        key: "{workspace.repository}:{workspace.path}",
                                        r#type: "button",
                                        class: "lx-row",
                                        onclick: move |_| {
                                            let fields = crate::auth::SetupFields {
                                                step: crate::auth::SetupStep::Finish,
                                                slug: crate::auth::slug_from_name(&workspace.path),
                                                display_name: String::new(),
                                                name: workspace.path.clone(),
                                                repo_url: String::new(),
                                                repository_path: workspace.repository.clone(),
                                                branch: workspace.branch.clone(),
                                                path: workspace.path.clone(),
                                                remote: true,
                                            };
                                            let mut state = context.state;
                                            state.write().ui.popover = None;
                                            context.dispatcher.dispatch_auth_command(
                                                &mut state.write(),
                                                AuthCommand::CreateWorkspace(fields),
                                            );
                                        },
                                        span { class: "lx-mod", "+" }
                                        span { class: "lx-row-label", "{workspace.path}" }
                                        span { class: "lx-row-hint", "{workspace.repository}" }
                                    }
                                }
                            }
                        }
                    }
                }
                div { class: "lx-rule" }
                button {
                    r#type: "button",
                    class: "lx-row",
                    style: "color: var(--dim)",
                    onclick: move |_| run(&add, "workspace.add", CommandArgs::None),
                    span { class: "lx-mod", "+" }
                    span { class: "lx-row-label", "Add workspace" }
                }
            }
        }
    }
}

#[component]
fn FileTreeList(
    view: WorkspaceView,
    active: bool,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let (rows, current, cursor) = {
        let state = context.state.read();
        let rows = tree_rows(&view.tree, &state.ui.collapsed);
        let cursor = (!state.ui.touch
            && state.workspace.focus.active_surface == SurfaceId::FILE_TREE)
            .then(|| {
                state
                    .workspace
                    .surface(SurfaceId::FILE_TREE)
                    .and_then(|surface| surface.selected_path())
                    .map(str::to_string)
            })
            .flatten();
        (rows, state.domain.selected_note.clone(), cursor)
    };
    let _ = active;

    rsx! {
        div { class: "lx-tree", role: "tree",
            div { class: "lx-tree-root", "~/{view.slug}" }
            if rows.is_empty() {
                div { class: "lx-hint", style: "padding: 4px 16px", "no notes yet" }
            }
            for row in rows {
                {
                    let context = context.clone();
                    let is_current = current.as_deref() == Some(row.path.as_str());
                    let is_cursor = cursor.as_deref() == Some(row.path.as_str());
                    let class = match (is_current, is_cursor) {
                        (true, true) => "lx-tree-row is-current is-cursor",
                        (true, false) => "lx-tree-row is-current",
                        (false, true) => "lx-tree-row is-cursor",
                        (false, false) => "lx-tree-row",
                    };
                    let path = row.path.clone();
                    rsx! {
                        button {
                            key: "{row.path}",
                            r#type: "button",
                            role: "treeitem",
                            class,
                            aria_selected: "{is_current}",
                            aria_expanded: if row.dir { if row.open { "true" } else { "false" } },
                            onclick: move |_| {
                                let mut state = context.state;
                                if let Some(surface) = state.write().workspace.surface_mut(SurfaceId::FILE_TREE) {
                                    surface.select(path.clone());
                                }
                                if row.dir {
                                    run(&context, "file_tree.toggle_folder", text(path.clone()));
                                } else {
                                    if let Some(handler) = on_select_note.as_ref() {
                                        handler.call(path.clone());
                                    }
                                    run(&context, "file_tree.open_path", text(path.clone()));
                                }
                            },
                            span { class: "lx-guide", "{row.guide}" }
                            if row.dir {
                                span { class: "lx-dir", if row.open { "▾ " } else { "▸ " } "{row.name}/" }
                            } else {
                                span { class: "lx-file", "{row.name}" }
                            }
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn SettingsPanel(view: WorkspaceView) -> Element {
    let context = use_context::<AppContext>();
    let (vim, ui, theme, display_name) = {
        let state = context.state.read();
        let theme = state
            .theme_preview
            .clone()
            .unwrap_or_else(|| state.theme.clone());
        let display_name = display_name(&state);
        (
            state.config.editor.vim_mode_enabled,
            state.ui.clone(),
            theme,
            display_name,
        )
    };
    let active_theme = active_preset_id(&theme).map(str::to_string);
    let on_off = |value: bool| if value { "[x]" } else { "[ ]" };
    let back = context.clone();
    let import = context.clone();

    let setting =
        |mark: &str, label: &str, value: &str, command: &'static str, args: CommandArgs| {
            let context = context.clone();
            rsx! {
                button {
                    r#type: "button",
                    class: "lx-setting",
                    onclick: move |_| run(&context, command, args.clone()),
                    span { class: "lx-setting-mark", "{mark}" }
                    span { class: "lx-setting-label", "{label}" }
                    span { class: "lx-setting-value", "{value}" }
                }
            }
        };

    rsx! {
        button {
            r#type: "button",
            class: "lx-settings-head",
            onclick: move |_| run(&back, "ui.show_files", CommandArgs::None),
            span { "‹" }
            strong { "Settings" }
            span { class: "lx-hint", "esc" }
        }
        div { class: "lx-settings",
            div { class: "lx-box",
                div { class: "lx-legend", "Editor" }
                {setting(on_off(vim), "Vim mode", "with keyboard", "editor.toggle_vim", CommandArgs::None)}
                {setting(on_off(ui.action_bar), "Action bar", "⌘.", "ui.toggle_action_bar", CommandArgs::None)}
                {setting(on_off(ui.key_hints), "Key hints", "in action bar", "ui.toggle_key_hints", CommandArgs::None)}
                {setting("   ", "Font size", &format!("‹ {} ›", ui.font_size), "ui.cycle_font_size", CommandArgs::None)}
            }
            div { class: "lx-box",
                div { class: "lx-legend", "Theme" }
                for preset in theme_presets() {
                    {
                        let context = context.clone();
                        let selected = active_theme.as_deref() == Some(preset.id);
                        let swatches: Vec<String> = preset.swatches().iter().map(|color| color.to_string()).collect();
                        rsx! {
                            button {
                                key: "{preset.id}",
                                r#type: "button",
                                class: "lx-setting",
                                aria_pressed: "{selected}",
                                onclick: move |_| run(&context, "theme.select", text(preset.id)),
                                span { class: "lx-setting-mark", if selected { "(•)" } else { "( )" } }
                                span { class: "lx-setting-label", "{preset.name}" }
                                span { class: "lx-swatches",
                                    for color in swatches {
                                        span { style: "background: {color}" }
                                    }
                                }
                                span { class: "lx-setting-value", "{preset.format}" }
                            }
                        }
                    }
                }
                label { class: "lx-setting", style: "cursor: pointer",
                    span { class: "lx-setting-mark", " + " }
                    span { class: "lx-setting-label", "Import theme" }
                    span { class: "lx-setting-value", ".yaml base16/24" }
                    input {
                        r#type: "file",
                        accept: ".yaml,.yml",
                        style: "display: none",
                        onchange: move |event: FormEvent| {
                            let import = import.clone();
                            async move {
                                let Some(file) = event.files().into_iter().next() else {
                                    return;
                                };
                                match file.read_string().await {
                                    Ok(source) => run(&import, "theme.import", text(source)),
                                    Err(error) => {
                                        let mut state = import.state;
                                        state.write().status.message = Some(format!("could not read theme: {error}"));
                                    }
                                }
                            }
                        },
                    }
                }
            }
            div { class: "lx-box",
                div { class: "lx-legend", "Keyboard" }
                {
                    let (mark, value, device) = if ui.touch { (" ○ ", "none", "keyboard") } else { (" ● ", "detected", "touch") };
                    setting(mark, "Hardware keyboard", value, "ui.set_input_device", text(device))
                }
                {setting(" → ", "All shortcuts", "?", "ui.toggle_cheat_sheet", CommandArgs::None)}
            }
            div { class: "lx-box",
                div { class: "lx-legend", "Workspace" }
                {setting("   ", "Name", &view.name, "ui.toggle_popover", text("workspaces"))}
                {setting("   ", "Branch", &view.branch, "ui.toggle_popover", text("git"))}
                {setting(" → ", "Switch workspace", "", "ui.toggle_popover", text("workspaces"))}
                {setting(" + ", "Add workspace", "", "workspace.add", CommandArgs::None)}
            }
            div { class: "lx-box",
                div { class: "lx-legend", "Account" }
                div { class: "lx-setting", style: "cursor: default",
                    span { class: "lx-setting-mark", "   " }
                    span { class: "lx-setting-label", "{display_name}" }
                    span { class: "lx-setting-value", "passkey" }
                }
                LogoutRow {}
            }
            div { class: "lx-settings-note",
                "A physical keypress switches to keyboard mode (Vim, status line, floating action bar). A touch on the text switches back."
            }
        }
    }
}

#[component]
fn LogoutRow() -> Element {
    let context = use_context::<AppContext>();
    rsx! {
        button {
            r#type: "button",
            class: "lx-setting",
            onclick: move |_| crate::auth::dispatch_auth(context.state, context.dispatcher.clone(), AuthCommand::Logout),
            span { class: "lx-setting-mark", " → " }
            span { class: "lx-setting-label", "Log out" }
        }
    }
}

#[component]
fn UserBar(popover: Option<Popover>) -> Element {
    let context = use_context::<AppContext>();
    let (name, note_count) = {
        let state = context.state.read();
        let name = display_name(&state);
        (name, state.domain.notes.len())
    };
    let initial = name
        .chars()
        .next()
        .unwrap_or('?')
        .to_uppercase()
        .to_string();
    let toggle = context.clone();
    let switch = context.clone();
    let settings = context.clone();
    let logout = context.clone();

    rsx! {
        div { class: "lx-userbar",
            span { class: "lx-avatar", "{initial}" }
            span { class: "lx-userbar-name", "{name}" }
            span { class: "lx-userbar-count", "{note_count} notes" }
            button {
                r#type: "button",
                class: "lx-more",
                aria_label: "Open user menu",
                aria_expanded: "{popover == Some(Popover::UserMenu)}",
                onclick: move |_| run(&toggle, "ui.toggle_popover", text("user")),
                "⋮"
            }
            if popover == Some(Popover::UserMenu) {
                div { class: "lx-popover lx-user-menu", role: "menu",
                    button {
                        r#type: "button",
                        role: "menuitem",
                        class: "lx-row",
                        onclick: move |_| run(&switch, "ui.toggle_popover", text("workspaces")),
                        "Switch workspace"
                    }
                    button {
                        r#type: "button",
                        role: "menuitem",
                        class: "lx-row",
                        onclick: move |_| run(&settings, "ui.show_settings", CommandArgs::None),
                        "Settings"
                    }
                    button {
                        r#type: "button",
                        role: "menuitem",
                        class: "lx-row",
                        onclick: move |_| crate::auth::dispatch_auth(logout.state, logout.dispatcher.clone(), AuthCommand::Logout),
                        "Log out"
                    }
                }
            }
        }
    }
}

/// The person's name: from the installation, else what they typed during
/// onboarding, else the account user.
fn display_name(state: &crate::app::ApplicationState) -> String {
    let bootstrap = state.auth.bootstrap.as_ref();
    bootstrap
        .and_then(|bootstrap| bootstrap.display_name.clone())
        .or_else(|| {
            let typed = state.auth.setup.display_name.trim();
            (!typed.is_empty()).then(|| typed.to_string())
        })
        .or_else(|| bootstrap.and_then(|bootstrap| bootstrap.user.clone()))
        .unwrap_or_else(|| "You".into())
}
