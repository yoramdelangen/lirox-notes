use super::{ApplicationState, Effect};
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
        self.effects.borrow_mut().extend(effects);
    }

    pub fn take_effects(&self) -> Vec<Effect> {
        std::mem::take(&mut *self.effects.borrow_mut())
    }
}

pub fn dispatch(state: &mut ApplicationState, invocation: CommandInvocation) -> Vec<Effect> {
    super::reducer::reduce(state, invocation)
}
