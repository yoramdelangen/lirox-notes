use std::collections::{BTreeMap, BTreeSet};

pub const APP_NAME: &str = "LiroxNotes";

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum TreeKind {
    Folder,
    File,
}

#[derive(Clone, PartialEq, Eq)]
pub struct TreeEntry {
    pub kind: TreeKind,
    pub label: String,
    pub path: String,
    pub depth: usize,
    pub active: bool,
}

#[derive(Clone, PartialEq, Eq)]
pub struct LabelSummary {
    pub name: String,
    pub count: usize,
}

#[derive(Clone, PartialEq, Eq)]
pub struct NoteSummary {
    pub path: String,
    pub title: String,
    pub labels: Vec<String>,
    pub links: Vec<String>,
    pub active: bool,
}

#[derive(Clone, PartialEq, Eq)]
pub struct WorkspaceView {
    pub slug: String,
    pub name: String,
    pub branch: String,
    pub source: String,
    pub note_count: usize,
    pub changed_notes: usize,
    pub selected_note: NoteSummary,
    pub selected_note_body: String,
    pub tree: Vec<TreeEntry>,
    pub labels: Vec<LabelSummary>,
    pub notes: Vec<NoteSummary>,
}

pub struct NoteRecord {
    pub path: &'static str,
    pub body: &'static str,
}

pub struct DemoWorkspace {
    pub slug: &'static str,
    pub name: &'static str,
    pub branch: &'static str,
    pub source: &'static str,
    pub default_note_path: &'static str,
    pub notes: &'static [NoteRecord],
}

pub const DEMO_WORKSPACE: DemoWorkspace = DemoWorkspace {
    slug: "demo",
    name: "MVP Demo Workspace",
    branch: "demo",
    source: "read-only fixtures",
    default_note_path: "notes/welcome.md",
    notes: &[
        NoteRecord {
            path: "notes/welcome.md",
            body: include_str!("demo_notes/welcome.md"),
        },
        NoteRecord {
            path: "notes/roadmap.md",
            body: include_str!("demo_notes/roadmap.md"),
        },
        NoteRecord {
            path: "notes/overview.md",
            body: include_str!("demo_notes/overview.md"),
        },
        NoteRecord {
            path: "drafts/inbox.md",
            body: include_str!("demo_notes/inbox.md"),
        },
        NoteRecord {
            path: "reference/labels.md",
            body: include_str!("demo_notes/labels.md"),
        },
        NoteRecord {
            path: "reference/loading.md",
            body: include_str!("demo_notes/loading.md"),
        },
    ],
};

pub fn mock_workspace_view(selected_note_path: &str) -> WorkspaceView {
    workspace_view(&DEMO_WORKSPACE, selected_note_path)
}

pub fn workspace_view(workspace: &DemoWorkspace, selected_note_path: &str) -> WorkspaceView {
    let active_path = workspace
        .notes
        .iter()
        .find(|note| note.path == selected_note_path)
        .map(|note| note.path)
        .unwrap_or(workspace.default_note_path);

    let notes: Vec<NoteSummary> = workspace
        .notes
        .iter()
        .map(|note| note_summary(note.path, note.body, active_path))
        .collect();
    let selected_note = notes
        .iter()
        .find(|note| note.path == active_path)
        .cloned()
        .unwrap_or_else(|| notes[0].clone());
    let tree = build_tree(&notes, &selected_note.path);
    let labels = label_summaries(&notes);

    WorkspaceView {
        slug: workspace.slug.to_string(),
        name: workspace.name.to_string(),
        branch: workspace.branch.to_string(),
        source: workspace.source.to_string(),
        note_count: notes.len(),
        changed_notes: 0,
        selected_note_body: workspace
            .notes
            .iter()
            .find(|note| note.path == selected_note.path)
            .map(|note| note.body.to_string())
            .unwrap_or_else(|| workspace.notes[0].body.to_string()),
        selected_note,
        tree,
        labels,
        notes,
    }
}

fn note_summary(path: &str, body: &str, selected_note_path: &str) -> NoteSummary {
    let meta = parse_note_meta(body);
    let title = meta
        .title
        .or_else(|| heading_title(body))
        .unwrap_or_else(|| fallback_title(path));

    NoteSummary {
        path: path.to_string(),
        title,
        labels: meta.labels,
        links: extract_links(body),
        active: path == selected_note_path,
    }
}

fn label_summaries(notes: &[NoteSummary]) -> Vec<LabelSummary> {
    let mut counts = BTreeMap::new();

    for note in notes {
        for label in &note.labels {
            *counts.entry(label.clone()).or_insert(0usize) += 1;
        }
    }

    counts
        .into_iter()
        .map(|(name, count)| LabelSummary { name, count })
        .collect()
}

