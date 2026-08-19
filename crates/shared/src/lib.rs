use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};

pub const APP_NAME: &str = "LiroxNotes";

#[derive(Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TreeKind {
    Folder,
    File,
}

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TreeEntry {
    pub kind: TreeKind,
    pub label: String,
    pub path: String,
    pub depth: usize,
    pub active: bool,
}

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct LabelSummary {
    pub name: String,
    pub count: usize,
}

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NoteSummary {
    pub path: String,
    pub title: String,
    pub labels: Vec<String>,
    pub links: Vec<String>,
    pub active: bool,
}

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize)]
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

#[derive(Clone)]
pub struct WorkspaceNote {
    pub path: String,
    pub body: String,
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

pub fn mock_workspace_view_with_body(
    selected_note_path: &str,
    selected_note_body: &str,
) -> WorkspaceView {
    workspace_view_with_body(&DEMO_WORKSPACE, selected_note_path, selected_note_body)
}

pub fn workspace_view(workspace: &DemoWorkspace, selected_note_path: &str) -> WorkspaceView {
    workspace_view_with_body(workspace, selected_note_path, "")
}

pub fn workspace_view_from_notes(
    slug: &str,
    name: &str,
    branch: &str,
    source: &str,
    default_note_path: &str,
    selected_note_path: &str,
    changed_notes: usize,
    note_records: &[WorkspaceNote],
) -> WorkspaceView {
    let active_path = note_records
        .iter()
        .find(|note| note.path == selected_note_path)
        .map(|note| note.path.as_str())
        .unwrap_or(default_note_path);

    let notes: Vec<NoteSummary> = note_records
        .iter()
        .map(|note| note_summary(&note.path, &note.body, active_path))
        .collect();
    if notes.is_empty() {
        let selected_note = NoteSummary {
            path: default_note_path.to_string(),
            title: fallback_title(default_note_path),
            labels: Vec::new(),
            links: Vec::new(),
            active: true,
        };
        return WorkspaceView {
            slug: slug.to_string(),
            name: name.to_string(),
            branch: branch.to_string(),
            source: source.to_string(),
            note_count: 0,
            changed_notes,
            selected_note,
            selected_note_body: String::new(),
            tree: Vec::new(),
            labels: Vec::new(),
            notes: Vec::new(),
        };
    }
    let selected_note = notes
        .iter()
        .find(|note| note.path == active_path)
        .cloned()
        .unwrap_or_else(|| notes[0].clone());
    let selected_note_body = note_records
        .iter()
        .find(|note| note.path == selected_note.path)
        .map(|note| note.body.clone())
        .unwrap_or_else(|| note_records[0].body.clone());

    WorkspaceView {
        slug: slug.to_string(),
        name: name.to_string(),
        branch: branch.to_string(),
        source: source.to_string(),
        note_count: notes.len(),
        changed_notes,
        tree: build_tree(&notes, &selected_note.path),
        labels: label_summaries(&notes),
        selected_note,
        selected_note_body,
        notes,
    }
}

pub fn workspace_view_with_body(
    workspace: &DemoWorkspace,
    selected_note_path: &str,
    selected_note_body: &str,
) -> WorkspaceView {
    let active_path = workspace
        .notes
        .iter()
        .find(|note| note.path == selected_note_path)
        .map(|note| note.path)
        .unwrap_or(workspace.default_note_path);

    let notes: Vec<NoteSummary> = workspace
        .notes
        .iter()
        .map(|note| {
            let body = if note.path == active_path && !selected_note_body.is_empty() {
                selected_note_body
            } else {
                note.body
            };

            note_summary(note.path, body, active_path)
        })
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
            .map(|note| {
                if note.path == selected_note.path && !selected_note_body.is_empty() {
                    selected_note_body.to_string()
                } else {
                    note.body.to_string()
                }
            })
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
        labels: extract_labels(body),
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

    fn emit(
        node: &Node,
        prefix: &str,
        depth: usize,
        selected_note_path: &str,
        rows: &mut Vec<TreeEntry>,
    ) {
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
}

fn parse_note_meta(body: &str) -> NoteMeta {
    let mut lines = body.lines();
    if lines.next().map(str::trim) != Some("---") {
        return NoteMeta { title: None };
    }

    let mut title = None;

    for line in lines {
        let trimmed = line.trim();
        if trimmed == "---" {
            break;
        }

        if let Some(rest) = trimmed.strip_prefix("title:") {
            let value = rest.trim();
            if !value.is_empty() {
                title = Some(unquote(value));
            }
            continue;
        }
    }

    NoteMeta { title }
}

fn extract_labels(body: &str) -> Vec<String> {
    let content = strip_markdown_noise(strip_frontmatter(body));
    let mut labels = BTreeSet::new();

    for token in content.split_whitespace() {
        let Some(raw) = token.strip_prefix('#') else {
            continue;
        };

        let label = raw.trim_matches(|ch: char| {
            !(ch.is_ascii_alphanumeric() || matches!(ch, '/' | '_' | '-'))
        });
        if label.is_empty() {
            continue;
        }

        labels.insert(normalize_label(label));
    }

    labels.into_iter().collect()
}

fn strip_markdown_noise(body: &str) -> String {
    let mut output = String::new();
    let mut fenced = false;

    for line in body.lines() {
        if line.trim_start().starts_with("```") {
            fenced = !fenced;
            continue;
        }

        if fenced {
            continue;
        }

        let mut inline_code = false;
        let mut link_depth = 0usize;
        for ch in line.chars() {
            match ch {
                '`' => inline_code = !inline_code,
                '[' if !inline_code => link_depth += 1,
                ']' if !inline_code && link_depth > 0 => link_depth -= 1,
                '(' if !inline_code && link_depth == 0 => link_depth += 1,
                ')' if !inline_code && link_depth > 0 => link_depth -= 1,
                _ if !inline_code && link_depth == 0 => output.push(ch),
                _ => {}
            }
        }
        output.push('\n');
    }

    output
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
    path.rsplit('/')
        .next()
        .unwrap_or(path)
        .trim_end_matches(".md")
        .replace('-', " ")
}

fn normalize_label(label: &str) -> String {
    label
        .trim()
        .trim_matches('"')
        .trim_matches('\'')
        .to_lowercase()
}

fn unquote(value: &str) -> String {
    value
        .trim()
        .trim_matches('"')
        .trim_matches('\'')
        .to_string()
}
