use crate::{FrontendState, APP_CSS};
use dioxus::prelude::*;

use super::super::layouts::WorkflowLayout;
use super::authenticating::AuthenticatingRoute;
use super::onboarding::{InstallRoute, LoginRoute, ReadyRoute, SetupRoute};

#[component]
pub(crate) fn WorkflowShell(
    state: FrontendState,
    message: String,
    user: String,
    password: String,
    auth_mode: String,
    repo_mode: String,
    workspace_slug: String,
    workspace_name: String,
    workspace_path: String,
    clone_target: String,
    repo_url: String,
    branch: String,
    on_install: EventHandler<()>,
    on_user: EventHandler<String>,
    on_password: EventHandler<String>,
    on_auth_mode: EventHandler<String>,
    on_repo_mode: EventHandler<String>,
    on_workspace_slug: EventHandler<String>,
    on_workspace_name: EventHandler<String>,
    on_login: EventHandler<()>,
    on_workspace_path: EventHandler<String>,
    on_repo_url: EventHandler<String>,
    on_branch: EventHandler<String>,
    on_setup: EventHandler<()>,
) -> Element {
    rsx! {
        document::Link { rel: "icon", href: "data:," }
        document::Stylesheet { href: APP_CSS }
        WorkflowLayout {
            div {
                match state {
                    FrontendState::Loading => rsx! {
                        AuthenticatingRoute { message }
                    },
                    FrontendState::Install => rsx! {
                        InstallRoute {
                            message,
                            user,
                            password,
                            auth_mode,
                            workspace_path,
                            on_install,
                            on_user,
                            on_password,
                            on_auth_mode,
                            on_workspace_path,
                        }
                    },
                    FrontendState::Login => rsx! {
                        LoginRoute {
                            message,
                            user,
                            password,
                            auth_mode,
                            on_user,
                            on_password,
                            on_login,
                        }
                    },
                    FrontendState::Setup => rsx! {
                        SetupRoute {
                            message,
                            repo_mode,
                            workspace_slug,
                            workspace_name,
                            clone_target,
                            repo_url,
                            branch,
                            on_repo_mode,
                            on_workspace_slug,
                            on_workspace_name,
                            on_repo_url,
                            on_branch,
                            on_setup,
                        }
                    },
                    FrontendState::Ready => rsx! {
                        ReadyRoute {}
                    },
                }
            }
        }
    }
}
