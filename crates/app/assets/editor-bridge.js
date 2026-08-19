const editorSelector = "[data-lirox-editor-root]";
const saveButtonSelector = "[data-lirox-save-button]";
const saveStateSelector = "[data-lirox-save-state]";
const changedCountSelector = "[data-lirox-changed-count]";

const editorState = new WeakMap();
const editorRoots = new WeakSet();
let activeRoot = null;
let leader = null;

const editorApi = () => window.LiroxNotesEditor;
const apiOrigin = () => ["127.0.0.1", "localhost"].includes(window.location.hostname) && window.location.port !== "3000" ? `http://${window.location.hostname}:3000` : "";
const noteApiUrl = (root) => root.dataset.notePath ? `${apiOrigin()}/api/notes/${encodeURI(root.dataset.notePath)}` : null;

const retryRefresh = (root) => {
  requestAnimationFrame(() => {
    void refreshEditorRoot(root);
  });
};

const setText = (root, selector, value) => {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value;
  });
};

const syncChrome = (root, detail) => {
  const savedDoc = editorState.get(root)?.savedDoc ?? root.dataset.initialDoc ?? "";
  const dirty = detail.doc !== savedDoc;
  const label = dirty ? "Save" : "Saved";
  const title = root.dataset.noteTitle || detail.title;

  setText(root, saveStateSelector, label);
  setText(root, changedCountSelector, dirty ? "1" : "0");

  const button = document.querySelector(saveButtonSelector);
  if (button) {
    button.textContent = label;
    button.disabled = !dirty;
  }

  root.dataset.dirty = String(dirty);
  document.title = dirty ? `${title} • Unsaved` : title;
};

const showSaveError = (root, detail, error) => {
  syncChrome(root, detail);
  setText(root, saveStateSelector, `Error: ${error.message || error}`);

  const button = document.querySelector(saveButtonSelector);
  if (button) {
    button.textContent = "Retry";
    button.disabled = false;
  }
};

const pushEditorChange = (detail) => {
  window.dispatchEvent(new CustomEvent("lirox-notes-editor-change", { detail }));
};

const dispatchAction = (action) => {
  window.dispatchEvent(new CustomEvent("liroxnotes-action", { detail: { action } }));
};

const focusSidebar = () => {
  const sidebar = document.querySelector("[data-lirox-sidebar-root]");
  if (sidebar instanceof HTMLElement) {
    sidebar.focus();
  }
};

const focusEditor = () => {
  const editor = document.querySelector("[data-lirox-editor-root] .cm-content");
  if (editor instanceof HTMLElement) {
    editor.focus();
  }
};

const cycleSidebarMode = () => {
  dispatchAction("cycle-sidebar-mode");
};

const isEditable = (element) => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  return element.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName);
};

const isSidebarFocused = () => !!document.activeElement?.closest?.("[data-lirox-sidebar-root]");
const isEditorFocused = () => !!document.activeElement?.closest?.("[data-lirox-editor-root]");

const sidebarItems = () => {
  const sidebar = document.querySelector("[data-lirox-sidebar-root]");
  if (!(sidebar instanceof HTMLElement)) {
    return [];
  }

  // ponytail: focus DOM-order buttons/links for now; roving tabindex only if this gets more complex.
  return Array.from(sidebar.querySelectorAll("button:not([disabled]), a[href]"))
    .filter((node) => node instanceof HTMLElement && node.offsetParent !== null);
};

const moveSidebarFocus = (delta) => {
  const items = sidebarItems();
  if (!items.length) {
    return false;
  }

  const active = document.activeElement;
  const currentIndex = items.findIndex((item) => item === active || item.contains(active));
  const nextIndex = currentIndex < 0 ? (delta > 0 ? 0 : items.length - 1) : (currentIndex + delta + items.length) % items.length;
  items[nextIndex].focus();
  return true;
};

const focusSidebarEdge = (last) => {
  const items = sidebarItems();
  if (!items.length) {
    return false;
  }

  items[last ? items.length - 1 : 0].focus();
  return true;
};

const saveCurrentDoc = async (root) => {
  const state = editorState.get(root);
  if (!state || state.detail == null) {
    return;
  }

  const button = document.querySelector(saveButtonSelector);
  if (button) {
    button.textContent = "Saving...";
    button.disabled = true;
  }

  const apiUrl = noteApiUrl(root);
  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "text/plain; charset=utf-8" },
        body: state.detail.doc
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(`${response.status} ${response.statusText}${message ? `: ${message}` : ""}`);
      }
    } catch (error) {
      showSaveError(root, state.detail, error);
      return;
    }
  }

  state.savedDoc = state.detail.doc;
  syncChrome(root, state.detail);
};

const refreshEditorRoot = async (root) => {
  const notePath = root.dataset.notePath ?? "";
  const nextDoc = root.dataset.initialDoc ?? "";
  const state = editorState.get(root) ?? { notePath: "", savedDoc: nextDoc, detail: null };

  if (state.notePath === notePath && state.detail != null) {
    return;
  }

  state.notePath = notePath;
  state.savedDoc = nextDoc;
  state.detail = null;
  editorState.set(root, state);

  const api = editorApi();
  if (api) {
    api.updateLiroxNotesEditor(root, nextDoc);
    return;
  }

  retryRefresh(root);
};

