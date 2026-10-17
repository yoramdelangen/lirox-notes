use dioxus::prelude::*;
use tw_merge::tw_merge;

#[component]
pub fn Empty(#[props(into, optional)] class: Option<String>, children: Element) -> Element {
    let class = tw_merge!(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center",
        class.as_deref().unwrap_or("")
    );
    rsx! { div { class: "{class}", {children} } }
}

#[component]
pub fn EmptyHeader(#[props(into, optional)] class: Option<String>, children: Element) -> Element {
    let class = tw_merge!(
        "flex flex-col items-center gap-2",
        class.as_deref().unwrap_or("")
    );
    rsx! { div { class: "{class}", {children} } }
}

#[component]
pub fn EmptyTitle(#[props(into, optional)] class: Option<String>, children: Element) -> Element {
    let class = tw_merge!(
        "text-lg font-semibold leading-none",
        class.as_deref().unwrap_or("")
    );
    rsx! { h3 { class: "{class}", {children} } }
}

#[component]
pub fn EmptyDescription(
    #[props(into, optional)] class: Option<String>,
    children: Element,
) -> Element {
    let class = tw_merge!(
        "text-muted-foreground text-sm",
        class.as_deref().unwrap_or("")
    );
    rsx! { p { class: "{class}", {children} } }
}

#[component]
pub fn EmptyContent(#[props(into, optional)] class: Option<String>, children: Element) -> Element {
    let class = tw_merge!(
        "flex items-center justify-center gap-2",
        class.as_deref().unwrap_or("")
    );
    rsx! { div { class: "{class}", {children} } }
}

#[derive(Default, Clone, PartialEq, Eq)]
pub enum EmptyMediaVariant {
    #[default]
    Default,
    Icon,
}

#[component]
pub fn EmptyMedia(
    #[props(into, optional)] class: Option<String>,
    #[props(default = EmptyMediaVariant::default())] variant: EmptyMediaVariant,
    children: Element,
) -> Element {
    let variant_class = match variant {
        EmptyMediaVariant::Default => "bg-transparent",
        EmptyMediaVariant::Icon => {
            "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6"
        }
    };
    let class = tw_merge!(
        "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variant_class,
        class.as_deref().unwrap_or("")
    );
    rsx! { div { class: "{class}", {children} } }
}
