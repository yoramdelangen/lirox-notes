use super::{ApplicationState, Effect};
use crate::command::CommandInvocation;

#[derive(Clone, Copy, Debug, Default)]
pub struct Dispatcher;

impl Dispatcher {
    pub fn dispatch(
        &self,
        state: &mut ApplicationState,
        invocation: CommandInvocation,
    ) -> Vec<Effect> {
        dispatch(state, invocation)
    }
}

pub fn dispatch(state: &mut ApplicationState, invocation: CommandInvocation) -> Vec<Effect> {
    super::reducer::reduce(state, invocation)
}
