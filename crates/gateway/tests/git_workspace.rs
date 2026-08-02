use liroxnotes_gateway::{
    changed_count, commit_note, ensure_workspace, format_config, parse_config,
    parse_onboarding_form, safe_note_path, save_config, GatewayConfig, RuntimePaths,
};
use std::{
    fs,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};

fn temp_root(name: &str) -> PathBuf {
    std::env::temp_dir().join(format!(
        "liroxnotes-{name}-{}",
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos()
    ))
}

#[test]
fn rejects_unsafe_note_paths() {
    assert!(safe_note_path("notes/ok.md").is_some());
    assert!(safe_note_path("../secret.md").is_none());
    assert!(safe_note_path("/tmp/secret.md").is_none());
    assert!(safe_note_path("notes/not-markdown.txt").is_none());
}

#[test]
fn saves_and_commits_note() {
    let root = temp_root("git");
    ensure_workspace(&root).unwrap();
    fs::write(root.join("notes/welcome.md"), "# Changed\n").unwrap();

    assert!(commit_note(&root, "notes/welcome.md").unwrap());
    assert_eq!(changed_count(&root), 0);

    let _ = fs::remove_dir_all(root);
}

#[test]
fn config_roundtrips_workspace_repo_and_branch() {
    let config = GatewayConfig {
        workspace_path: PathBuf::from("/tmp/lirox-notes"),
        repo_url: "git@example.com:me/notes.git".to_string(),
        branch: "main".to_string(),
    };

    assert_eq!(parse_config(&format_config(&config)), Some(config));
}

#[test]
fn saves_config_file() {
    let root = temp_root("config");
    let paths = RuntimePaths {
        config_file: root.join("config"),
        default_workspace: root.join("workspace"),
    };
    let config = GatewayConfig {
        workspace_path: paths.default_workspace.clone(),
        repo_url: String::new(),
        branch: "main".to_string(),
    };

    save_config(&paths.config_file, &config).unwrap();

    assert_eq!(
        parse_config(&fs::read_to_string(&paths.config_file).unwrap()),
        Some(config)
    );
    let _ = fs::remove_dir_all(root);
}

#[test]
fn onboarding_form_decodes_values_and_defaults() {
    let config = parse_onboarding_form(
        "workspace_path=%2Ftmp%2Fmy+notes&repo_url=git%40example.com%3Ame%2Fnotes.git&branch=",
        PathBuf::from("/tmp/default").as_path(),
    );

    assert_eq!(config.workspace_path, PathBuf::from("/tmp/my notes"));
    assert_eq!(config.repo_url, "git@example.com:me/notes.git");
    assert_eq!(config.branch, "main");
}
