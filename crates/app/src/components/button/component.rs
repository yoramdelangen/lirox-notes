use dioxus::prelude::*;
use dioxus_primitives::dioxus_attributes::attributes;
use dioxus_primitives::merge_attributes;

#[css_module("/src/components/button/style.css")]
struct Styles;

#[derive(Copy, Clone, PartialEq, Default)]
#[non_exhaustive]
pub enum ButtonVariant {
    #[default]
    Primary,
    Secondary,
    Destructive,
    Outline,
    Ghost,
    Link,
}

impl ButtonVariant {
    pub fn class(self) -> &'static str {
        match self {
            Self::Primary => "primary",
            Self::Secondary => "secondary",
            Self::Destructive => "destructive",
            Self::Outline => "outline",
            Self::Ghost => "ghost",
            Self::Link => "link",
        }
    }
}

#[derive(Copy, Clone, PartialEq, Default)]
#[non_exhaustive]
pub enum ButtonSize {
    Xs,
    Sm,
    #[default]
    Default,
    Lg,
    Icon,
    IconXs,
    IconSm,
    IconLg,
}

impl ButtonSize {
    pub fn class(self) -> &'static str {
        match self {
            Self::Xs => "xs",
            Self::Sm => "sm",
            Self::Default => "default",
            Self::Lg => "lg",
            Self::Icon => "icon",
            Self::IconXs => "icon-xs",
            Self::IconSm => "icon-sm",
            Self::IconLg => "icon-lg",
        }
    }
}

#[component]
pub fn Button(
    #[props(default)] variant: ButtonVariant,
    #[props(default)] size: ButtonSize,
    #[props(extends=GlobalAttributes)] attributes: Vec<Attribute>,
    r#type: Option<String>,
    #[props(default)] disabled: bool,
    #[props(default)] autofocus: bool,
    onclick: Option<EventHandler<MouseEvent>>,
    onmousedown: Option<EventHandler<MouseEvent>>,
    onmouseup: Option<EventHandler<MouseEvent>>,
    onkeydown: Option<EventHandler<KeyboardEvent>>,
    children: Element,
) -> Element {
    let base = attributes!(button {
        class: Styles::dx_button,
        "data-style": variant.class(),
        "data-size": size.class(),
        r#type: r#type,
        disabled: disabled,
        autofocus: autofocus,
    });
    let merged = merge_attributes(vec![base, attributes]);

    rsx! {
        button {
            onclick: move |event| {
                if let Some(handler) = &onclick {
                    handler.call(event);
                }
            },
            onmousedown: move |event| {
                if let Some(handler) = &onmousedown {
                    handler.call(event);
                }
            },
            onmouseup: move |event| {
                if let Some(handler) = &onmouseup {
                    handler.call(event);
                }
            },
            onkeydown: move |event| {
                if let Some(handler) = &onkeydown {
                    handler.call(event);
                }
            },
            ..merged,
            {children}
        }
    }
}
