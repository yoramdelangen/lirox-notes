use dioxus::prelude::*;
use tw_merge::tw_merge;

#[allow(dead_code)]
#[derive(Default, Clone, PartialEq, Eq)]
pub enum InputType {
    #[default]
    Text,
    Email,
    Password,
    Search,
    Url,
}

impl InputType {
    #[must_use]
    pub const fn as_str(&self) -> &'static str {
        match self {
            Self::Text => "text",
            Self::Email => "email",
            Self::Password => "password",
            Self::Search => "search",
            Self::Url => "url",
        }
    }
}

#[component]
pub fn Input(
    #[props(into, optional)] class: Option<String>,
    #[props(default = InputType::default())] r#type: InputType,
    #[props(into, optional)] placeholder: Option<String>,
    #[props(into, optional)] name: Option<String>,
    #[props(into, optional)] id: Option<String>,
    #[props(into, optional)] value: Option<String>,
    #[props(into, optional)] autocomplete: Option<String>,
    #[props(optional)] disabled: bool,
    #[props(optional)] readonly: bool,
    #[props(optional)] required: bool,
    #[props(extends=GlobalAttributes)] attributes: Vec<Attribute>,
    #[props(optional)] oninput: Option<EventHandler<FormEvent>>,
) -> Element {
    let merged_class = tw_merge!(
        "text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 read-only:bg-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        class.as_deref().unwrap_or("")
    );

    rsx! {
        input {
            "data-name": "Input",
            r#type: r#type.as_str(),
            class: "{merged_class}",
            placeholder: placeholder,
            value: value,
            autocomplete: autocomplete,
            name: name,
            id: id,
            disabled: disabled,
            readonly: readonly,
            required: required,
            oninput: move |event| {
                if let Some(handler) = &oninput {
                    handler.call(event);
                }
            },
            ..attributes,
        }
    }
}
