use super::{ApplicationEvent, ApplicationState, AuthCommand, AuthEvent, Effect};
use crate::command::CommandInvocation;
use std::{cell::RefCell, rc::Rc};

#[derive(Clone, Debug, Default)]
pub struct Dispatcher {
    effects: Rc<RefCell<Vec<Effect>>>,
}

impl Dispatcher {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn dispatch(&self, state: &mut ApplicationState, invocation: CommandInvocation) {
        let effects = dispatch(state, invocation);
        self.enqueue(state, effects);
    }

    pub fn dispatch_event(&self, state: &mut ApplicationState, event: ApplicationEvent) {
        let effects = super::reducer::apply_event(state, event);
        self.enqueue(state, effects);
    }

    fn enqueue(&self, state: &mut ApplicationState, effects: Vec<Effect>) {
        if !effects.is_empty() {
            state.effect_version = state.effect_version.wrapping_add(1);
            self.effects.borrow_mut().extend(effects);
        }
    }

    pub fn dispatch_auth_command(&self, state: &mut ApplicationState, command: AuthCommand) {
        let event = match command {
            AuthCommand::RegisterPasskey => AuthEvent::RegisterPasskey,
            AuthCommand::Login => AuthEvent::Login,
            AuthCommand::AutoLogin => AuthEvent::AutoLogin,
            AuthCommand::Logout => AuthEvent::Logout,
            AuthCommand::CreateWorkspace(fields) => AuthEvent::CreateWorkspace(fields),
            AuthCommand::SetSetupStep(step) => AuthEvent::SetSetupStep(step),
            AuthCommand::SelectExistingWorkspace(workspace) => {
                AuthEvent::SelectExistingWorkspace(workspace)
            }
            AuthCommand::LoadExistingWorkspaces => AuthEvent::LoadExistingWorkspaces,
            AuthCommand::SwitchWorkspace(slug) => AuthEvent::SwitchWorkspace(slug),
            AuthCommand::InspectRepository { repo_url, branch } => {
                AuthEvent::InspectRepository { repo_url, branch }
            }
            AuthCommand::Retry => AuthEvent::Retry,
        };
        self.dispatch_event(state, ApplicationEvent::Auth(event));
    }

    pub fn take_effects(&self) -> Vec<Effect> {
        std::mem::take(&mut *self.effects.borrow_mut())
    }
}

pub fn dispatch(state: &mut ApplicationState, invocation: CommandInvocation) -> Vec<Effect> {
    super::reducer::reduce(state, invocation)
}
