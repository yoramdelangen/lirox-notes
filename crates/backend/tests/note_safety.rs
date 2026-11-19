//! Note operations must never reach outside the workspace's notes root, even
//! through symlinks a pulled repository may contain.
#![cfg(unix)]

use liroxnotes_backend::{
    delete_note_file, read_note_body, save_note_body, workspace_view_for_config, GatewayConfig,
};
use std::{fs, os::unix::fs::symlink, path::PathBuf, process::Command};
use uuid::Uuid;

/// A git repository with the workspace at `relative_path`, plus an
/// `outside/` folder next to the repository holding `secret.md`.
struct Fixture {
    root: PathBuf,
    config: GatewayConfig,
}

impl Fixture {
    fn new(relative_path: &str) -> Self {
        let root = std::env::temp_dir().join(format!("lirox-note-safety-{}", Uuid::new_v4()));
        let repository = root.join("repo");
        fs::create_dir_all(repository.join(relative_path)).unwrap();
        fs::create_dir_all(root.join("outside")).unwrap();
        fs::write(root.join("outside/secret.md"), "secret").unwrap();
        assert!(Command::new("git")
            .args(["init", "-q"])
            .current_dir(&repository)
            .status()
            .unwrap()
            .success());
        Self {
            config: GatewayConfig {
                workspace_slug: "notes".into(),
                workspace_name: "Notes".into(),
                workspace_path: repository,
                relative_path: relative_path.into(),
                repo_url: String::new(),
                branch: "main".into(),
            },
            root,
        }
    }

    fn notes(&self) -> PathBuf {
        self.config.workspace_path.join(&self.config.relative_path)
    }

    fn outside(&self) -> PathBuf {
        self.root.join("outside")
    }

    fn commits(&self) -> usize {
        let output = Command::new("git")
            .args(["rev-list", "--count", "--all"])
            .current_dir(&self.config.workspace_path)
            .output()
            .unwrap();
        String::from_utf8_lossy(&output.stdout)
            .trim()
            .parse()
            .unwrap_or(0)
    }

    fn listed(&self) -> Vec<String> {
        workspace_view_for_config(&self.config, "")
            .unwrap()
            .notes
            .into_iter()
            .map(|note| note.path)
            .collect()
    }
}

impl Drop for Fixture {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.root);
    }
}

#[test]
fn symlinked_note_pointing_outside_cannot_be_read() {
    let fixture = Fixture::new("");
    symlink(
        fixture.outside().join("secret.md"),
        fixture.notes().join("x.md"),
    )
    .unwrap();

    let error = read_note_body(&fixture.config, "x.md").unwrap_err();
    assert_eq!(error.kind(), std::io::ErrorKind::InvalidInput);
}

#[test]
fn symlinked_note_pointing_outside_cannot_be_overwritten() {
    let fixture = Fixture::new("");
    symlink(
        fixture.outside().join("secret.md"),
        fixture.notes().join("x.md"),
    )
    .unwrap();

    assert!(save_note_body(&fixture.config, "x.md", "pwned".into()).is_err());
    assert_eq!(
        fs::read_to_string(fixture.outside().join("secret.md")).unwrap(),
        "secret"
    );
    assert_eq!(fixture.commits(), 0);
}

#[test]
fn symlinked_folder_pointing_outside_cannot_be_written_into() {
    let fixture = Fixture::new("");
    symlink(fixture.outside(), fixture.notes().join("linked")).unwrap();

    assert!(save_note_body(&fixture.config, "linked/new.md", "pwned".into()).is_err());
    assert!(!fixture.outside().join("new.md").exists());
    assert_eq!(fixture.commits(), 0);
}

#[test]
fn symlinked_folder_pointing_outside_cannot_be_read_or_deleted_through() {
    let fixture = Fixture::new("");
    symlink(fixture.outside(), fixture.notes().join("linked")).unwrap();

    assert_eq!(
        read_note_body(&fixture.config, "linked/secret.md")
            .unwrap_err()
            .kind(),
        std::io::ErrorKind::InvalidInput
    );
    assert!(delete_note_file(&fixture.config, "linked/secret.md").is_err());
    assert!(fixture.outside().join("secret.md").is_file());
}

#[test]
fn symlinked_note_is_not_deleted() {
    let fixture = Fixture::new("");
    let link = fixture.notes().join("x.md");
    symlink(fixture.outside().join("secret.md"), &link).unwrap();

    assert!(delete_note_file(&fixture.config, "x.md").is_err());
    assert!(fs::symlink_metadata(&link).is_ok());
    assert!(fixture.outside().join("secret.md").is_file());
}

