use liroxnotes_backend::{
    activate_workspace, format_app_config, load_app_config, load_config, parse_app_config,
    save_config, AppConfig, GatewayConfig,
};
use std::path::PathBuf;
use uuid::Uuid;

fn workspace(slug: &str, relative_path: &str) -> GatewayConfig {
    GatewayConfig {
        workspace_slug: slug.into(),
        workspace_name: slug.into(),
        workspace_path: PathBuf::from("/data/my-notes"),
        relative_path: relative_path.into(),
        repo_url: "git@github.com:owner/my-notes.git".into(),
        branch: "main".into(),
    }
}

#[test]
fn registry_round_trips_every_workspace_and_the_active_one() {
    let config = AppConfig {
        active: "work".into(),
        workspaces: vec![workspace("my-notes", ""), workspace("work", "work")],
    };

    assert_eq!(parse_app_config(&format_app_config(&config)), config);
}

#[test]
fn legacy_single_workspace_config_is_read_as_one_registered_workspace() {
    let config = parse_app_config(
        "workspace_slug=notes\nworkspace_name=Notes\nworkspace_path=/work/notes\nrepo_url=https://example.test/notes.git\nbranch=main\n",
    );

    assert_eq!(config.active, "notes");
    assert_eq!(
        config.workspaces,
        vec![GatewayConfig {
            workspace_slug: "notes".into(),
            workspace_name: "Notes".into(),
            workspace_path: PathBuf::from("/work/notes"),
            relative_path: String::new(),
            repo_url: "https://example.test/notes.git".into(),
            branch: "main".into(),
        }]
    );
}

#[test]
fn saving_registers_and_activates_without_dropping_other_workspaces() {
    let file = std::env::temp_dir().join(format!("lirox-config-{}", Uuid::new_v4()));

    save_config(&file, &workspace("my-notes", "")).unwrap();
    save_config(&file, &workspace("work", "work")).unwrap();
    assert_eq!(load_config(&file).unwrap().unwrap().workspace_slug, "work");
    assert_eq!(load_app_config(&file).unwrap().workspaces.len(), 2);

    let active = activate_workspace(&file, "my-notes").unwrap();
    assert_eq!(active.workspace_slug, "my-notes");
    assert_eq!(
        load_config(&file).unwrap().unwrap().workspace_slug,
        "my-notes"
    );
    assert_eq!(
        activate_workspace(&file, "missing").unwrap_err().kind(),
        std::io::ErrorKind::NotFound
    );
    let _ = std::fs::remove_file(file);
}
