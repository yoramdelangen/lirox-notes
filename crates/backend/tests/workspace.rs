use liroxnotes_backend::{
    create_configured_workspace, create_workspace, existing_workspaces, load_app_config,
    load_config, load_repository_config, read_note_body, save_note_body, save_workspace_theme,
    GatewayConfig, RepositoryWorkspace, RuntimePaths, WorkspaceSetup,
};
use liroxnotes_shared::WorkspaceTheme;
use std::{fs, path::PathBuf};
use uuid::Uuid;

#[test]
fn lirox_toml_stores_only_workspace_themes() {
    let root: PathBuf = std::env::temp_dir().join(format!("lirox-backend-{}", Uuid::new_v4()));
    fs::create_dir_all(&root).unwrap();
    // A file written by an older version still carries application-level keys.
    fs::write(
        root.join(".lirox.toml"),
        "format_version = 1\n\n[workspaces.notes]\nname = \"Notes\"\nrelative_path = \"notes\"\n",
    )
    .unwrap();

    let mut theme = WorkspaceTheme::default();
    theme.colors.accent = "#112233".into();
    save_workspace_theme(&root, "notes", &theme).unwrap();
    save_workspace_theme(&root, "work", &theme).unwrap();

    let config = load_repository_config(&root).unwrap();
    assert_eq!(
        config.workspaces.get("notes"),
        Some(&RepositoryWorkspace {
            theme: theme.clone()
        })
    );
    assert_eq!(
        config.workspaces.get("work"),
        Some(&RepositoryWorkspace { theme })
    );
    let persisted = fs::read_to_string(root.join(".lirox.toml")).unwrap();
    assert!(!persisted.contains("relative_path"), "{persisted}");
    assert!(!persisted.contains("name ="), "{persisted}");
    let _ = fs::remove_dir_all(root);
}

#[test]
fn workspace_setup_rejects_repository_path_traversal() {
    let root = std::env::temp_dir().join(format!("lirox-setup-traversal-{}", Uuid::new_v4()));
    let paths = RuntimePaths {
        config_file: root.join("config"),
        default_workspace: root.join("data"),
    };

    let result = create_workspace(
        &paths,
        &WorkspaceSetup {
            existing_repository: true,
            slug: "notes".into(),
            name: "Notes".into(),
            repo_url: String::new(),
            repository_path: "../outside".into(),
            workspace_path: "notes".into(),
            branch: "main".into(),
        },
    );

    assert_eq!(result.unwrap_err().kind(), std::io::ErrorKind::InvalidInput);
    assert!(!root.exists());
}

#[test]
fn existing_repository_root_is_allowed_with_a_non_root_workspace_subpath() {
    let root = std::env::temp_dir().join(format!("lirox-existing-root-{}", Uuid::new_v4()));
    let paths = RuntimePaths {
        config_file: root.join("config"),
        default_workspace: root.join("data"),
    };
    let repository = paths.default_workspace.clone();
    std::fs::create_dir_all(&repository).unwrap();
    assert!(std::process::Command::new("git")
        .args(["init", "-q"])
        .current_dir(&repository)
        .status()
        .unwrap()
        .success());

    let config = create_workspace(
        &paths,
        &WorkspaceSetup {
            existing_repository: true,
            slug: "notes".into(),
            name: "Notes".into(),
            repo_url: String::new(),
            repository_path: ".".into(),
            workspace_path: "notes".into(),
            branch: "main".into(),
        },
    )
    .unwrap();

    assert_eq!(config.workspace_path, repository);
    assert_eq!(config.relative_path, "notes");
    assert!(!repository.join(".lirox.toml").exists());
    let _ = fs::remove_dir_all(root);
}

#[test]
fn reading_a_note_rejects_traversal_and_returns_the_saved_body() {
    let root = std::env::temp_dir().join(format!("lirox-read-note-{}", Uuid::new_v4()));
    let config = GatewayConfig {
        workspace_slug: "notes".into(),
        workspace_name: "Notes".into(),
        workspace_path: root.join("notes"),
        relative_path: String::new(),
        repo_url: String::new(),
        branch: "main".into(),
    };
    std::fs::create_dir_all(&config.workspace_path).unwrap();
    std::fs::write(config.workspace_path.join("welcome.md"), "hello").unwrap();

    assert_eq!(read_note_body(&config, "welcome.md").unwrap(), "hello");
    assert_eq!(
        read_note_body(&config, "../outside.md").unwrap_err().kind(),
        std::io::ErrorKind::InvalidInput
    );
    let _ = fs::remove_dir_all(root);
}

