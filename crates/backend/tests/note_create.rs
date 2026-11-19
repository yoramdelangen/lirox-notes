//! Creating a note never overwrites anything and only accepts slug names.

use liroxnotes_backend::{create_note, GatewayConfig};
use std::{fs, io::ErrorKind, path::PathBuf, process::Command};
use uuid::Uuid;

struct Fixture {
    root: PathBuf,
    config: GatewayConfig,
}

impl Fixture {
    fn new() -> Self {
        let root = std::env::temp_dir().join(format!("lirox-note-create-{}", Uuid::new_v4()));
        let repository = root.join("repo");
        fs::create_dir_all(&repository).unwrap();
        git(&repository, &["init", "-q"]);
        Self {
            config: GatewayConfig {
                workspace_slug: "notes".into(),
                workspace_name: "Notes".into(),
                workspace_path: repository,
                relative_path: String::new(),
                repo_url: String::new(),
                branch: "main".into(),
            },
            root,
        }
    }

    fn notes(&self) -> PathBuf {
        self.config.workspace_path.clone()
    }

    /// Writes and commits `files` as the starting state.
    fn seed(&self, files: &[(&str, &str)]) {
        for (path, body) in files {
            let path = self.notes().join(path);
            fs::create_dir_all(path.parent().unwrap()).unwrap();
            fs::write(path, body).unwrap();
        }
        git(&self.notes(), &["add", "-A"]);
        git(&self.notes(), &["commit", "-q", "-m", "seed"]);
    }

    fn commits(&self) -> usize {
        let output = Command::new("git")
            .args(["rev-list", "--count", "--all"])
            .current_dir(self.notes())
            .output()
            .unwrap();
        String::from_utf8_lossy(&output.stdout)
            .trim()
            .parse()
            .unwrap_or(0)
    }

    fn read(&self, path: &str) -> String {
        fs::read_to_string(self.notes().join(path)).unwrap()
    }
}

impl Drop for Fixture {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.root);
    }
}

fn git(dir: &PathBuf, args: &[&str]) {
    let status = Command::new("git")
        .current_dir(dir)
        .args(["-c", "user.name=t", "-c", "user.email=t@t"])
        .args(args)
        .status()
        .unwrap();
    assert!(status.success(), "git {args:?}");
}

#[test]
fn creates_a_note_in_a_folder() {
    let fixture = Fixture::new();

    create_note(
        &fixture.config,
        "projects/meeting-notes-q4.md",
        "# Meeting notes Q4\n".into(),
    )
    .unwrap();

    assert_eq!(
        fixture.read("projects/meeting-notes-q4.md"),
        "# Meeting notes Q4\n"
    );
    assert_eq!(fixture.commits(), 1);
}

#[test]
fn creates_a_child_note_from_a_file() {
    let fixture = Fixture::new();
    fixture.seed(&[("ideas.md", "# Ideas\n")]);

    create_note(&fixture.config, "ideas/plan.md", "# Plan\n".into()).unwrap();

    assert_eq!(fixture.read("ideas/README.md"), "# Ideas\n");
    assert_eq!(fixture.read("ideas/plan.md"), "# Plan\n");
    assert!(!fixture.notes().join("ideas.md").exists());
    assert_eq!(fixture.commits(), 2);
}

#[test]
fn creates_a_child_note_from_a_nested_file() {
    let fixture = Fixture::new();
    fixture.seed(&[("work/a.md", "# A\n")]);

    create_note(&fixture.config, "work/a/b.md", "# B\n".into()).unwrap();

    assert_eq!(fixture.read("work/a/README.md"), "# A\n");
    assert_eq!(fixture.read("work/a/b.md"), "# B\n");
    assert!(!fixture.notes().join("work/a.md").exists());
    assert_eq!(fixture.commits(), 2);
}

#[test]
fn child_note_when_folder_exists_without_readme() {
    let fixture = Fixture::new();
    fixture.seed(&[("ideas.md", "# Ideas\n"), ("ideas/other.md", "# Other\n")]);

    create_note(&fixture.config, "ideas/plan.md", "# Plan\n".into()).unwrap();

    assert_eq!(fixture.read("ideas/README.md"), "# Ideas\n");
    assert_eq!(fixture.read("ideas/plan.md"), "# Plan\n");
    assert_eq!(fixture.commits(), 2);
}

#[test]
fn refuses_an_existing_note() {
    let fixture = Fixture::new();
    fixture.seed(&[("plan.md", "# Plan\n")]);

    let error = create_note(&fixture.config, "plan.md", "# Other\n".into()).unwrap_err();

    assert_eq!(error.kind(), ErrorKind::AlreadyExists);
    assert!(
        error.to_string().contains("`plan.md` already exists"),
        "{error}"
    );
    assert_eq!(fixture.read("plan.md"), "# Plan\n");
    assert_eq!(fixture.commits(), 1);
}

#[test]
fn refuses_a_note_next_to_a_same_named_folder() {
    let fixture = Fixture::new();
    fixture.seed(&[("ideas/x.md", "# X\n")]);

    let error = create_note(&fixture.config, "ideas.md", "# Ideas\n".into()).unwrap_err();

    assert_eq!(error.kind(), ErrorKind::AlreadyExists);
    assert!(!fixture.notes().join("ideas.md").exists());
    assert_eq!(fixture.commits(), 1);
}

#[test]
fn refuses_when_readme_already_exists() {
    let fixture = Fixture::new();
    fixture.seed(&[("ideas.md", "# Ideas\n"), ("ideas/README.md", "# Readme\n")]);

    let error = create_note(&fixture.config, "ideas/plan.md", "# Plan\n".into()).unwrap_err();

    assert_eq!(error.kind(), ErrorKind::AlreadyExists);
    assert_eq!(fixture.read("ideas.md"), "# Ideas\n");
    assert!(!fixture.notes().join("ideas/plan.md").exists());
    assert_eq!(fixture.commits(), 1);
}

#[test]
fn refuses_non_slug_names() {
    let fixture = Fixture::new();

    for path in ["Plan.md", "my plan.md", "plan-.md", "projects/x_y.md"] {
        let error = create_note(&fixture.config, path, "# X\n".into()).unwrap_err();
        assert_eq!(error.kind(), ErrorKind::InvalidInput, "{path}");
    }
    assert_eq!(fixture.commits(), 0);
}

#[test]
fn folder_segments_are_not_slug_checked() {
    let fixture = Fixture::new();

    create_note(&fixture.config, "My Folder/plan.md", "# Plan\n".into()).unwrap();

    assert_eq!(fixture.read("My Folder/plan.md"), "# Plan\n");
}

#[test]
fn refuses_unsafe_paths() {
    let fixture = Fixture::new();

    for path in ["../x.md", ".git/x.md"] {
        let error = create_note(&fixture.config, path, "# X\n".into()).unwrap_err();
        assert_eq!(error.kind(), ErrorKind::InvalidInput, "{path}");
    }
    assert_eq!(fixture.commits(), 0);
}
