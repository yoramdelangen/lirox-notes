use iced::Task;

use crate::{App, AppMessage, editor, filelib::File};

#[derive(Clone, Default)]
pub enum Route {
    #[default]
    New,
    Edit(File),
}

pub struct Router {
    current: Route,
}

impl Router {
    pub fn new() -> Self {
        Self {
            current: Route::New,
        }
    }

    pub fn update(&mut self, route: Route) -> iced::Task<AppMessage> {
        self.current = route.clone();

        match &route {
            Route::New => {}
            Route::Edit(item) => {
                println!("need to load content: {:?}", item);
                // load content of the file
            }
        }

        Task::none()
    }

    /// Render the view based on current nav
    pub fn view<'a>(&self, app: &'a App) -> iced::Element<'a, AppMessage> {
        match &self.current {
            Route::New => editor::view(app, None),
            Route::Edit(file) => editor::view(app, Some(file.clone())),
        }
    }
}
