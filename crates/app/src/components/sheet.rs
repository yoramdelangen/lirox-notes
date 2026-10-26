use crate::components::button::{Button, ButtonSize, ButtonVariant};
use dioxus::prelude::*;

#[component]
pub fn Sheet(label: String, on_close: EventHandler<()>, children: Element) -> Element {
    let backdrop_close = on_close;
    let button_close = on_close;

    rsx! {
        div { class: "absolute inset-0 z-50 flex",
            button {
                class: "absolute inset-0 h-full w-full cursor-default rounded-none border-0 bg-[var(--lirox-overlay)] p-0 animate-[sheet-backdrop-in_180ms_ease-out_both] motion-reduce:animate-none",
                r#type: "button",
                aria_label: "Close {label}",
                onclick: move |_| backdrop_close.call(()),
            }
            section {
                class: "relative z-[1] flex h-full w-full min-w-0 flex-col border-r border-[var(--lirox-border)] bg-[var(--lirox-bg-alt)] shadow-xl animate-[sheet-panel-in_180ms_ease-out_both] motion-reduce:animate-none md:w-96",
                role: "dialog",
                aria_label: "{label}",
                aria_modal: "true",
                tabindex: "-1",
                Button {
                    class: "absolute left-[max(.5rem,env(safe-area-inset-left))] top-[max(.5rem,env(safe-area-inset-top))] z-[1]",
                    size: ButtonSize::IconXs,
                    variant: ButtonVariant::Outline,
                    autofocus: true,
                    aria_label: "Close {label}",
                    title: "Close {label}",
                    onclick: move |_| button_close.call(()),
                    svg {
                        xmlns: "http://www.w3.org/2000/svg",
                        view_box: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        stroke_width: "2",
                        stroke_linecap: "round",
                        "aria-hidden": "true",
                        path { d: "M18 6 6 18M6 6l12 12" }
                    }
                }
                {children}
            }
        }
    }
}
