use actix_web::{
    body::to_bytes,
    http::{header, StatusCode},
    test, App,
};
use liroxnotes_gateway::{auth::*, configure_app, RuntimePaths};
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
