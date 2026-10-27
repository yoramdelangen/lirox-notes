pub fn is_narrow() -> bool {
    #[cfg(target_arch = "wasm32")]
    {
        return web_sys::window()
            .and_then(|window| window.inner_width().ok())
            .and_then(|width| width.as_f64())
            .is_some_and(is_narrow_width);
    }

    #[cfg(not(target_arch = "wasm32"))]
    false
}

pub fn is_narrow_width(width: f64) -> bool {
    width < 768.0
}

#[cfg(target_arch = "wasm32")]
pub type ResizeListener = WindowListener;

/// A window event listener that is removed again when dropped.
#[cfg(target_arch = "wasm32")]
pub struct WindowListener {
    event: &'static str,
    window: web_sys::Window,
    callback: wasm_bindgen::closure::Closure<dyn FnMut(web_sys::Event)>,
}

#[cfg(target_arch = "wasm32")]
impl WindowListener {
    pub fn new(on_resize: impl FnMut() + 'static) -> Option<Self> {
        let mut on_resize = on_resize;
        Self::on("resize", move |_| on_resize())
    }

    pub fn on(event: &'static str, handler: impl FnMut(web_sys::Event) + 'static) -> Option<Self> {
        use wasm_bindgen::JsCast;

        let window = web_sys::window()?;
        let mut handler = handler;
        let callback = wasm_bindgen::closure::Closure::wrap(
            Box::new(move |event| handler(event)) as Box<dyn FnMut(web_sys::Event)>
        );
        window
            .add_event_listener_with_callback(event, callback.as_ref().unchecked_ref())
            .ok()?;
        Some(Self {
            event,
            window,
            callback,
        })
    }
}

#[cfg(target_arch = "wasm32")]
impl Drop for WindowListener {
    fn drop(&mut self) {
        use wasm_bindgen::JsCast;

        let _ = self.window.remove_event_listener_with_callback(
            self.event,
            self.callback.as_ref().unchecked_ref(),
        );
    }
}

#[cfg(test)]
mod tests {
    use super::is_narrow_width;

    #[test]
    fn viewport_is_narrow_below_the_mobile_layout_breakpoint() {
        assert!(is_narrow_width(767.0));
        assert!(!is_narrow_width(768.0));
    }
}
