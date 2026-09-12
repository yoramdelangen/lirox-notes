mod key;
mod keymap;
mod mode;
mod resolver;
mod scope;
mod sequence;
mod state;

pub use key::{Key, KeyStroke, Modifiers};
pub use keymap::KeyBinding;
pub use mode::InputMode;
pub use resolver::{resolve, ResolveResult};
pub use scope::{InputScope, SurfaceKind};
pub use sequence::KeySequence;
pub use state::InputState;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::{CommandArgs, CommandId, CommandInvocation, CommandSource, SurfaceId};

    fn stroke(key: Key) -> KeyStroke {
        KeyStroke::new(key, Modifiers::NONE)
    }

    fn binding(scope: InputScope, mode: Option<InputMode>, keys: &[Key], id: &str) -> KeyBinding {
        KeyBinding::new(
            scope,
            mode,
            KeySequence::from(keys.iter().cloned().map(stroke).collect::<Vec<_>>()),
            CommandId::new(id),
            CommandArgs::None,
        )
    }

    fn count_binding(keys: &[Key], id: &str) -> KeyBinding {
        KeyBinding::new(
            InputScope::Global,
            Some(InputMode::Normal),
            KeySequence::from(keys.iter().cloned().map(stroke).collect::<Vec<_>>()),
            CommandId::new(id),
            CommandArgs::Count(1),
        )
    }

    fn feed(bindings: &[KeyBinding], state: &mut InputState, key: Key) -> ResolveResult {
        resolve(bindings, state, stroke(key), &[InputScope::Global])
    }

    #[test]
    fn resolver_distinguishes_match_pending_and_unhandled() {
        let bindings = vec![
            binding(
                InputScope::Global,
                Some(InputMode::Normal),
                &[Key::Char('j')],
                "move",
            ),
            binding(
                InputScope::Global,
                Some(InputMode::Normal),
                &[Key::Char('g'), Key::Char('g')],
                "top",
            ),
        ];
        let mut state = InputState::default();
        assert!(matches!(
            feed(&bindings, &mut state, Key::Char('j')),
            ResolveResult::Matched(_)
        ));
        assert!(matches!(
            feed(&bindings, &mut state, Key::Char('g')),
            ResolveResult::Pending
        ));
        assert!(matches!(
            feed(&bindings, &mut state, Key::Char('x')),
            ResolveResult::Unhandled
        ));
    }

    #[test]
    fn more_specific_scope_wins() {
        let bindings = vec![
            binding(
                InputScope::Global,
                Some(InputMode::Normal),
                &[Key::Char('j')],
                "global",
            ),
            binding(
                InputScope::Surface(SurfaceKind::FileTree),
                Some(InputMode::Normal),
                &[Key::Char('j')],
                "file_tree",
            ),
        ];
        let mut state = InputState::default();
        let result = resolve(
            &bindings,
            &mut state,
            stroke(Key::Char('j')),
            &[
                InputScope::Surface(SurfaceKind::FileTree),
                InputScope::Global,
            ],
        );
        assert_eq!(
            result.command_id().map(CommandId::as_str),
            Some("file_tree")
        );
    }

    #[test]
    fn mode_filters_bindings() {
        let bindings = vec![
            binding(
                InputScope::Global,
                Some(InputMode::Normal),
                &[Key::Char('i')],
                "insert",
            ),
            binding(
                InputScope::Global,
                Some(InputMode::Insert),
                &[Key::Escape],
                "normal",
            ),
        ];
        let mut state = InputState::default();
        assert!(matches!(
            feed(&bindings, &mut state, Key::Char('i')),
            ResolveResult::Matched(_)
        ));
        state.mode = InputMode::Insert;
        assert!(matches!(
            feed(&bindings, &mut state, Key::Escape),
            ResolveResult::Matched(_)
        ));
    }

    #[test]
    fn counts_attach_and_default_to_one() {
        let bindings = vec![count_binding(&[Key::Char('j')], "move")];
        let mut state = InputState::default();
        assert_eq!(
            feed(&bindings, &mut state, Key::Char('j'))
                .invocation()
                .unwrap()
                .args,
            CommandArgs::Count(1)
        );
        feed(&bindings, &mut state, Key::Char('3'));
        assert_eq!(
            feed(&bindings, &mut state, Key::Char('j'))
                .invocation()
                .unwrap()
                .args,
            CommandArgs::Count(3)
        );
    }

    #[test]
    fn pending_and_count_reset_after_match_or_unhandled() {
        let bindings = vec![count_binding(&[Key::Char('g'), Key::Char('j')], "move")];
        let mut state = InputState::default();
        assert!(matches!(
            feed(&bindings, &mut state, Key::Char('2')),
            ResolveResult::Pending
        ));
        assert!(matches!(
            feed(&bindings, &mut state, Key::Char('g')),
            ResolveResult::Pending
        ));
        assert!(matches!(
            feed(&bindings, &mut state, Key::Char('j')),
            ResolveResult::Matched(_)
        ));
        assert!(state.pending.is_empty());
        assert_eq!(state.count, None);
        assert!(matches!(
            feed(&bindings, &mut state, Key::Char('x')),
            ResolveResult::Unhandled
        ));
        assert!(state.pending.is_empty());
    }

    #[test]
    fn key_primitives_normalize_modifiers() {
        assert_eq!(
            Modifiers::new(true, false, true, false),
            Modifiers {
                ctrl: true,
                alt: false,
                shift: true,
                meta: false
            }
        );
        assert_eq!(KeySequence::from(vec![stroke(Key::Space)]).len(), 1);
    }

    trait ResultExt {
        fn command_id(&self) -> Option<&CommandId>;
        fn invocation(&self) -> Option<&CommandInvocation>;
    }

    impl ResultExt for ResolveResult {
        fn command_id(&self) -> Option<&CommandId> {
            self.invocation().map(|invocation| &invocation.id)
        }
        fn invocation(&self) -> Option<&CommandInvocation> {
            match self {
                ResolveResult::Matched(invocation) => Some(invocation),
                _ => None,
            }
        }
    }

    #[allow(dead_code)]
    fn _surface_id_is_plain_rust() -> SurfaceId {
        SurfaceId::new("editor")
    }

    #[allow(dead_code)]
    fn _keyboard_source() -> CommandSource {
        CommandSource::Keyboard
    }
}