const wireEditorRoot = (root) => {
  if (editorRoots.has(root)) {
    return;
  }

  editorRoots.add(root);
  editorState.set(root, { notePath: root.dataset.notePath ?? "", savedDoc: root.dataset.initialDoc ?? "", detail: null });

  root.addEventListener("focusin", () => {
    activeRoot = root;
    dispatchAction("focus-editor");
  });

  root.addEventListener("pointerdown", () => {
    activeRoot = root;
  });

  root.addEventListener("lirox-editor-change", (event) => {
    const detail = event.detail;
    const previous = editorState.get(root)?.detail?.doc;
    editorState.set(root, { notePath: root.dataset.notePath ?? "", savedDoc: editorState.get(root)?.savedDoc ?? root.dataset.initialDoc ?? "", detail });
    syncChrome(root, detail);

    if (detail.doc !== previous) {
      pushEditorChange(detail);
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest(saveButtonSelector);
    if (button) {
      activeRoot = root;
      void saveCurrentDoc(root);
    }
  });
};

const wireSidebarRoot = (root) => {
  if (root.dataset.sidebarBridgeMounted === "true") {
    return;
  }

  root.dataset.sidebarBridgeMounted = "true";

  root.addEventListener("focusin", () => {
    dispatchAction("focus-sidebar");
  });
};

const mountOrRefreshEditors = () => {
  document.querySelectorAll("[data-lirox-sidebar-root]").forEach((root) => {
    if (root instanceof HTMLElement) {
      wireSidebarRoot(root);
    }
  });

  document.querySelectorAll(editorSelector).forEach((root) => {
    wireEditorRoot(root);
    void refreshEditorRoot(root);
  });
};

document.addEventListener("keydown", (event) => {
  // ponytail: hardcoded keymap for now; swap to user settings later.
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s" && activeRoot) {
    event.preventDefault();
    void saveCurrentDoc(activeRoot);
    return;
  }

  if (event.key === "Escape" || (event.ctrlKey && event.key === "[")) {
    event.preventDefault();
    focusSidebar();
    leader = null;
    return;
  }

  if (isSidebarFocused() && event.key === "i") {
    event.preventDefault();
    focusEditor();
    leader = null;
    return;
  }

  if (event.key === "Enter" && document.activeElement?.matches?.("[data-lirox-sidebar-root]")) {
    event.preventDefault();
    focusEditor();
    leader = null;
    return;
  }

  if (isSidebarFocused() && (event.key === "ArrowDown" || event.key.toLowerCase() === "j")) {
    event.preventDefault();
    moveSidebarFocus(1);
    leader = null;
    return;
  }

  if (isSidebarFocused() && (event.key === "ArrowUp" || event.key.toLowerCase() === "k")) {
    event.preventDefault();
    moveSidebarFocus(-1);
    leader = null;
    return;
  }

  if (isSidebarFocused() && event.key === "Home") {
    event.preventDefault();
    focusSidebarEdge(false);
    leader = null;
    return;
  }

  if (isSidebarFocused() && event.key === "End") {
    event.preventDefault();
    focusSidebarEdge(true);
    leader = null;
    return;
  }

  if (isSidebarFocused() && event.key === "Tab") {
    event.preventDefault();
    cycleSidebarMode();
    leader = null;
    return;
  }

  if (event.ctrlKey && !event.metaKey && event.key.toLowerCase() === "k") {
    event.preventDefault();
    leader = "ctrl-k";
    return;
  }

  if (event.key === " ") {
    if (isSidebarFocused() || (!isEditorFocused() && !isEditable(event.target))) {
      event.preventDefault();
      leader = "space";
      return;
    }
  }

  if (leader === "ctrl-k" && event.key.toLowerCase() === "b") {
    event.preventDefault();
    focusSidebar();
    leader = null;
    return;
  }

  if (leader === "space" && event.key.toLowerCase() === "b") {
    event.preventDefault();
    focusSidebar();
    leader = null;
    return;
  }

  if (leader != null) {
    leader = null;
  }
});

const observeDom = () => {
  mountOrRefreshEditors();

  const observer = new MutationObserver((mutations) => {
    let scanRoots = false;

    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.target instanceof HTMLElement && mutation.target.matches(editorSelector)) {
        void refreshEditorRoot(mutation.target);
        continue;
      }

      if (mutation.type !== "childList") {
        continue;
      }

      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) {
          continue;
        }

        if (node.matches(editorSelector) || node.querySelector(editorSelector)) {
          scanRoots = true;
          break;
        }
      }
    }

    if (scanRoots) {
      mountOrRefreshEditors();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-initial-doc", "data-note-path"]
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", observeDom, { once: true });
} else {
  observeDom();
}
