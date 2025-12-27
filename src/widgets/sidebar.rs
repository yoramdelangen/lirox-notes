use crate::{App, filelib::File};
use iced::{
    Length::{Fill, FillPortion},
    widget::{self, scrollable},
};

pub struct Sidebar {}

#[derive(Clone)]
pub enum SidebarMessage {
    Navigate(File),
}

impl Sidebar {
    pub fn new() -> Self {
        Self {}
    }

    pub fn update(&mut self, msg: SidebarMessage) -> iced::Task<SidebarMessage> {
        // match msg {
        //     SidebarMessage::Navigate(item) => {
        //
        //     },
        // }

        iced::Task::none()
    }

    /// Iced element view
    pub fn view(&self, app: &App) -> iced::Element<'_, SidebarMessage> {
        println!("Render sidebar");

        scrollable(match &app.items {
            Ok(items) => widget::column(items.iter().map(|item: &File| {
                widget::button(widget::text(item.name.clone()).width(Fill))
                    .style(widget::button::text)
                    .on_press(SidebarMessage::Navigate(item.clone()))
                    .into()
            }))
            .width(FillPortion(1)),
            Err(err) => widget::column![widget::text(format!("{}", err))].width(FillPortion(1)),
        })
        .into()
    }
}

// pub fn sidebar(_app: &App) -> Sidebar {}
