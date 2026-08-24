use dioxus::prelude::*;

#[component]
pub(crate) fn WorkflowLayout(children: Element) -> Element {
    rsx! {
        div { class: "screen-shell",
            main { class: "panel-card panel-card-lg",
                {children}
            }
        }
    }
}
