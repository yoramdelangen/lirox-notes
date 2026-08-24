use liroxnotes_gateway::{
    changed_count, commit_note, configure_git_remote, configured_profile, ensure_workspace,
    format_config, is_installed, parse_config, parse_onboarding_form, port_from_args,
    safe_note_path, save_config, workspace_view_for_config, GatewayConfig, RuntimePaths,
};
use std::{
    fs,
    path::PathBuf,
    process::Command,
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
fn ensure_workspace_seeds_welcome_for_empty_repository() {
    let root = temp_root("empty");
    ensure_workspace(&root).unwrap();

    assert!(root.join("notes/welcome.md").exists());

    let _ = fs::remove_dir_all(root);
}

#[test]
fn saves_and_commits_note() {
    let root = temp_root("git");
    ensure_workspace(&root).unwrap();
    fs::create_dir_all(root.join("notes")).unwrap();
    fs::write(root.join("notes/welcome.md"), "# Changed\n").unwrap();

    assert!(commit_note(&root, "notes/welcome.md").unwrap());
    assert_eq!(changed_count(&root), 0);

    let _ = fs::remove_dir_all(root);
}

#[test]
fn commit_note_sets_missing_repo_identity() {
    let root = temp_root("git-identity");
    fs::create_dir_all(root.join("notes")).unwrap();
    Command::new("git")
        .args(["init"])
        .current_dir(&root)
        .status()
        .unwrap();
    fs::write(root.join("notes/welcome.md"), "# Changed\n").unwrap();

    assert!(commit_note(&root, "notes/welcome.md").unwrap());

    let name = Command::new("git")
        .args(["config", "--local", "user.name"])
        .current_dir(&root)
        .output()
        .unwrap();
    assert_eq!(String::from_utf8_lossy(&name.stdout).trim(), "LiroxNotes");

    let _ = fs::remove_dir_all(root);
}

#[test]
fn onboarding_git_remote_configures_origin() {
    let root = temp_root("remote");
    ensure_workspace(&root).unwrap();
    let config = GatewayConfig {
        workspace_slug: "remote".to_string(),
        workspace_name: "Remote".to_string(),
        workspace_path: root.clone(),
        repo_url: "git@example.com:me/notes.git".to_string(),
        branch: "main".to_string(),
    };

    configure_git_remote(&config).unwrap();

    let remote = Command::new("git")
        .args(["remote", "get-url", "origin"])
        .current_dir(&root)
        .output()
        .unwrap();
    assert_eq!(
        String::from_utf8_lossy(&remote.stdout).trim(),
        "git@example.com:me/notes.git"
    );

    let _ = fs::remove_dir_all(root);
}

#[test]
fn config_roundtrips_workspace_repo_and_branch() {
    let config = GatewayConfig {
        workspace_slug: "notes".to_string(),
        workspace_name: "My Workspace".to_string(),
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
        workspace_slug: "workspace".to_string(),
        workspace_name: "My Workspace".to_string(),
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
fn config_implies_installed() {
    let root = temp_root("installed");
    let paths = RuntimePaths {
        config_file: root.join("config"),
        default_workspace: root.join("workspace"),
    };

    save_config(
        &paths.config_file,
        &GatewayConfig {
            workspace_slug: "workspace".to_string(),
            workspace_name: "My Workspace".to_string(),
            workspace_path: paths.default_workspace.clone(),
            repo_url: String::new(),
            branch: "main".to_string(),
        },
    )
    .unwrap();

    assert!(is_installed(&paths).unwrap());

    let _ = fs::remove_dir_all(root);
}

#[test]
fn configured_profile_initializes_plain_workspace() {
    let root = temp_root("profile");
    let paths = RuntimePaths {
        config_file: root.join("config"),
        default_workspace: root.join("default"),
    };
    let workspace = root.join("workspace");
    fs::create_dir_all(&workspace).unwrap();
    save_config(
        &paths.config_file,
        &GatewayConfig {
            workspace_slug: "profile".to_string(),
            workspace_name: "Profile".to_string(),
            workspace_path: workspace.clone(),
            repo_url: String::new(),
            branch: "main".to_string(),
        },
    )
    .unwrap();

    assert!(configured_profile(&paths).unwrap().is_some());
    fs::create_dir_all(workspace.join("notes")).unwrap();
    fs::write(workspace.join("notes/welcome.md"), "# Changed\n").unwrap();
    assert!(commit_note(&workspace, "notes/welcome.md").unwrap());

    let _ = fs::remove_dir_all(root);
}

#[test]
fn configured_profile_clones_remote_workspace() {
    let root = temp_root("clone-profile");
    let source = root.join("source");
    fs::create_dir_all(source.join("notes")).unwrap();
    Command::new("git")
        .args(["init", "-b", "main"])
        .current_dir(&source)
        .status()
        .unwrap();
    Command::new("git")
        .args(["config", "user.name", "Test User"])
        .current_dir(&source)
        .status()
        .unwrap();
    Command::new("git")
        .args(["config", "user.email", "test@example.com"])
        .current_dir(&source)
        .status()
        .unwrap();
    fs::write(source.join("notes/welcome.md"), "# Cloned\n").unwrap();
    Command::new("git")
        .args(["add", "."])
        .current_dir(&source)
        .status()
        .unwrap();
    Command::new("git")
        .args(["commit", "-m", "Initial"])
        .current_dir(&source)
        .status()
        .unwrap();

    let paths = RuntimePaths {
        config_file: root.join("config"),
        default_workspace: root.join("workspaces"),
    };
    let clone_path = paths.default_workspace.join("notes");
    save_config(
        &paths.config_file,
        &GatewayConfig {
            workspace_slug: "notes".to_string(),
            workspace_name: "Notes".to_string(),
            workspace_path: clone_path.clone(),
            repo_url: source.to_string_lossy().to_string(),
            branch: "main".to_string(),
        },
    )
    .unwrap();

    assert!(configured_profile(&paths).unwrap().is_some());
    assert!(clone_path.join(".git").exists());
    assert!(clone_path.join("notes/welcome.md").exists());

    let _ = fs::remove_dir_all(root);
}

#[test]
fn configured_profile_seeds_empty_cloned_repository() {
    let root = temp_root("clone-empty");
    fs::create_dir_all(&root).unwrap();
    let source = root.join("source");
    fs::create_dir_all(&source).unwrap();
    Command::new("git")
        .args(["init", "-b", "main"])
        .current_dir(&source)
        .status()
        .unwrap();

    let paths = RuntimePaths {
        config_file: root.join("config"),
        default_workspace: root.join("workspaces"),
    };
    let clone_path = paths.default_workspace.join("notes");
    save_config(
        &paths.config_file,
        &GatewayConfig {
            workspace_slug: "notes".to_string(),
            workspace_name: "Notes".to_string(),
            workspace_path: clone_path.clone(),
            repo_url: source.to_string_lossy().to_string(),
            branch: "main".to_string(),
        },
    )
    .unwrap();

    assert!(configured_profile(&paths).unwrap().is_some());
    assert!(clone_path.join("notes/welcome.md").exists());

    let _ = fs::remove_dir_all(root);
}

#[test]
fn onboarding_form_decodes_values_and_defaults() {
    let config = parse_onboarding_form(
        "repo_mode=remote&workspace_name=Team+Notes&workspace_path=%2Ftmp%2Fmy+notes&repo_url=git%40example.com%3Ame%2Fnotes.git&branch=",
        PathBuf::from("/tmp/default").as_path(),
    );

    assert_eq!(config.workspace_name, "Team Notes");
    assert_eq!(config.workspace_slug, "notes");
    assert_eq!(config.workspace_path, PathBuf::from("/tmp/default/notes"));
    assert_eq!(config.repo_url, "git@example.com:me/notes.git");
    assert_eq!(config.branch, "main");
}

#[test]
fn onboarding_form_prefers_custom_workspace_slug() {
    let config = parse_onboarding_form(
        "repo_mode=remote&workspace_slug=team-space&workspace_path=%2Ftmp%2Fworkspaces&repo_url=git%40gitea.com%3Ayoramdelangen%2Fnotes.git",
        PathBuf::from("/tmp/default").as_path(),
    );

    assert_eq!(config.workspace_slug, "team-space");
    assert_eq!(
        config.workspace_path,
        PathBuf::from("/tmp/default/team-space")
    );
}

#[test]
fn onboarding_form_clears_remote_for_new_repository() {
    let config = parse_onboarding_form(
        "repo_mode=new&workspace_slug=notes&workspace_path=%2Ftmp%2Fworkspaces&repo_url=git%40gitea.com%3Ayoramdelangen%2Fnotes.git",
        PathBuf::from("/tmp/default").as_path(),
    );

    assert_eq!(config.workspace_slug, "notes");
    assert_eq!(config.repo_url, "");
    assert_eq!(config.workspace_path, PathBuf::from("/tmp/default/notes"));
}

#[test]
fn runtime_paths_use_env_overrides() {
    // ponytail: process env is global; use unlikely names and restore immediately.
    std::env::set_var("LIROX_CONFIG_FILE", "/tmp/lirox-config-test");
    std::env::set_var("LIROX_WORKSPACE_DIR", "/tmp/lirox-workspace-test");

    let paths = liroxnotes_gateway::runtime_paths();

    assert_eq!(paths.config_file, PathBuf::from("/tmp/lirox-config-test"));
    assert_eq!(
        paths.default_workspace,
        PathBuf::from("/tmp/lirox-workspace-test")
    );

    std::env::remove_var("LIROX_CONFIG_FILE");
    std::env::remove_var("LIROX_WORKSPACE_DIR");
}

#[test]
fn workspace_view_loads_configured_files() {
    let root = temp_root("view");
    fs::create_dir_all(root.join("notes")).unwrap();
    fs::write(root.join("notes/welcome.md"), "# Loaded From Disk\n\n#real").unwrap();
    ensure_workspace(&root).unwrap();
    let config = GatewayConfig {
        workspace_slug: "loaded-from-disk".to_string(),
        workspace_name: "Loaded From Disk".to_string(),
        workspace_path: root.clone(),
        repo_url: String::new(),
        branch: "main".to_string(),
    };

    let view = workspace_view_for_config(&config, "notes/welcome.md").unwrap();

    assert_eq!(view.slug, "loaded-from-disk");
    assert_eq!(view.name, "Loaded From Disk");
    assert_eq!(view.selected_note.title, "Loaded From Disk");
    assert_eq!(view.selected_note_body, "# Loaded From Disk\n\n#real");
    assert_eq!(view.source, "local git");
    assert_eq!(view.note_count, 1);

    let _ = fs::remove_dir_all(root);
}

#[test]
fn parses_port_from_args() {
    assert_eq!(
        port_from_args(["bin".into(), "--port".into(), "4100".into()]),
        4100
    );
    assert_eq!(
        port_from_args(["bin".into(), "-p".into(), "4200".into()]),
        4200
    );
    assert_eq!(port_from_args(["bin".into(), "--port=4300".into()]), 4300);
    assert_eq!(port_from_args(["bin".into()]), 3000);
}
