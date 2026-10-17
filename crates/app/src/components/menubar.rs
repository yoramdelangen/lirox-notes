use std::sync::atomic::{AtomicUsize, Ordering};

use dioxus::prelude::*;
use tw_merge::tw_merge;

use crate::components::button::{Button, ButtonVariant};

static NEXT_MENUBAR_ID: AtomicUsize = AtomicUsize::new(1);

fn next_id(prefix: &str) -> String {
    format!(
        "{prefix}_rust_ui_{}",
        NEXT_MENUBAR_ID.fetch_add(1, Ordering::Relaxed)
    )
}

#[derive(Clone)]
struct MenubarContext {
    id: String,
}

#[derive(Clone)]
struct MenubarMenuContext {
    id: String,
    menubar_id: String,
}

#[component]
pub fn Menubar(#[props(into, optional)] class: Option<String>, children: Element) -> Element {
    let id = next_id("menubar");
    provide_context(MenubarContext { id: id.clone() });
    let class = tw_merge!(
        "flex h-8 items-center gap-0.5 rounded-lg border bg-background p-[3px]",
        class.as_deref().unwrap_or("")
    );

    rsx! {
        div { "data-name": "Menubar", "data-menubar-id": "{id}", class: "{class}", {children} }
    }
}

#[component]
pub fn MenubarMenu(children: Element) -> Element {
    let menubar = use_context::<MenubarContext>();
    let id = next_id("menubarmenu");
    provide_context(MenubarMenuContext {
        id,
        menubar_id: menubar.id,
    });

    rsx! { div { "data-name": "MenubarMenu", class: "relative", {children} } }
}

#[component]
pub fn MenubarTrigger(
    #[props(into, optional)] class: Option<String>,
    children: Element,
) -> Element {
    let menu = use_context::<MenubarMenuContext>();
    let trigger_id = format!("{}_trigger", menu.id);
    let class = tw_merge!(
        "h-auto flex items-center rounded-sm px-2 py-[2px] text-sm font-medium outline-none select-none cursor-default transition-colors hover:bg-muted aria-expanded:bg-muted active:scale-100",
        class.as_deref().unwrap_or("")
    );

    rsx! {
        Button {
            id: trigger_id,
            class: "{class}",
            variant: ButtonVariant::Ghost,
            {children}
        }
    }
}

#[component]
pub fn MenubarContent(
    #[props(into, optional)] class: Option<String>,
    children: Element,
) -> Element {
    let menu = use_context::<MenubarMenuContext>();
    let class = tw_merge!(
        "menubar-content z-50 min-w-36 rounded-md border bg-card p-1 shadow-md fixed transition-all duration-200 data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=open]:opacity-100 data-[state=open]:scale-100",
        class.as_deref().unwrap_or("")
    );
    let menu_id = menu.id;
    let menubar_id = menu.menubar_id;
    let script = format!(
        r#"(() => {{
            const menu = document.getElementById('{menu_id}');
            const trigger = document.getElementById('{menu_id}_trigger');
            const root = document.querySelector('[data-menubar-id="{menubar_id}"]');
            if (!menu || !trigger || !root || menu.dataset.initialized) return;
            menu.dataset.initialized = 'true';
            trigger.setAttribute('aria-expanded', 'false');
            const close = () => {{
                menu.dataset.state = 'closed';
                menu.style.pointerEvents = 'none';
                trigger.setAttribute('aria-expanded', 'false');
                document.removeEventListener('click', outside);
            }};
            const outside = event => {{ if (!root.contains(event.target)) close(); }};
            trigger.addEventListener('click', event => {{
                event.stopPropagation();
                if (menu.dataset.state === 'open') return close();
                root.querySelectorAll('[data-menubar-content]').forEach(item => {{
                    item.dataset.state = 'closed';
                    item.style.pointerEvents = 'none';
                }});
                const rect = trigger.getBoundingClientRect();
                const margin = 8;
                const gap = 4;
                const viewportWidth = document.documentElement.clientWidth;
                const viewportHeight = document.documentElement.clientHeight;
                menu.style.left = `${{margin}}px`;
                menu.style.top = `${{margin}}px`;
                menu.style.pointerEvents = 'auto';
                menu.dataset.state = 'open';
                const menuRect = menu.getBoundingClientRect();
                const left = Math.max(margin, Math.min(rect.left, viewportWidth - menuRect.width - margin));
                const below = viewportHeight - rect.bottom - margin;
                const above = rect.top - margin;
                const top = below >= menuRect.height || below >= above
                    ? rect.bottom + gap
                    : rect.top - menuRect.height - gap;
                menu.style.left = `${{left}}px`;
                menu.style.top = `${{Math.max(margin, Math.min(top, viewportHeight - menuRect.height - margin))}}px`;
                trigger.setAttribute('aria-expanded', 'true');
                setTimeout(() => document.addEventListener('click', outside), 0);
            }});
            menu.addEventListener('click', event => {{
                if (event.target.closest('[data-menubar-close]')) close();
            }});
            document.addEventListener('keydown', event => {{
                if (event.key === 'Escape' && menu.dataset.state === 'open') close();
            }});
        }})();"#
    );

    rsx! {
        ul {
            id: "{menu_id}",
            "data-name": "MenubarContent",
            "data-menubar-content": "",
            class: "{class}",
            "data-state": "closed",
            style: "pointer-events: none;",
            {children}
        }
        script { dangerous_inner_html: "{script}" }
    }
}

#[component]
pub fn MenubarGroup(#[props(into, optional)] class: Option<String>, children: Element) -> Element {
    let class = tw_merge!("group", class.as_deref().unwrap_or(""));
    rsx! { ul { class: "{class}", {children} } }
}

#[component]
pub fn MenubarItem(#[props(into, optional)] class: Option<String>, children: Element) -> Element {
    let class = tw_merge!(
        "relative inline-flex w-full items-center rounded-sm px-1.5 py-1 text-sm transition-colors",
        class.as_deref().unwrap_or("")
    );
    rsx! {
        li { class: "{class}", "data-menubar-close": "true", {children} }
    }
}
