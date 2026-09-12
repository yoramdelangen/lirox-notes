use crate::command::{CommandArgs, CommandInvocation, CommandSource};

use super::{InputMode, InputScope, InputState, KeyBinding, KeyStroke};

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ResolveResult {
    Matched(CommandInvocation),
    Pending,
    Unhandled,
}

pub fn resolve(
    bindings: &[KeyBinding],
    state: &mut InputState,
    stroke: KeyStroke,
    active_scopes: &[InputScope],
) -> ResolveResult {
    if state.mode == InputMode::Normal
        && state.pending.is_empty()
        && !stroke.modifiers.ctrl
        && !stroke.modifiers.alt
        && !stroke.modifiers.meta
    {
        if let super::Key::Char(digit @ '0'..='9') = stroke.key {
            state.count = Some(
                state
                    .count
                    .unwrap_or(0)
                    .saturating_mul(10)
                    .saturating_add(digit as u32 - '0' as u32),
            );
            return ResolveResult::Pending;
        }
    }

    state.pending.push(stroke);
    for rank in 0..5 {
        for scope in active_scopes
            .iter()
            .filter(|scope| scope_rank(scope) == rank)
        {
            let candidates = bindings.iter().filter(|binding| {
                &binding.scope == scope && binding.mode.is_none_or(|mode| mode == state.mode)
            });
            let mut exact = None;
            let mut longer_prefix = false;
            for binding in candidates {
                if binding.sequence.starts_with(&state.pending) {
                    if binding.sequence.len() > state.pending.len() {
                        longer_prefix = true;
                    }
                    if binding.sequence == state.pending {
                        exact.get_or_insert(binding);
                    }
                }
            }
            if longer_prefix {
                return ResolveResult::Pending;
            }
            if let Some(binding) = exact {
                let args = match binding.args {
                    CommandArgs::Count(_) => CommandArgs::Count(state.count.unwrap_or(1)),
                    ref args => args.clone(),
                };
                state.pending = super::KeySequence::new();
                state.count = None;
                return ResolveResult::Matched(CommandInvocation {
                    id: binding.command.clone(),
                    args,
                    source: CommandSource::Keyboard,
                });
            }
        }
    }
    state.pending = super::KeySequence::new();
    state.count = None;
    ResolveResult::Unhandled
}

fn scope_rank(scope: &InputScope) -> u8 {
    match scope {
        InputScope::Overlay => 0,
        InputScope::SurfaceInstance(_) => 1,
        InputScope::Surface(_) => 2,
        InputScope::Workspace => 3,
        InputScope::Global => 4,
    }
}
