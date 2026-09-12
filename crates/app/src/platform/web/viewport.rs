pub fn is_narrow() -> bool {
    #[cfg(target_arch = "wasm32")]
    {
        return web_sys::window()
            .and_then(|window| window.inner_width().ok())
            .and_then(|width| width.as_f64())
            .is_some_and(|width| width < 768.0);
    }

    #[cfg(not(target_arch = "wasm32"))]
    false
}
