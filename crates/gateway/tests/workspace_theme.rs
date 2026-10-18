use actix_web::{body::to_bytes, http::StatusCode, test, App};
use liroxnotes_gateway::{
    auth::{AccountRecord, AuthService, AuthStore, CredentialRecord, StoredSession},
    configure_app, ensure_workspace, load_repository_config, register_workspace, save_config,
    GatewayConfig, RuntimePaths,
};
use liroxnotes_shared::{WorkspaceTheme, WorkspaceView};
use std::{fs, path::PathBuf};
use uuid::Uuid;
use webauthn_rs::prelude::{Url, WebauthnBuilder};

struct Fixture {
    base: PathBuf,
    paths: RuntimePaths,
    config: GatewayConfig,
}

impl Fixture {
    fn authenticated() -> Self {
        let base = std::env::temp_dir().join(format!("lirox-theme-api-{}", Uuid::new_v4()));
        fs::create_dir_all(&base).unwrap();
        let root = base.join("repositories");
        let repository = root.join("repo");
        let workspace = repository.join("notes");
        fs::create_dir_all(&workspace).unwrap();
        ensure_workspace(&repository).unwrap();
        fs::create_dir_all(workspace.join("notes")).unwrap();
        fs::write(workspace.join("notes/welcome.md"), "# Welcome\n").unwrap();

        let paths = RuntimePaths {
            config_file: base.join("runtime-config"),
            default_workspace: root.clone(),
        };
        fs::write(
            paths.config_file.with_file_name("install"),
            format!(
                "installed=true\nworkspace_root={}\nonboarding_complete=true\n",
                root.display()
            ),
        )
        .unwrap();
        let config = GatewayConfig {
            workspace_slug: "notes".into(),
            workspace_name: "Notes".into(),
            workspace_path: workspace,
            repo_url: String::new(),
            branch: "main".into(),
        };
        save_config(&paths.config_file, &config).unwrap();

        let store = AuthStore::new(paths.clone());
        store
            .save_account(&AccountRecord {
                version: 1,
                account_id: "account".into(),
                credentials: vec![CredentialRecord {
                    credential_id: "credential".into(),
                    public_key: "public-key".into(),
                    sign_count: 0,
                    label: "Passkey".into(),
                }],
            })
            .unwrap();
        store
            .save_session(&StoredSession {
                version: 1,
                token: "valid-token".into(),
                user: "local".into(),
                created_at: 1,
                expires_at: u64::MAX,
            })
            .unwrap();

        Self {
            base,
            paths,
            config,
        }
    }

    fn configure(&self, cfg: &mut actix_web::web::ServiceConfig) {
        let origin = Url::parse("http://localhost:3010").unwrap();
        let webauthn = WebauthnBuilder::new("localhost", &origin)
            .unwrap()
            .build()
            .unwrap();
        let auth = AuthService::new(AuthStore::new(self.paths.clone()), webauthn, 60);
        configure_app(cfg, self.paths.clone(), auth);
    }

    fn valid_theme() -> WorkspaceTheme {
        let mut theme = WorkspaceTheme::default();
        theme.colors.subtle = "#a6adc8".into();
        theme.colors.border = "#6c7086".into();
        theme
    }

    fn repo_root(&self) -> PathBuf {
        self.config.workspace_path.parent().unwrap().to_path_buf()
    }
}

#[actix_web::test]
async fn workspace_view_returns_default_theme_when_unsaved() {
    let fixture = Fixture::authenticated();
    let app = test::init_service(App::new().configure(|cfg| fixture.configure(cfg))).await;
    let response = test::call_service(
        &app,
        test::TestRequest::get()
            .uri("/api/workspace/")
            .cookie(actix_web::cookie::Cookie::new(
                "lirox_session",
                "valid-token",
            ))
            .to_request(),
    )
    .await;

    assert_eq!(response.status(), StatusCode::OK);
    let view: WorkspaceView =
        serde_json::from_slice(&to_bytes(response.into_body()).await.unwrap()).unwrap();
    assert_eq!(view.theme, WorkspaceTheme::default());
    let _ = fs::remove_dir_all(fixture.base);
}

#[actix_web::test]
async fn theme_put_requires_auth_and_rejects_unregistered_slug() {
    let fixture = Fixture::authenticated();
    register_workspace(
        &fixture.repo_root(),
        "notes",
        "Notes",
        "notes",
        &WorkspaceTheme::default(),
    )
    .unwrap();
    let app = test::init_service(App::new().configure(|cfg| fixture.configure(cfg))).await;

    let unauthenticated = test::call_service(
        &app,
        test::TestRequest::put()
            .uri("/api/workspaces/notes/theme")
            .set_json(WorkspaceTheme::default())
            .to_request(),
    )
    .await;
    assert_eq!(unauthenticated.status(), StatusCode::UNAUTHORIZED);

    let unknown = test::call_service(
        &app,
        test::TestRequest::put()
            .uri("/api/workspaces/other/theme")
            .cookie(actix_web::cookie::Cookie::new(
                "lirox_session",
                "valid-token",
            ))
            .set_json(Fixture::valid_theme())
            .to_request(),
    )
    .await;
    assert_eq!(unknown.status(), StatusCode::NOT_FOUND);
    let _ = fs::remove_dir_all(fixture.base);
}