#[test]
fn symlinked_legacy_parent_note_is_not_moved_into_a_readme() {
    let fixture = Fixture::new("");
    symlink(
        fixture.outside().join("secret.md"),
        fixture.notes().join("ideas.md"),
    )
    .unwrap();

    assert!(save_note_body(&fixture.config, "ideas/plan.md", "# Plan\n".into()).is_err());
    assert!(!fixture.notes().join("ideas").exists());
    assert!(fixture.outside().join("secret.md").is_file());
}

#[test]
fn hidden_paths_are_refused_for_every_operation() {
    let fixture = Fixture::new("");
    fs::create_dir_all(fixture.notes().join(".git-notes")).unwrap();
    fs::write(fixture.notes().join(".git-notes/x.md"), "hidden").unwrap();

    for path in [".git/config.md", ".git-notes/x.md", "a/.hidden/x.md"] {
        assert_eq!(
            read_note_body(&fixture.config, path).unwrap_err().kind(),
            std::io::ErrorKind::InvalidInput,
            "{path}"
        );
        assert!(
            save_note_body(&fixture.config, path, "x".into()).is_err(),
            "{path}"
        );
        assert!(delete_note_file(&fixture.config, path).is_err(), "{path}");
    }
    assert!(!fixture
        .config
        .workspace_path
        .join(".git/config.md")
        .exists());
    assert_eq!(
        fs::read_to_string(fixture.notes().join(".git-notes/x.md")).unwrap(),
        "hidden"
    );
    assert_eq!(fixture.commits(), 0);
}

#[test]
fn listing_skips_symlinks_and_hidden_folders() {
    let fixture = Fixture::new("");
    fs::write(fixture.notes().join("plan.md"), "# Plan\n").unwrap();
    fs::create_dir_all(fixture.notes().join(".github")).unwrap();
    fs::write(fixture.notes().join(".github/notes.md"), "# Hidden\n").unwrap();
    symlink(fixture.outside(), fixture.notes().join("linked")).unwrap();
    symlink(
        fixture.outside().join("secret.md"),
        fixture.notes().join("x.md"),
    )
    .unwrap();

    assert_eq!(fixture.listed(), vec!["plan.md".to_string()]);
}

#[test]
fn subfolder_workspace_cannot_reach_a_sibling_folder() {
    let fixture = Fixture::new("work");
    let sibling = fixture.config.workspace_path.join("private");
    fs::create_dir_all(&sibling).unwrap();
    fs::write(sibling.join("x.md"), "private").unwrap();

    assert!(read_note_body(&fixture.config, "../private/x.md").is_err());
    assert!(save_note_body(&fixture.config, "../private/x.md", "pwned".into()).is_err());
    assert!(delete_note_file(&fixture.config, "../private/x.md").is_err());
    assert_eq!(fs::read_to_string(sibling.join("x.md")).unwrap(), "private");
}

#[test]
fn ordinary_notes_still_save_read_and_delete() {
    let fixture = Fixture::new("work");

    save_note_body(&fixture.config, "ideas/plan.md", "# Plan\n".into()).unwrap();
    assert_eq!(
        read_note_body(&fixture.config, "ideas/plan.md").unwrap(),
        "# Plan\n"
    );
    assert_eq!(fixture.listed(), vec!["ideas/plan.md".to_string()]);
    assert!(delete_note_file(&fixture.config, "ideas/plan.md").unwrap());
    assert!(!fixture.notes().join("ideas/plan.md").exists());
}

#[test]
fn legacy_parent_note_still_becomes_a_readme() {
    let fixture = Fixture::new("");
    fs::write(fixture.notes().join("ideas.md"), "# Ideas\n").unwrap();

    save_note_body(&fixture.config, "ideas/plan.md", "# Plan\n".into()).unwrap();
    assert_eq!(
        fs::read_to_string(fixture.notes().join("ideas/README.md")).unwrap(),
        "# Ideas\n"
    );
    assert!(!fixture.notes().join("ideas.md").exists());
}

#[test]
fn refused_readme_conversion_changes_nothing() {
    let fixture = Fixture::new("");
    let notes = fixture.notes();
    fs::create_dir_all(notes.join("a")).unwrap();
    fs::write(notes.join("a/b.md"), "# B\n").unwrap();
    fs::write(notes.join("a.md"), "# A\n").unwrap();
    fs::write(notes.join("a/README.md"), "# Readme\n").unwrap();

    let error = save_note_body(&fixture.config, "a/b/c.md", "# C\n".into()).unwrap_err();
    assert_eq!(error.kind(), std::io::ErrorKind::AlreadyExists);
    assert!(notes.join("a/b.md").is_file());
    assert!(!notes.join("a/b").exists());
}
