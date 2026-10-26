use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    command::{CommandArgs, CommandId, CommandInvocation, CommandSource},
    components::sheet::Sheet,
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
        Sheet {
            label: "File tree",
            on_close: move |_| {
                dispatcher.dispatch(
                    &mut state.write(),
                    CommandInvocation {
                        id: CommandId::new("overlay.close_top"),
                        args: CommandArgs::None,
                        source: CommandSource::Pointer,
                    },
                );
            },
            FileTreeSurface {
                view,
                active: true,
                focus: crate::FocusTarget::Sidebar,
                sidebar_mode: crate::SidebarMode::Tree,
                in_sheet: true,
                on_select_note,
            }
        }
    }
}
