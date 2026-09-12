use actix_web::{
    body::to_bytes,
    http::{header, StatusCode},
    test, App,
};
use liroxnotes_gateway::{auth::*, configure_app, save_config, GatewayConfig, RuntimePaths};
use std::{
    fs,
    time::{SystemTime, UNIX_EPOCH},
};
use webauthn_rs::prelude::{Url, WebauthnBuilder};

struct Fixture {
    paths: RuntimePaths,
}

impl Fixture {
    fn fresh() -> Self {
        Self::new("fresh")
    }

    fn expired_session() -> Self {
        let fixture = Self::new("expired");
        AuthStore::new(fixture.paths.clone())
            .save_session(&StoredSession {
                version: 1,
                token: "expired-token".into(),
                user: "local".into(),
                created_at: 1,
                expires_at: 2,
            })
            .unwrap();
        fixture
    }

    fn authenticated() -> Self {
        let fixture = Self::new("authenticated");
        fs::write(
            fixture.paths.config_file.with_file_name("install"),
            format!(
                "installed=true\nworkspace_root={}\n",
                fixture.paths.default_workspace.display()
            ),
        )
        .unwrap();
        AuthStore::new(fixture.paths.clone())
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
        AuthStore::new(fixture.paths.clone())
            .save_session(&StoredSession {
                version: 1,
                token: "valid-token".into(),
                user: "local".into(),
                created_at: 1,
                expires_at: u64::MAX,
            })
            .unwrap();
        fixture
    }

    fn authenticated_without_workspace() -> Self {
        Self::authenticated()
    }

    fn custom_installation() -> Self {
        let fixture = Self::authenticated();
        let custom_root = fixture.paths.config_file.with_file_name("custom-root");
        fs::write(
            fixture.paths.config_file.with_file_name("install"),
            format!("installed=true\nworkspace_root={}\n", custom_root.display()),
        )
        .unwrap();
        save_config(
            &fixture.paths.config_file,
            &GatewayConfig {
                workspace_slug: "notes".into(),
                workspace_name: "Notes".into(),
                workspace_path: custom_root.join("notes"),
                repo_url: String::new(),
                branch: "main".into(),
            },
        )
        .unwrap();
        fixture
    }

    fn new(name: &str) -> Self {
        let root = std::env::temp_dir().join(format!(
            "lirox-auth-api-{name}-{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        let paths = RuntimePaths {
            config_file: root.join("config"),
            default_workspace: root.join("workspace"),
        };
        fs::create_dir_all(&root).unwrap();
        Self { paths }
    }

    fn configure(&self, cfg: &mut actix_web::web::ServiceConfig) {
        let origin = Url::parse("http://localhost:3010").unwrap();
        let webauthn = WebauthnBuilder::new("localhost", &origin)
            .unwrap()
            .build()
            .unwrap();
        configure_app(
            cfg,
            self.paths.clone(),
            AuthService::new(AuthStore::new(self.paths.clone()), webauthn, 60),
        );
    }
}

#[actix_web::test]
async fn fresh_install_reports_passkey_registration_required() {
    let fixture = Fixture::fresh();
    let app = test::init_service(App::new().configure(|cfg| fixture.configure(cfg))).await;
    let response = test::call_service(
        &app,
        test::TestRequest::get().uri("/api/bootstrap").to_request(),
    )
    .await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body()).await.unwrap();
    let bootstrap: BootstrapResponse = serde_json::from_slice(&body).unwrap();
    assert_eq!(bootstrap.onboarding, OnboardingStatus::NotStarted);
    assert!(!bootstrap.authenticated);
}

#[actix_web::test]
async fn expired_session_is_unauthenticated() {
    let fixture = Fixture::expired_session();
    let app = test::init_service(App::new().configure(|cfg| fixture.configure(cfg))).await;
    let response = test::call_service(
        &app,
        test::TestRequest::get()
            .uri("/api/auth/session")
            .cookie(actix_web::cookie::Cookie::new(
                "lirox_session",
                "expired-token",
            ))
            .to_request(),
    )
    .await;
    let body = to_bytes(response.into_body()).await.unwrap();
    let bootstrap: BootstrapResponse = serde_json::from_slice(&body).unwrap();
    assert!(!bootstrap.authenticated);
}

#[actix_web::test]
async fn logout_invalidates_session_and_clears_cookie() {
    let fixture = Fixture::authenticated();
    let app = test::init_service(App::new().configure(|cfg| fixture.configure(cfg))).await;
    let response = test::call_service(
        &app,
        test::TestRequest::post()
            .uri("/api/auth/logout")
            .cookie(actix_web::cookie::Cookie::new(
                "lirox_session",
                "valid-token",
            ))
            .to_request(),
    )
    .await;
    assert_eq!(response.status(), StatusCode::OK);
    assert!(response
        .headers()
        .get(header::SET_COOKIE)
        .unwrap()
        .to_str()
        .unwrap()
        .contains("Max-Age=0"));
    assert!(AuthStore::new(fixture.paths)
        .load_session()
        .unwrap()
        .is_none());
}

#[actix_web::test]
async fn unauthenticated_workspace_json_is_rejected() {
    let fixture = Fixture::authenticated();
    let app = test::init_service(App::new().configure(|cfg| fixture.configure(cfg))).await;
    let response = test::call_service(
        &app,
        test::TestRequest::get().uri("/api/workspaces").to_request(),
    )
    .await;
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[actix_web::test]
async fn workspace_creation_marks_onboarding_complete() {
    let fixture = Fixture::authenticated_without_workspace();
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
                "repo_mode": "new",
                "workspace_slug": "notes",
                "workspace_name": "Notes",
                "branch": "main"
            }))
            .to_request(),
    )
    .await;
    assert_eq!(response.status(), StatusCode::CREATED);
    assert!(
        fs::read_to_string(fixture.paths.config_file.with_file_name("install"))
            .unwrap()
            .lines()
            .any(|line| line == "onboarding_complete=true")
    );

    let response = test::call_service(
        &app,
        test::TestRequest::get()
            .uri("/api/bootstrap")
            .cookie(actix_web::cookie::Cookie::new(
                "lirox_session",
                "valid-token",
            ))
            .to_request(),
    )
    .await;
    let body = to_bytes(response.into_body()).await.unwrap();
    let bootstrap: BootstrapResponse = serde_json::from_slice(&body).unwrap();
    assert_eq!(bootstrap.onboarding, OnboardingStatus::Complete);
}

#[actix_web::test]
async fn bootstrap_reports_custom_application_workspace_root() {
    let fixture = Fixture::custom_installation();
    let app = test::init_service(App::new().configure(|cfg| fixture.configure(cfg))).await;
    let response = test::call_service(
        &app,
        test::TestRequest::get().uri("/api/bootstrap").to_request(),
    )
    .await;
    let body = to_bytes(response.into_body()).await.unwrap();
    let bootstrap: BootstrapResponse = serde_json::from_slice(&body).unwrap();
    assert_eq!(
        bootstrap.workspace_root,
        fixture
            .paths
            .config_file
            .with_file_name("custom-root")
            .to_string_lossy()
    );
}

#[actix_web::test]
async fn legacy_auth_endpoint_keeps_session_response_schema() {
    let fixture = Fixture::fresh();
    let app = test::init_service(App::new().configure(|cfg| fixture.configure(cfg))).await;
    let response =
        test::call_service(&app, test::TestRequest::get().uri("/api/auth").to_request()).await;
    let body = to_bytes(response.into_body()).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert!(json.get("auth_mode").is_some());
    assert!(json.get("onboarding").is_none());
}
