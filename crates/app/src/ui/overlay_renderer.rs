use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    command::{CommandArgs, CommandId, CommandInvocation, CommandSource},
    components::button::{Button, ButtonSize, ButtonVariant},
    ui::surfaces::FileTreeSurface,
    workspace::{OverlayInputPolicy, OverlayPlacement},
    AppContext,
};

#[component]
pub fn OverlayRenderer(
    view: WorkspaceView,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let Some(entry) = context.state.read().workspace.overlays.top().cloned() else {
        return rsx! {};
    };
    if entry.input_policy != OverlayInputPolicy::Modal
        || entry.placement != OverlayPlacement::LeftPanel
    {
        return rsx! {};
    }
    let mut state = context.state;
    let dispatcher = context.dispatcher.clone();
    rsx! {
        div {
            class: "absolute inset-0 z-10 bg-[var(--lirox-overlay)]",
            div {
                class: "h-full w-full border-r border-[var(--lirox-border)] bg-[var(--lirox-bg-alt)] shadow-xl",
                role: "dialog",
                aria_label: "File tree overlay",
                aria_modal: "true",
                tabindex: "-1",
                 Button {
                     class: "absolute right-3 top-3 z-10",
                     size: ButtonSize::Sm,
                     variant: ButtonVariant::Outline,
                    autofocus: true,
                    aria_label: "Close file tree overlay",
                    onclick: move |_| dispatcher.dispatch(
                        &mut state.write(),
                        CommandInvocation {
                            id: CommandId::new("overlay.close_top"),
                            args: CommandArgs::None,
                            source: CommandSource::Pointer,
                        },
                    ),
                    "Close"
                }
                FileTreeSurface {
                    view,
                    active: true,
                    focus: crate::FocusTarget::Sidebar,
                    sidebar_mode: crate::SidebarMode::Tree,
                    on_select_note,
                }
            }
        }
    }
}
