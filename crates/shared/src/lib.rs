pub const APP_NAME: &str = "LiroxNotes";

pub struct WorkspaceSummary {
    pub name: &'static str,
    pub branch: &'static str,
    pub changed_notes: usize,
    pub sync_state: &'static str,
}

pub fn mock_workspace() -> WorkspaceSummary {
    WorkspaceSummary {
        name: "MVP Workspace",
        branch: "main",
        changed_notes: 1,
        sync_state: "Local only",
    }
}
