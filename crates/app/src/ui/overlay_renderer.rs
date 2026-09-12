use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    command::{CommandArgs, CommandId, CommandInvocation, CommandSource},
    ui::surfaces::FileTreeSurface,
    workspace::{OverlayInputPolicy, OverlayPlacement},
    AppAction, AppContext,
};

#[component]
pub fn OverlayRenderer(
    view: WorkspaceView,
    on_action: Option<EventHandler<AppAction>>,
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
                class: "h-full w-full max-w-sm border-r border-[var(--lirox-border)] bg-[var(--lirox-bg-alt)] shadow-xl",
                role: "dialog",
                aria_label: "File tree overlay",
                aria_modal: "true",
                tabindex: "-1",
                button {
                    class: "absolute right-3 top-3 z-10 rounded border border-[var(--lirox-border)] bg-[var(--lirox-surface)] px-2 py-1 text-xs hover:bg-[var(--lirox-surface-alt)] focus:outline-none focus:ring-1 focus:ring-[var(--lirox-accent)]",
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
                    browser_dir: String::new(),
                    on_action,
                    on_select_note,
                }
            }
        }
    }
}
