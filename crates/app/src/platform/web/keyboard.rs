use crate::input::{InputEvent, Key, KeyStroke, Modifiers};
use dioxus::html::{KeyboardEvent, ModifiersInteraction};
use dioxus::web::WebEventExt;

pub fn normalize_keyboard_event(event: &KeyboardEvent) -> Option<InputEvent> {
    normalize_key(event.data().key(), event.data().modifiers())
}

fn normalize_key(
    key: dioxus::html::Key,
    browser_modifiers: dioxus::html::Modifiers,
) -> Option<InputEvent> {
    let key = match key {
        dioxus::html::Key::Character(value) => {
            let character = value.chars().next()?;
            if value.chars().count() != 1 {
                return None;
            }
            if character == ' ' {
                Key::Space
            } else {
                Key::Char(character)
            }
        }
        dioxus::html::Key::Enter => Key::Enter,
        dioxus::html::Key::Escape => Key::Escape,
        dioxus::html::Key::Tab => Key::Tab,
        dioxus::html::Key::Backspace => Key::Backspace,
        _ => return None,
    };
    Some(InputEvent::Key(KeyStroke::new(
        key,
        Modifiers::new(
            browser_modifiers.contains(dioxus::html::Modifiers::CONTROL),
            browser_modifiers.contains(dioxus::html::Modifiers::ALT),
            browser_modifiers.contains(dioxus::html::Modifiers::SHIFT),
            browser_modifiers.contains(dioxus::html::Modifiers::META),
        ),
    )))
}

pub fn is_editable_control(event: &KeyboardEvent) -> bool {
    let Some(web_event) = event.data().try_as_web_event() else {
        return false;
    };
    let Some(target) = web_event.target() else {
        return false;
    };
    use wasm_bindgen::JsCast;
    let Some(element) = target.dyn_ref::<web_sys::Element>() else {
        return false;
    };
    matches!(element.tag_name().as_str(), "INPUT" | "TEXTAREA")
        || element
            .dyn_ref::<web_sys::HtmlElement>()
            .is_some_and(web_sys::HtmlElement::is_content_editable)
}

pub fn should_intercept(event: &KeyboardEvent) -> bool {
    !is_editable_control(event)
        || normalize_keyboard_event(event).is_some_and(|event| {
            matches!(
                event,
                InputEvent::Key(KeyStroke {
                    key: Key::Escape,
                    ..
                })
            )
        })
}

#[cfg(test)]
mod tests {
    use super::*;
    use dioxus::html::{Key as BrowserKey, Modifiers as BrowserModifiers};

    #[test]
    fn normalizes_plain_character() {
        assert_eq!(
            normalize_key(BrowserKey::Character("j".into()), BrowserModifiers::empty()),
            Some(InputEvent::Key(KeyStroke::new(
                Key::Char('j'),
                Modifiers::NONE
            )))
        );
    }

    #[test]
    fn normalizes_ctrl_character() {
        assert_eq!(
            normalize_key(BrowserKey::Character("w".into()), BrowserModifiers::CONTROL),
            Some(InputEvent::Key(KeyStroke::new(
                Key::Char('w'),
                Modifiers::new(true, false, false, false)
            )))
        );
    }

    #[test]
    fn normalizes_escape() {
        assert_eq!(
            normalize_key(BrowserKey::Escape, BrowserModifiers::empty()),
            Some(InputEvent::Key(KeyStroke::new(
                Key::Escape,
                Modifiers::NONE
            )))
        );
    }

    #[test]
    fn normalizes_space() {
        assert_eq!(
            normalize_key(BrowserKey::Character(" ".into()), BrowserModifiers::empty()),
            Some(InputEvent::Key(KeyStroke::new(Key::Space, Modifiers::NONE)))
        );
    }
}
