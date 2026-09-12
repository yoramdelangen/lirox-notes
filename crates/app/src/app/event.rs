#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ApplicationEvent {
    Workspace(WorkspaceEvent),
    Status(StatusEvent),
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum WorkspaceEvent {
    OverlayClosed,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum StatusEvent {
    Message(String),
    Cleared,
}