fn build_tree(notes: &[NoteSummary], selected_note_path: &str) -> Vec<TreeEntry> {
    #[derive(Default)]
    struct Node {
        folders: BTreeMap<String, Node>,
        files: BTreeSet<String>,
    }

    fn insert(node: &mut Node, path: &str) {
        let mut parts = path.split('/').peekable();
        let mut current = node;

        while let Some(part) = parts.next() {
            if parts.peek().is_none() {
                current.files.insert(part.to_string());
                return;
            }

            current = current.folders.entry(part.to_string()).or_default();
        }
    }

    fn emit(node: &Node, prefix: &str, depth: usize, selected_note_path: &str, rows: &mut Vec<TreeEntry>) {
        for (folder, child) in &node.folders {
            let path = if prefix.is_empty() {
                folder.clone()
            } else {
                format!("{prefix}/{folder}")
            };

            rows.push(TreeEntry {
                kind: TreeKind::Folder,
                label: folder.clone(),
                path: path.clone(),
                depth,
                active: false,
            });
            emit(child, &path, depth + 1, selected_note_path, rows);
        }

        for file in &node.files {
            let path = if prefix.is_empty() {
                file.clone()
            } else {
                format!("{prefix}/{file}")
            };

            rows.push(TreeEntry {
                kind: TreeKind::File,
                label: file.clone(),
                path: path.clone(),
                depth,
                active: path == selected_note_path,
            });
        }
    }

    let mut root = Node::default();
    for note in notes {
        insert(&mut root, &note.path);
    }

    let mut rows = Vec::new();
    emit(&root, "", 0, selected_note_path, &mut rows);
    rows
}

struct NoteMeta {
    title: Option<String>,
    labels: Vec<String>,
}

fn parse_note_meta(body: &str) -> NoteMeta {
    let mut lines = body.lines();
    if lines.next().map(str::trim) != Some("---") {
        return NoteMeta {
            title: None,
            labels: Vec::new(),
        };
    }

    let mut title = None;
    let mut labels = Vec::new();
    let mut in_labels = false;

    for line in lines {
        let trimmed = line.trim();
        if trimmed == "---" {
            break;
        }

        if in_labels {
            if let Some(label) = trimmed.strip_prefix('-') {
                let label = label.trim();
                if !label.is_empty() {
                    labels.push(normalize_label(label));
                }
                continue;
            }

            if trimmed.is_empty() {
                continue;
            }

            in_labels = false;
        }

        if let Some(rest) = trimmed.strip_prefix("title:") {
            let value = rest.trim();
            if !value.is_empty() {
                title = Some(unquote(value));
            }
            continue;
        }

        if let Some(rest) = trimmed.strip_prefix("labels:") {
            let value = rest.trim();
            if value.starts_with('[') {
                labels.extend(parse_inline_labels(value));
            } else {
                in_labels = true;
            }
        }
    }

    NoteMeta { title, labels }
}

fn parse_inline_labels(raw: &str) -> Vec<String> {
    raw.trim_start_matches('[')
        .trim_end_matches(']')
        .split(',')
        .map(str::trim)
        .filter(|label| !label.is_empty())
        .map(unquote)
        .map(|label| normalize_label(&label))
        .collect()
}

fn heading_title(body: &str) -> Option<String> {
    let content = strip_frontmatter(body);

    for line in content.lines() {
        let trimmed = line.trim_start();
        if !trimmed.starts_with('#') {
            continue;
        }

        let hashes = trimmed.chars().take_while(|ch| *ch == '#').count();
        if !(1..=6).contains(&hashes) || trimmed.as_bytes().get(hashes) != Some(&b' ') {
            continue;
        }

        let title = trimmed[(hashes + 1)..].trim();
        if !title.is_empty() {
            return Some(title.to_string());
        }
    }

    None
}

fn strip_frontmatter(body: &str) -> &str {
    let mut lines = body.split_inclusive('\n');
    let Some(first) = lines.next() else {
        return body;
    };

    if first.trim() != "---" {
        return body;
    }

    let mut offset = first.len();
    for line in lines {
        offset += line.len();
        if line.trim() == "---" {
            return &body[offset..];
        }
    }

    body
}

fn extract_links(body: &str) -> Vec<String> {
    let content = strip_frontmatter(body);
    let mut links = Vec::new();
    let mut rest = content;

    while let Some(start) = rest.find("](") {
        if rest[..start].ends_with('!') {
            rest = &rest[start + 2..];
            continue;
        }

        let target = &rest[start + 2..];
        if let Some(end) = target.find(')') {
            let href = target[..end].trim();
            if !href.is_empty() {
                links.push(href.to_string());
            }
            rest = &target[end + 1..];
        } else {
            break;
        }
    }

    links
}

fn fallback_title(path: &str) -> String {
    path.rsplit('/').next().unwrap_or(path).trim_end_matches(".md").replace('-', " ")
}

fn normalize_label(label: &str) -> String {
    label.trim().trim_matches('"').trim_matches('\'').to_lowercase()
}

fn unquote(value: &str) -> String {
    value
        .trim()
        .trim_matches('"')
        .trim_matches('\'')
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_demo_note_meta() {
        let note = include_str!("demo_notes/welcome.md");
        let meta = parse_note_meta(note);

        assert_eq!(meta.title.as_deref(), Some("Welcome"));
        assert_eq!(meta.labels, vec!["welcome", "overview"]);
        assert!(extract_links(note).contains(&"notes/roadmap.md".to_string()));
    }

    #[test]
    fn builds_tree_and_selects_note() {
        let view = mock_workspace_view("notes/roadmap.md");

        assert_eq!(view.selected_note.path, "notes/roadmap.md");
        assert!(view.tree.iter().any(|row| row.label == "notes" && matches!(row.kind, TreeKind::Folder)));
        assert!(view.labels.iter().any(|label| label.name == "welcome"));
    }
}
