use super::{ApplicationState, Effect};
use crate::command::CommandInvocation;

pub fn dispatch(state: &mut ApplicationState, invocation: CommandInvocation) -> Vec<Effect> {
    super::reducer::reduce(state, invocation)
}
