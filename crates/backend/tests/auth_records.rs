use liroxnotes_backend::{
    auth::{parse_session, serialize_session, AuthStore, StoredSession},
    RuntimePaths,
};

#[test]
fn stored_session_records_round_trip_and_expired_records_are_rejected() {
    let session = StoredSession {
        version: 1,
        token: "opaque-token".into(),
        user: "local".into(),
        created_at: 10,
        expires_at: u64::MAX,
    };

    assert_eq!(
        parse_session(&serialize_session(&session).unwrap()).unwrap(),
        session
    );
    let expired = StoredSession {
        expires_at: 2,
        ..session
    };
    assert!(parse_session(&serialize_session(&expired).unwrap()).is_err());
}

#[test]
fn protected_operations_reject_missing_or_expired_session_tokens() {
    let root = std::env::temp_dir().join(format!("lirox-auth-boundary-{}", uuid::Uuid::new_v4()));
    let store = AuthStore::new(RuntimePaths {
        config_file: root.join("config"),
        default_workspace: root.join("workspace"),
    });

    assert!(store.session_for_token("").unwrap().is_none());
    std::fs::create_dir_all(&root).unwrap();
    store
        .save_session(&StoredSession {
            version: 1,
            token: "expired-token".into(),
            user: "local".into(),
            created_at: 1,
            expires_at: 2,
        })
        .unwrap();
    assert!(store.session_for_token("expired-token").unwrap().is_none());

    let _ = std::fs::remove_dir_all(root);
}
