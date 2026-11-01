use liroxnotes_backend::git;
use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
};
use uuid::Uuid;

/// Test fixtures may use the git CLI; production code may not.
fn cli(dir: &Path, args: &[&str]) -> String {
    let output = Command::new("git")
        .current_dir(dir)
        .args(["-c", "user.name=t", "-c", "user.email=t@t"])
        .args(args)
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "git {args:?}: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    String::from_utf8_lossy(&output.stdout).trim().to_string()
}

fn temp(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("lirox-git-{name}-{}", Uuid::new_v4()));
    fs::create_dir_all(&dir).unwrap();
    dir
}

fn repo(name: &str) -> PathBuf {
    let dir = temp(name);
    git::init(&dir).unwrap();
    dir
}

#[test]
fn commit_records_a_new_note_and_reports_no_change_on_second_call() {
    let dir = repo("commit-new");
    fs::write(dir.join("a.md"), "# A\n").unwrap();

    assert!(git::commit_paths(&dir, &[PathBuf::from("a.md")]).unwrap());
    assert!(!git::commit_paths(&dir, &[PathBuf::from("a.md")]).unwrap());

    assert_eq!(
        cli(&dir, &["log", "--format=%s|%an|%ae"]),
        "Update a.md|LiroxNotes|liroxnotes@example.local"
    );
    assert_eq!(git::changed_count(&dir).unwrap(), 0);
    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn commit_keeps_an_existing_local_identity() {
    let dir = repo("commit-identity");
    cli(&dir, &["config", "user.name", "Someone"]);
    cli(&dir, &["config", "user.email", "someone@example.com"]);
    fs::write(dir.join("a.md"), "# A\n").unwrap();

    git::commit_paths(&dir, &[PathBuf::from("a.md")]).unwrap();

    assert_eq!(
        cli(&dir, &["log", "--format=%an|%ae"]),
        "Someone|someone@example.com"
    );
    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn commit_records_a_deleted_note() {
    let dir = repo("commit-delete");
    fs::write(dir.join("a.md"), "# A\n").unwrap();
    git::commit_paths(&dir, &[PathBuf::from("a.md")]).unwrap();
    fs::remove_file(dir.join("a.md")).unwrap();

    assert!(git::commit_paths(&dir, &[PathBuf::from("a.md")]).unwrap());

    assert_eq!(git::changed_count(&dir).unwrap(), 0);
    assert_eq!(cli(&dir, &["ls-files"]), "");
    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn commit_only_includes_the_given_paths() {
    let dir = repo("commit-scope");
    fs::write(dir.join("a.md"), "# A\n").unwrap();
    fs::write(dir.join("b.md"), "# B\n").unwrap();

    git::commit_paths(&dir, &[PathBuf::from("a.md")]).unwrap();

    assert_eq!(cli(&dir, &["ls-files"]), "a.md");
    assert_eq!(git::changed_count(&dir).unwrap(), 1);
    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn commit_from_a_workspace_subdirectory_uses_repo_relative_paths() {
    let dir = repo("commit-subdir");
    let notes = dir.join("work");
    fs::create_dir_all(notes.join("deep")).unwrap();
    fs::write(notes.join("deep/plan.md"), "# Plan\n").unwrap();

    assert!(git::commit_paths(&notes, &[PathBuf::from("deep/plan.md")]).unwrap());

    assert_eq!(cli(&dir, &["ls-files"]), "work/deep/plan.md");
    assert_eq!(cli(&dir, &["log", "--format=%s"]), "Update deep/plan.md");
    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn changed_count_collapses_untracked_directories() {
    let dir = repo("status");
    fs::create_dir_all(dir.join("new")).unwrap();
    fs::write(dir.join("new/x.md"), "x").unwrap();
    fs::write(dir.join("new/y.md"), "y").unwrap();
    fs::write(dir.join("top.md"), "t").unwrap();
    fs::write(dir.join(".gitignore"), "ignored.md\n").unwrap();
    fs::write(dir.join("ignored.md"), "i").unwrap();

    // new/, top.md, .gitignore — like `git status --porcelain`.
    assert_eq!(git::changed_count(&dir).unwrap(), 3);
    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn unpushed_count_counts_all_commits_without_tracking_ref() {
    let dir = repo("unpushed");
    assert_eq!(git::unpushed_count(&dir, "main").unwrap(), 0);
    for name in ["a.md", "b.md"] {
        fs::write(dir.join(name), name).unwrap();
        git::commit_paths(&dir, &[PathBuf::from(name)]).unwrap();
    }

    assert_eq!(git::unpushed_count(&dir, "main").unwrap(), 2);
    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn origin_can_be_set_updated_and_removed() {
    let dir = repo("origin");
    assert!(git::origin_url(&dir).is_err());

    git::set_origin(&dir, "https://example.com/a.git").unwrap();
    assert_eq!(git::origin_url(&dir).unwrap(), "https://example.com/a.git");
    git::set_origin(&dir, "git@example.com:b.git").unwrap();
    assert_eq!(git::origin_url(&dir).unwrap(), "git@example.com:b.git");

    git::remove_origin(&dir).unwrap();
    assert!(git::origin_url(&dir).is_err());
    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn current_branch_reads_unborn_head() {
    let dir = temp("branch");
    cli(&dir, &["init", "-q", "-b", "trunk"]);

    assert_eq!(git::current_branch(&dir).unwrap(), "trunk");
    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn repository_discovery_and_root() {
    let dir = temp("discover");
    assert!(!git::is_inside_repository(&dir));
    git::init(&dir).unwrap();
    fs::create_dir_all(dir.join("a/b")).unwrap();

    assert!(git::is_inside_repository(&dir.join("a/b")));
    assert_eq!(
        fs::canonicalize(git::repository_root(&dir.join("a/b")).unwrap()).unwrap(),
        fs::canonicalize(&dir).unwrap()
    );
    fs::remove_dir_all(dir).unwrap();
}
