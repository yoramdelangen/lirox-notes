mod editor;
mod filelib;
mod router;
mod views;
mod widgets;

use std::{env::home_dir, path::PathBuf};

use filelib::{File, FileLib, FlError, ItemType};
use iced::{
    Element,
    Length::FillPortion,
    widget::{self, text_editor},
};
use router::{Route, Router};
use widgets::sidebar;

const TEMP_FILE_DIR: &str = "{HOME}/workspace/repositories/lirox-notes/notes_src/";

#[derive(Clone)]
enum AppMessage {
    SaveFile(File),
    Navigate(Route),
    Editor(text_editor::Action),
    Sidebar(sidebar::SidebarMessage),
}

struct App {
    router: Router,
    sidebar: widgets::Sidebar,

    pub fl: FileLib,
    pub path: String,
    pub items: Result<Vec<File>, FlError>,
    pub editor_content: text_editor::Content,
}

impl App {
    fn new() -> Self {
        let path: PathBuf = TEMP_FILE_DIR
            .replace("{HOME}", home_dir().unwrap().to_str().unwrap())
            .parse()
            .unwrap();

        let fl = FileLib::new(path);

        Self {
            path: "".to_owned(),
            items: fl.load_items("".to_owned()),
            fl,

            // state
            editor_content: text_editor::Content::default(),

            // components
            router: Router::new(),
            sidebar: widgets::Sidebar::new(),
        }
    }

    fn update(&mut self, msg: AppMessage) -> iced::Task<AppMessage> {
        match msg {
            AppMessage::Navigate(route) => {
                match &route {
                    Route::New => {}
                    Route::Edit(item) => {
                        self.editor_content = self.fl.get_content(item);
                    }
                };
                return self.router.update(route);
            }
            AppMessage::Sidebar(sidebar_message) => match sidebar_message {
                widgets::SidebarMessage::Navigate(item) => {
                    match item.item_type {
                        ItemType::Dir => {
                            self.path = item.path.clone();
                            self.items = self.fl.load_items(item.path.clone());
                        }
                        ItemType::File => {}
                    }

                    self.update(AppMessage::Navigate(router::Route::Edit(item.clone())))
                }
            },
            AppMessage::Editor(action) => editor::update(self, action),
            AppMessage::SaveFile(file) => {
                println!("SAVE File: {:?}", file);

                iced::Task::none()
            }
        }
    }

    fn view(&self) -> Element<'_, AppMessage> {
        let content = widget::row![
            self.sidebar.view(self).map(AppMessage::Sidebar),
            widget::container(self.router.view(self))
                .padding(5)
                .width(FillPortion(4)),
        ];

        widget::column![
            // Header
            widget::row!("header"),
            // Content
            content,
            // Footer
            widget::row!("footer"),
        ]
        .into()
    }
}

fn main() -> Result<(), iced::Error> {
    iced::application(App::new, App::update, App::view)
        .title("Lirox notes")
        .centered()
        .transparent(true)
        .run()
}