#[test]
fn workspace_setup_persists_config_and_marks_onboarding_complete() {
    let root: PathBuf = std::env::temp_dir().join(format!("lirox-setup-{}", Uuid::new_v4()));
    let paths = RuntimePaths {
        config_file: root.join("config"),
        default_workspace: root.join("data"),
    };
    let config = GatewayConfig {
        workspace_slug: "notes".into(),
        workspace_name: "Notes".into(),
        workspace_path: root.join("data/notes"),
        relative_path: String::new(),
        repo_url: String::new(),
        branch: "main".into(),
    };

    create_configured_workspace(&paths, &config).unwrap();

    assert_eq!(load_config(&paths.config_file).unwrap(), Some(config));
    assert!(std::fs::read_to_string(root.join("install"))
        .unwrap()
        .contains("onboarding_complete=true"));
    let _ = fs::remove_dir_all(root);
}

#[test]
fn repository_name_comes_from_the_last_url_segment() {
    use liroxnotes_backend::repository_name_from_url;

    for url in [
        "git@github.com:yoramdelangen/my-notes.git",
        "https://github.com/yoramdelangen/my-notes.git",
        "https://github.com/yoramdelangen/my-notes/",
        "ssh://git@example.com:2222/team/my-notes.git",
        "file:///srv/git/my-notes.git",
    ] {
        assert_eq!(
            repository_name_from_url(url).as_deref(),
            Some("my-notes"),
            "{url}"
        );
    }
    assert_eq!(repository_name_from_url(""), None);
    assert_eq!(
        repository_name_from_url("https://github.com/owner/.git"),
        None
    );
}

fn bare_repository(name: &str, files: &[(&str, &str)]) -> PathBuf {
    let root = std::env::temp_dir().join(format!("lirox-inspect-test-{}", Uuid::new_v4()));
    let bare = root.join(format!("{name}.git"));
    let seed = root.join("seed");
    let git = |dir: &PathBuf, args: &[&str]| {
        let status = std::process::Command::new("git")
            .current_dir(dir)
            .args(["-c", "user.name=t", "-c", "user.email=t@t"])
            .args(args)
            .status()
            .unwrap();
        assert!(status.success(), "git {args:?}");
    };
    fs::create_dir_all(&seed).unwrap();
    git(
        &root,
        &["init", "-q", "--bare", "-b", "main", bare.to_str().unwrap()],
    );
    git(&seed, &["init", "-q", "-b", "main"]);
    for (path, contents) in files {
        let file = seed.join(path);
        fs::create_dir_all(file.parent().unwrap()).unwrap();
        fs::write(file, contents).unwrap();
    }
    git(&seed, &["add", "."]);
    git(&seed, &["commit", "-qm", "init"]);
    git(&seed, &["push", "-q", bare.to_str().unwrap(), "main"]);
    bare
}

#[test]
fn inspecting_a_repository_without_config_suggests_its_name() {
    use liroxnotes_backend::inspect_repository;

    let bare = bare_repository("my-notes", &[("welcome.md", "# Welcome\n")]);
    let metadata = inspect_repository(&format!("file://{}", bare.display()), "main").unwrap();

    assert_eq!(metadata.name.as_deref(), Some("my-notes"));
    assert_eq!(metadata.slug.as_deref(), Some("my-notes"));
    fs::remove_dir_all(bare.parent().unwrap()).unwrap();
}

#[test]
fn configured_workspace_name_wins_over_repository_name() {
    use liroxnotes_backend::inspect_repository;

    let bare = bare_repository(
        "my-notes",
        &[(
            ".lirox.toml",
            "[workspaces.research]\nname = \"Research\"\n",
        )],
    );
    let metadata = inspect_repository(&format!("file://{}", bare.display()), "main").unwrap();

    assert_eq!(metadata.name.as_deref(), Some("Research"));
    assert_eq!(metadata.slug.as_deref(), Some("research"));
    fs::remove_dir_all(bare.parent().unwrap()).unwrap();
}

