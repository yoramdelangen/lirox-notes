//! Pure view models for the TUI surfaces: tree guides, the outline and
//! command-palette results. Kept free of Dioxus so they can be unit tested.

use std::collections::BTreeSet;

use liroxnotes_shared::{TreeEntry, TreeKind};

use crate::app::ActionMenu;
use crate::command::CommandArgs;
use crate::theme::theme_presets;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TreeRow {
    pub path: String,
    pub name: String,
    pub dir: bool,
    pub open: bool,
    /// Box-drawing prefix such as `│  ├─ `.
    pub guide: String,
}

/// Flattens the pre-ordered tree into visible rows with `├─`/`└─` guides,
/// skipping everything below a collapsed folder.
pub fn tree_rows(entries: &[TreeEntry], collapsed: &BTreeSet<String>) -> Vec<TreeRow> {
    let mut rows = Vec::new();
    // For each depth, whether the ancestor at that depth was the last sibling.
    let mut last_at_depth: Vec<bool> = Vec::new();
    let mut hidden_below: Option<usize> = None;

    for (index, entry) in entries.iter().enumerate() {
        let depth = entry.depth;
        let is_last = entries[index + 1..]
            .iter()
            .find(|next| next.depth <= depth)
            .is_none_or(|next| next.depth < depth);
        last_at_depth.truncate(depth);
        let mut guide: String = last_at_depth
            .iter()
            .map(|last| if *last { "   " } else { "│  " })
            .collect();
        guide.push_str(if is_last { "└─ " } else { "├─ " });
        last_at_depth.push(is_last);

        if let Some(hidden) = hidden_below {
            if depth > hidden {
                continue;
            }
            hidden_below = None;
        }

        let dir = entry.kind == TreeKind::Folder;
        let open = dir && !collapsed.contains(&entry.path);
        if dir && !open {
            hidden_below = Some(depth);
        }
        rows.push(TreeRow {
            path: entry.path.clone(),
            name: entry.label.clone(),
            dir,
            open,
            guide,
        });
    }
    rows
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OutlineItem {
    pub level: usize,
    pub text: String,
    /// 1-based line number in the document.
    pub line: usize,
}

/// H1–H3 headings outside fenced code blocks.
pub fn outline(document: &str) -> Vec<OutlineItem> {
    let mut items = Vec::new();
    let mut in_fence = false;
    for (index, line) in document.lines().enumerate() {
        if line.trim_start().starts_with("```") {
            in_fence = !in_fence;
            continue;
        }
        if in_fence {
            continue;
        }
        let level = line.chars().take_while(|ch| *ch == '#').count();
        if (1..=3).contains(&level) && line[level..].starts_with(' ') {
            items.push(OutlineItem {
                level,
                text: line[level + 1..].trim().to_string(),
                line: index + 1,
            });
        }
    }
    items
}

/// The heading the cursor is under, if any.
pub fn current_outline_index(items: &[OutlineItem], cursor_line: usize) -> Option<usize> {
    items.iter().rposition(|item| item.line <= cursor_line)
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct MenuItem {
    pub label: &'static str,
    /// The editor action it runs, see `Effect::EditorAction`.
    pub action: &'static str,
    /// The Markdown or key it stands for, shown on the right.
    pub syntax: &'static str,
}

const fn item(label: &'static str, action: &'static str, syntax: &'static str) -> MenuItem {
    MenuItem {
        label,
        action,
        syntax,
    }
}

pub fn action_menu_title(menu: ActionMenu) -> &'static str {
    match menu {
        ActionMenu::Heading => "Heading",
        ActionMenu::Lists => "Lists",
        ActionMenu::Format => "Format",
        ActionMenu::More => "More",
    }
}

const HEADING_MENU: &[MenuItem] = &[
    item("Heading 1", "h1", "#"),
    item("Heading 2", "h2", "##"),
    item("Heading 3", "h3", "###"),
    item("Paragraph", "p", ""),
];

const LISTS_MENU: &[MenuItem] = &[
    item("Bullets", "ul", "-"),
    item("Numbered", "ol", "1."),
    item("Tasks", "task", "- [ ]"),
    item("Toggle done", "done", "x"),
];

const FORMAT_MENU: &[MenuItem] = &[
    item("Strikethrough", "strike", "~~"),
    item("Inline code", "code", "`"),
    item("Highlight", "mark", "=="),
    item("Quote", "quote", ">"),
];

const MORE_MENU: &[MenuItem] = &[
    item("Indent", "indent", "tab"),
    item("Outdent", "outdent", "⇧tab"),
    item("Code block", "fence", "```"),
    item("Divider", "hr", "---"),
    item("Undo", "undo", "u"),
    item("Redo", "redo", "^r"),
];

pub fn action_menu_items(menu: ActionMenu) -> &'static [MenuItem] {
    match menu {
        ActionMenu::Heading => HEADING_MENU,
        ActionMenu::Lists => LISTS_MENU,
        ActionMenu::Format => FORMAT_MENU,
        ActionMenu::More => MORE_MENU,
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PaletteItem {
    /// The folder of a note, or `> ` for a command.
    pub prefix: String,
    pub label: String,
    pub hint: String,
    pub command: &'static str,
    pub args: CommandArgs,
}

fn fuzzy_match(candidate: &str, query: &str) -> bool {
    let mut wanted = query.chars().peekable();
    for ch in candidate.chars().flat_map(char::to_lowercase) {
        if wanted.peek() == Some(&ch) {
            wanted.next();
        }
    }
    wanted.peek().is_none()
}

/// Notes matching `query` by subsequence, or commands when it starts with `>`.
pub fn palette_items(query: &str, notes: &[String], vim_enabled: bool) -> Vec<PaletteItem> {
    let query = query.trim().to_lowercase();
    if let Some(command_query) = query.strip_prefix('>') {
        let command_query = command_query.trim();
        let mut commands: Vec<(String, &'static str, CommandArgs)> = theme_presets()
            .into_iter()
            .map(|preset| {
                (
                    format!("theme: {} ({})", preset.name.to_lowercase(), preset.format),
                    "theme.select",
                    CommandArgs::Text(preset.id.into()),
                )
            })
            .collect();
        let vim_label = if vim_enabled {
            "vim mode: off"
        } else {
            "vim mode: on"
        };
        commands.extend([
            (
                vim_label.to_string(),
                "editor.toggle_vim",
                CommandArgs::None,
            ),
            (
                "toggle action bar".into(),
                "ui.toggle_action_bar",
                CommandArgs::None,
            ),
            (
                "show keys".into(),
                "ui.toggle_cheat_sheet",
                CommandArgs::None,
            ),
            (
                "file tree".into(),
                "workspace.toggle_file_tree",
                CommandArgs::None,
            ),
            ("git: commit & push".into(), "git.push", CommandArgs::None),
            ("git: pull".into(), "git.pull", CommandArgs::None),
            (
                "git status".into(),
                "ui.toggle_popover",
                CommandArgs::Text("git".into()),
            ),
            ("settings".into(), "ui.show_settings", CommandArgs::None),
            ("outline".into(), "ui.toggle_outline", CommandArgs::None),
        ]);
        return commands
            .into_iter()
            .filter(|(label, _, _)| label.contains(command_query))
            .map(|(label, command, args)| PaletteItem {
                prefix: "> ".into(),
                label,
                hint: "cmd".into(),
                command,
                args,
            })
            .collect();
    }

    notes
        .iter()
        .filter(|path| fuzzy_match(path, &query))
        .take(12)
        .map(|path| {
            let split = path.rfind('/').map_or(0, |index| index + 1);
            PaletteItem {
                prefix: path[..split].to_string(),
                label: path[split..].to_string(),
                hint: String::new(),
                command: "file_tree.open_path",
                args: CommandArgs::Text(path.clone()),
            }
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(kind: TreeKind, path: &str, depth: usize) -> TreeEntry {
        TreeEntry {
            kind,
            label: path.rsplit('/').next().unwrap().into(),
            path: path.into(),
            depth,
            active: false,
        }
    }

    fn sample_tree() -> Vec<TreeEntry> {
        vec![
            entry(TreeKind::Folder, "cyber", 0),
            entry(TreeKind::File, "cyber/README.md", 1),
            entry(TreeKind::Folder, "personal", 0),
            entry(TreeKind::Folder, "personal/ideas", 1),
            entry(TreeKind::File, "personal/ideas/README.md", 2),
            entry(TreeKind::File, "personal/README.md", 1),
            entry(TreeKind::File, "todo.md", 0),
        ]
    }

    #[test]
    fn tree_rows_draw_box_guides_for_siblings_and_ancestors() {
        let rows = tree_rows(&sample_tree(), &BTreeSet::new());
        let guides: Vec<_> = rows.iter().map(|row| row.guide.as_str()).collect();
        assert_eq!(
            guides,
            [
                "├─ ",
                "│  └─ ",
                "├─ ",
                "│  ├─ ",
                "│  │  └─ ",
                "│  └─ ",
                "└─ "
            ]
        );
    }

    #[test]
    fn collapsed_folders_hide_their_descendants_only() {
        let collapsed = BTreeSet::from(["personal".to_string()]);
        let rows = tree_rows(&sample_tree(), &collapsed);
        let paths: Vec<_> = rows.iter().map(|row| row.path.as_str()).collect();
        assert_eq!(paths, ["cyber", "cyber/README.md", "personal", "todo.md"]);
        assert!(!rows[2].open);
    }

    #[test]
    fn outline_skips_code_fences_and_deep_headings() {
        let doc = "# Title\ntext\n## Roadmap\n```sh\n# comment\n```\n#### deep\n### Stack";
        let items = outline(doc);
        assert_eq!(
            items,
            vec![
                OutlineItem {
                    level: 1,
                    text: "Title".into(),
                    line: 1
                },
                OutlineItem {
                    level: 2,
                    text: "Roadmap".into(),
                    line: 3
                },
                OutlineItem {
                    level: 3,
                    text: "Stack".into(),
                    line: 8
                },
            ]
        );
        assert_eq!(current_outline_index(&items, 4), Some(1));
        assert_eq!(current_outline_index(&items, 1), Some(0));
    }

    #[test]
    fn palette_fuzzy_matches_note_paths_and_splits_folder() {
        let notes = vec![
            "personal/projects/lirox-notes/README.md".to_string(),
            "cyber/security-tools.md".to_string(),
        ];
        let items = palette_items("read", &notes, true);
        assert_eq!(items.len(), 1);
        assert_eq!(items[0].prefix, "personal/projects/lirox-notes/");
        assert_eq!(items[0].label, "README.md");
        assert_eq!(items[0].command, "file_tree.open_path");
    }

    #[test]
    fn palette_lists_commands_after_a_chevron() {
        let items = palette_items("> theme: drac", &[], true);
        assert_eq!(items.len(), 1);
        assert_eq!(items[0].label, "theme: dracula (base24)");
        assert_eq!(items[0].args, CommandArgs::Text("dracula".into()));
        assert!(palette_items(">", &[], false)
            .iter()
            .any(|item| item.label == "vim mode: on"));
    }
}
