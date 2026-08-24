use dioxus::prelude::*;

#[component]
pub(crate) fn WorkspaceLayout(
    labels_notes: bool,
    top_bar: Element,
    sidebar: Element,
    editor: Element,
    status_bar: Element,
) -> Element {
    rsx! {
        div { class: "grid h-screen overflow-hidden grid-rows-[2.75rem_minmax(0,1fr)_2.25rem] bg-shell-bg text-theme-text antialiased",
            {top_bar}
            div {
                class: if labels_notes {
                    "grid min-h-0 h-full grid-cols-[33.333%_66.667%]"
                } else {
                    "grid min-h-0 h-full grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]"
                },
                {sidebar}
                {editor}
            }
            {status_bar}
        }
    }
}