#[test]
fn new_repository_workspace_is_scoped_to_the_entered_subpath() {
    use liroxnotes_backend::workspace_view_for_config;

    let bare = bare_repository(
        "my-notes",
        &[("root.md", "# Root\n"), ("work/plan.md", "# Plan\n")],
    );
    let root = bare.parent().unwrap().join("runtime");
    let paths = RuntimePaths {
        config_file: root.join("config"),
        default_workspace: root.join("data"),
    };

    let config = create_workspace(
        &paths,
        &WorkspaceSetup {
            existing_repository: false,
            slug: "my-notes".into(),
            name: "my-notes".into(),
            repo_url: format!("file://{}", bare.display()),
            repository_path: String::new(),
            workspace_path: "work".into(),
            branch: "main".into(),
        },
    )
    .unwrap();

    let clone = root.join("data/my-notes");
    assert_eq!(config.workspace_path, clone, "config stores the git root");
    assert_eq!(config.relative_path, "work");
    assert_eq!(
        load_config(&paths.config_file).unwrap(),
        Some(config.clone())
    );
    assert!(
        clone.join(".git").is_dir(),
        "repository is cloned at its root"
    );
    assert!(clone.join("root.md").is_file());
    assert!(
        !clone.join(".lirox.toml").exists(),
        "registration is application-level"
    );
    let notes: Vec<String> = workspace_view_for_config(&config, "")
        .unwrap()
        .notes
        .into_iter()
        .map(|note| note.path)
        .collect();
    assert_eq!(notes, vec!["plan.md".to_string()]);

    save_note_body(&config, "new.md", "# New\n".into()).unwrap();
    assert!(clone.join("work/new.md").is_file());
    assert!(!clone.join("new.md").exists());
    assert_eq!(read_note_body(&config, "plan.md").unwrap(), "# Plan\n");
    fs::remove_dir_all(bare.parent().unwrap()).unwrap();
}

#[test]
fn switcher_offers_only_unregistered_top_level_folders() {
    let bare = bare_repository(
        "my-notes",
        &[
            ("root.md", "# Root\n"),
            ("work/plan.md", "# Plan\n"),
            ("work/php/notes.md", "# PHP\n"),
            ("personal/projects/idea.md", "# Idea\n"),
            ("cyber/sec.md", "# Sec\n"),
            (".github/ci.md", "# CI\n"),
        ],
    );
    let root = bare.parent().unwrap().join("runtime");
    let paths = RuntimePaths {
        config_file: root.join("config"),
        default_workspace: root.join("data"),
    };
    let setup = |slug: &str, workspace_path: &str| WorkspaceSetup {
        existing_repository: false,
        slug: slug.into(),
        name: slug.into(),
        repo_url: format!("file://{}", bare.display()),
        repository_path: String::new(),
        workspace_path: workspace_path.into(),
        branch: "main".into(),
    };
    let available = |paths: &RuntimePaths| -> Vec<String> {
        let registered = load_app_config(&paths.config_file).unwrap().workspaces;
        existing_workspaces(&paths.default_workspace, &registered)
            .unwrap()
            .into_iter()
            .map(|workspace| format!("{}:{}", workspace.repository, workspace.path))
            .collect()
    };

    create_workspace(&paths, &setup("my-notes", "")).unwrap();
    assert_eq!(
        available(&paths),
        vec!["my-notes:cyber", "my-notes:personal", "my-notes:work"]
    );

    create_workspace(
        &paths,
        &WorkspaceSetup {
            existing_repository: true,
            repository_path: "my-notes".into(),
            ..setup("work", "work")
        },
    )
    .unwrap();
    assert_eq!(
        available(&paths),
        vec!["my-notes:cyber", "my-notes:personal"]
    );
    assert_eq!(
        load_app_config(&paths.config_file)
            .unwrap()
            .workspaces
            .len(),
        2
    );
    fs::remove_dir_all(bare.parent().unwrap()).unwrap();
}
