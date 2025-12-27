use iced::{
    Length::Fill,
    keyboard,
    widget::{self},
};

use crate::{App, AppMessage, filelib::File};

/// Our Editor view
pub fn view(app: &App, file: Option<File>) -> iced::Element<'_, AppMessage> {
    println!("Loading file: {:?}", file);

    widget::text_editor(&app.editor_content)
        .placeholder("....")
        .on_action(AppMessage::Editor)
        .height(Fill)
        .font(iced::Font::MONOSPACE)
        .key_binding(move |key: widget::text_editor::KeyPress| {
            println!("Keypressed: {:?}", key);

            match key.key.as_ref() {
                keyboard::Key::Character("s")
                    if key.modifiers.command() || key.modifiers.control() =>
                {
                    println!("Save file! {:?}", file);
                    // Some(widget::text_editor::Binding::Custom(AppMessage::SaveFile(
                    //     file.unwrap(),
                    // )))
                    None
                }
                _ => widget::text_editor::Binding::from_key_press(key),
            }
        })
        .highlight("markdown", iced::highlighter::Theme::SolarizedDark)
        .into()
}

pub fn update(app: &mut App, action: widget::text_editor::Action) -> iced::Task<AppMessage> {
    // match action {
    //     widget::text_editor::Action::Move(motion) => todo!(),
    //     widget::text_editor::Action::Select(motion) => todo!(),
    //     widget::text_editor::Action::SelectWord => todo!(),
    //     widget::text_editor::Action::SelectLine => todo!(),
    //     widget::text_editor::Action::SelectAll => todo!(),
    //     widget::text_editor::Action::Edit(edit) => todo!(),
    //     widget::text_editor::Action::Click(point) => todo!(),
    //     widget::text_editor::Action::Drag(point) => todo!(),
    //     widget::text_editor::Action::Scroll { lines } => todo!(),
    // }

    app.editor_content.perform(action);

    // println!("Action: {:?}", action);

    iced::Task::none()
}
