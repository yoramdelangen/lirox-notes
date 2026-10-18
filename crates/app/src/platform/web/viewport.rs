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
pub struct ResizeListener {
    window: web_sys::Window,
    callback: wasm_bindgen::closure::Closure<dyn FnMut(web_sys::Event)>,
}

#[cfg(target_arch = "wasm32")]
impl ResizeListener {
    pub fn new(on_resize: impl FnMut() + 'static) -> Option<Self> {
        use wasm_bindgen::JsCast;

        let window = web_sys::window()?;
        let mut on_resize = on_resize;
        let callback = wasm_bindgen::closure::Closure::wrap(
            Box::new(move |_| on_resize()) as Box<dyn FnMut(web_sys::Event)>
        );
        window
            .add_event_listener_with_callback("resize", callback.as_ref().unchecked_ref())
            .ok()?;
        Some(Self { window, callback })
    }
}

#[cfg(target_arch = "wasm32")]
impl Drop for ResizeListener {
    fn drop(&mut self) {
        use wasm_bindgen::JsCast;

        let _ = self
            .window
            .remove_event_listener_with_callback("resize", self.callback.as_ref().unchecked_ref());
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