#[actix_web::test]
async fn theme_put_validates_saves_and_isolates_sibling_workspace() {
    let fixture = Fixture::authenticated();
    register_workspace(
        &fixture.repo_root(),
        "notes",
        "Notes",
        "notes",
        &WorkspaceTheme::default(),
    )
    .unwrap();
    register_workspace(
        &fixture.repo_root(),
        "journal",
        "Journal",
        "journal",
        &WorkspaceTheme::default(),
    )
    .unwrap();
    let app = test::init_service(App::new().configure(|cfg| fixture.configure(cfg))).await;
    let saved = Fixture::valid_theme();
    let response = test::call_service(
        &app,
        test::TestRequest::put()
            .uri("/api/workspaces/notes/theme")
            .cookie(actix_web::cookie::Cookie::new(
                "lirox_session",
                "valid-token",
            ))
            .set_json(&saved)
            .to_request(),
    )
    .await;
    assert_eq!(response.status(), StatusCode::OK);
    let returned: WorkspaceTheme =
        serde_json::from_slice(&to_bytes(response.into_body()).await.unwrap()).unwrap();
    assert_eq!(returned, saved);

    let config = load_repository_config(&fixture.repo_root()).unwrap();
    assert_eq!(config.workspaces["notes"].theme, saved);
    assert_eq!(
        config.workspaces["journal"].theme,
        WorkspaceTheme::default()
    );

    let mut invalid_hex = saved.clone();
    invalid_hex.colors.accent = "red".into();
    let invalid = test::call_service(
        &app,
        test::TestRequest::put()
            .uri("/api/workspaces/notes/theme")
            .cookie(actix_web::cookie::Cookie::new(
                "lirox_session",
                "valid-token",
            ))
            .set_json(&invalid_hex)
            .to_request(),
    )
    .await;
    assert_eq!(invalid.status(), StatusCode::BAD_REQUEST);

    let mut low_contrast = saved.clone();
    low_contrast.colors.fg = low_contrast.colors.bg.clone();
    let invalid = test::call_service(
        &app,
        test::TestRequest::put()
            .uri("/api/workspaces/notes/theme")
            .cookie(actix_web::cookie::Cookie::new(
                "lirox_session",
                "valid-token",
            ))
            .set_json(&low_contrast)
            .to_request(),
    )
    .await;
    assert_eq!(invalid.status(), StatusCode::BAD_REQUEST);
    assert_eq!(
        load_repository_config(&fixture.repo_root())
            .unwrap()
            .workspaces["notes"]
            .theme,
        saved
    );
    let _ = fs::remove_dir_all(fixture.base);
}

#[actix_web::test]
async fn workspace_creation_registers_theme_in_repository_config() {
    let fixture = Fixture::authenticated();
    let app = test::init_service(App::new().configure(|cfg| fixture.configure(cfg))).await;
    let response = test::call_service(
        &app,
        test::TestRequest::post()
            .uri("/api/workspaces")
            .cookie(actix_web::cookie::Cookie::new(
                "lirox_session",
                "valid-token",
            ))
            .set_json(serde_json::json!({
                "workspace_slug": "new-notes",
                "workspace_name": "New Notes",
                "repo_mode": "new"
            }))
            .to_request(),
    )
    .await;
    assert_eq!(response.status(), StatusCode::CREATED);
    let root = fixture.paths.default_workspace.join("new-notes");
    let config = load_repository_config(&root).unwrap();
    assert_eq!(config.workspaces["new-notes"].name, "New Notes");
    assert_eq!(
        config.workspaces["new-notes"].theme,
        WorkspaceTheme::default()
    );
    let _ = fs::remove_dir_all(fixture.base);
}

#[actix_web::test]
async fn existing_workspace_registration_targets_repository_root() {
    let fixture = Fixture::authenticated();
    let app = test::init_service(App::new().configure(|cfg| fixture.configure(cfg))).await;
    let response = test::call_service(
        &app,
        test::TestRequest::post()
            .uri("/api/workspaces")
            .cookie(actix_web::cookie::Cookie::new(
                "lirox_session",
                "valid-token",
            ))
            .set_json(serde_json::json!({
                "repo_mode": "existing",
                "repository_path": "repo",
                "workspace_path": "personal",
                "workspace_slug": "personal",
                "workspace_name": "Personal"
            }))
            .to_request(),
    )
    .await;

    assert_eq!(response.status(), StatusCode::CREATED);
    let repo = fixture.paths.default_workspace.join("repo");
    let config = load_repository_config(&repo).unwrap();
    assert_eq!(config.workspaces["personal"].relative_path, "personal");
    assert!(!repo.join("personal/.lirox.toml").exists());
    let _ = fs::remove_dir_all(fixture.base);
}
