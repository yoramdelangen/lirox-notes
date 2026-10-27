//! Calls into the CodeMirror bundle's `window.LiroxNotesEditor` API.

#[cfg(target_arch = "wasm32")]
fn call(method: &str, args: &[wasm_bindgen::JsValue]) {
    use js_sys::{Array, Function, Reflect};
    use wasm_bindgen::{JsCast, JsValue};

    let Some(window) = web_sys::window() else {
        return;
    };
    let Ok(api) = Reflect::get(&window, &JsValue::from_str("LiroxNotesEditor")) else {
        return;
    };
    let Ok(function) = Reflect::get(&api, &JsValue::from_str(method)) else {
        return;
    };
    let Ok(function) = function.dyn_into::<Function>() else {
        return;
    };
    let _ = function.apply(&api, &args.iter().cloned().collect::<Array>());
}

/// Runs a formatting action such as `bold`, `h2` or `undo`.
pub fn run_action(action: &str) {
    #[cfg(target_arch = "wasm32")]
    call("run", &[wasm_bindgen::JsValue::from_str(action)]);
    #[cfg(not(target_arch = "wasm32"))]
    let _ = action;
}

pub fn goto_line(line: usize) {
    #[cfg(target_arch = "wasm32")]
    call("gotoLine", &[wasm_bindgen::JsValue::from_f64(line as f64)]);
    #[cfg(not(target_arch = "wasm32"))]
    let _ = line;
}

pub fn focus() {
    #[cfg(target_arch = "wasm32")]
    call("focus", &[]);
}

pub fn set_vim_mode(enabled: bool) {
    #[cfg(target_arch = "wasm32")]
    call(
        "setVimModeEnabled",
        &[wasm_bindgen::JsValue::from_bool(enabled)],
    );
    #[cfg(not(target_arch = "wasm32"))]
    let _ = enabled;
}
