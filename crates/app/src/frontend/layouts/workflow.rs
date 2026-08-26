use dioxus::prelude::*;

#[component]
pub(crate) fn WorkflowLayout(children: Element) -> Element {
    rsx! {
        main {
            {children}
        }
    }
}
