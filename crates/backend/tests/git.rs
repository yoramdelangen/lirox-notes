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

fn bare_with(files: &[(&str, &str)]) -> PathBuf {
    let root = temp("remote");
    let bare = root.join("origin.git");
    let seed = root.join("seed");
    fs::create_dir_all(&seed).unwrap();
    cli(
        &root,
        &["init", "-q", "--bare", "-b", "main", bare.to_str().unwrap()],
    );
    cli(&seed, &["init", "-q", "-b", "main"]);
    for (path, contents) in files {
        fs::write(seed.join(path), contents).unwrap();
    }
    cli(&seed, &["add", "."]);
    cli(&seed, &["commit", "-qm", "init"]);
    cli(&seed, &["push", "-q", bare.to_str().unwrap(), "main"]);
    bare
}

fn clone_of(bare: &Path, name: &str) -> PathBuf {
    let destination = bare.parent().unwrap().join(name);
    git::clone(bare.to_str().unwrap(), "main", &destination, &env()).unwrap();
    destination
}

fn env() -> git::GitEnv {
    git::GitEnv::default()
}

fn commit_file(dir: &Path, name: &str) {
    fs::write(dir.join(name), name).unwrap();
    assert!(git::commit_paths(dir, &[PathBuf::from(name)]).unwrap());
}

#[test]
fn clone_checks_out_the_requested_branch() {
    let bare = bare_with(&[("a.md", "# A\n")]);
    let clone = clone_of(&bare, "clone");

    assert!(clone.join("a.md").is_file());
    assert_eq!(git::current_branch(&clone).unwrap(), "main");
    assert_eq!(git::origin_url(&clone).unwrap(), bare.to_str().unwrap());
    fs::remove_dir_all(bare.parent().unwrap()).unwrap();
}

#[test]
fn clone_falls_back_to_default_branch_when_branch_missing() {
    let bare = bare_with(&[("a.md", "# A\n")]);
    let destination = bare.parent().unwrap().join("clone");

    git::clone(bare.to_str().unwrap(), "develop", &destination, &env()).unwrap();

    assert!(destination.join("a.md").is_file());
    assert_eq!(git::current_branch(&destination).unwrap(), "main");
    fs::remove_dir_all(bare.parent().unwrap()).unwrap();
}

#[test]
fn clone_of_a_missing_remote_fails_and_leaves_no_directory() {
    let root = temp("missing");
    let destination = root.join("clone");

    assert!(git::clone(
        root.join("nope.git").to_str().unwrap(),
        "main",
        &destination,
        &env()
    )
    .is_err());
    assert!(!destination.exists());
    fs::remove_dir_all(root).unwrap();
}

#[test]
fn push_updates_tracking_ref_so_unpushed_count_is_zero() {
    let bare = bare_with(&[("a.md", "# A\n")]);
    let clone = clone_of(&bare, "clone");
    commit_file(&clone, "b.md");
    assert_eq!(git::unpushed_count(&clone, "main").unwrap(), 1);

    git::push(&clone, "main", &env()).unwrap();

    assert_eq!(git::unpushed_count(&clone, "main").unwrap(), 0);
    assert_eq!(
        cli(&bare, &["log", "-1", "--format=%s", "main"]),
        "Update b.md"
    );
    fs::remove_dir_all(bare.parent().unwrap()).unwrap();
}

#[test]
fn push_creates_the_branch_on_an_empty_remote() {
    let root = temp("empty-remote");
    let bare = root.join("origin.git");
    cli(&root, &["init", "-q", "--bare", bare.to_str().unwrap()]);
    let local = root.join("local");
    fs::create_dir_all(&local).unwrap();
    cli(&local, &["init", "-q", "-b", "notes"]);
    git::set_origin(&local, bare.to_str().unwrap()).unwrap();
    commit_file(&local, "a.md");

    git::push(&local, "notes", &env()).unwrap();

    assert_eq!(
        cli(&bare, &["log", "-1", "--format=%s", "notes"]),
        "Update a.md"
    );
    fs::remove_dir_all(root).unwrap();
}

#[test]
fn push_rejected_when_remote_has_diverged() {
    let bare = bare_with(&[("a.md", "# A\n")]);
    let first = clone_of(&bare, "first");
    let second = clone_of(&bare, "second");
    commit_file(&first, "b.md");
    git::push(&first, "main", &env()).unwrap();
    commit_file(&second, "c.md");

    assert!(git::push(&second, "main", &env()).is_err());
    assert_eq!(
        cli(&bare, &["log", "-1", "--format=%s", "main"]),
        "Update b.md"
    );
    fs::remove_dir_all(bare.parent().unwrap()).unwrap();
}

#[test]
fn pull_fast_forwards_new_remote_commits() {
    let bare = bare_with(&[("a.md", "# A\n")]);
    let first = clone_of(&bare, "first");
    let second = clone_of(&bare, "second");
    commit_file(&first, "b.md");
    git::push(&first, "main", &env()).unwrap();

    git::pull_ff_only(&second, "main", &env()).unwrap();

    assert!(second.join("b.md").is_file());
    assert_eq!(git::changed_count(&second).unwrap(), 0);
    assert_eq!(git::unpushed_count(&second, "main").unwrap(), 0);
    git::pull_ff_only(&second, "main", &env()).unwrap();
    fs::remove_dir_all(bare.parent().unwrap()).unwrap();
}

#[test]
fn pull_errors_when_branches_diverged() {
    let bare = bare_with(&[("a.md", "# A\n")]);
    let first = clone_of(&bare, "first");
    let second = clone_of(&bare, "second");
    commit_file(&first, "b.md");
    git::push(&first, "main", &env()).unwrap();
    commit_file(&second, "c.md");

    let error = git::pull_ff_only(&second, "main", &env()).unwrap_err();

    assert!(error.to_string().contains("diverged"), "{error}");
    assert!(!second.join("b.md").exists());
    fs::remove_dir_all(bare.parent().unwrap()).unwrap();
}
