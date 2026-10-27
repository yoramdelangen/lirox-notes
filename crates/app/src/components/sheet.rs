use dioxus::prelude::*;

/// A full-screen panel over the workspace. The content draws its own close
/// control; clicking the backdrop (visible on wider screens) also closes it.
#[component]
pub fn Sheet(label: String, on_close: EventHandler<()>, children: Element) -> Element {
    rsx! {
        div { class: "lx-sheet",
            button {
                class: "lx-backdrop",
                style: "z-index: 0",
                r#type: "button",
                aria_label: "Close {label}",
                onclick: move |_| on_close.call(()),
            }
            section {
                class: "relative z-[1] flex h-full w-full min-w-0 flex-col md:w-[300px] md:border-r md:border-[var(--line)]",
                role: "dialog",
                aria_label: "{label}",
                aria_modal: "true",
                {children}
            }
        }
    }
}
