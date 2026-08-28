const editorSelector = "[data-lirox-editor-root]";
const saveButtonSelector = "[data-lirox-save-button]";
const saveStateSelector = "[data-lirox-save-state]";
const changeLabelSelector = "[data-lirox-change-label]";
const sidebarDirtySelector = "[data-lirox-sidebar-dirty]";
const sidebarRootSelector = "[data-lirox-sidebar-root]";

const editorState = new WeakMap();
const editorRoots = new WeakSet();
const draftDocs = new Map();
const pendingTitleSelections = new Map();
let activeRoot = null;
let leader = null;
let sidebarContextMenu = null;

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

const syncSidebarDirty = (root, dirty) => {
  const notePath = root.dataset.notePath ?? "";

  document.querySelectorAll(sidebarDirtySelector).forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    node.textContent = node.dataset.notePath === notePath && dirty ? "+" : "";
  });
};

const syncChrome = (root, detail) => {
  const savedDoc = editorState.get(root)?.savedDoc ?? root.dataset.initialDoc ?? "";
  const dirty = detail.doc !== savedDoc;
  const label = dirty ? "Save" : "Saved";
  const title = root.dataset.noteTitle || detail.title;

  setText(root, saveStateSelector, label);
  setText(root, changeLabelSelector, dirty ? "1 change" : "0 changes");
  syncSidebarDirty(root, dirty);

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

const dispatchVirtualNote = (path) => {
  window.dispatchEvent(new CustomEvent("liroxnotes-create-note", { detail: { path } }));
};

const dispatchStartCreate = (dir, kind) => {
  window.dispatchEvent(new CustomEvent("liroxnotes-start-create", { detail: { dir, kind } }));
};

const dispatchDeleteTarget = (path, kind) => {
  window.dispatchEvent(new CustomEvent("liroxnotes-delete-target", { detail: { path, kind } }));
};

const pathLeaf = (path) => path.split("/").filter(Boolean).at(-1) ?? "";

const draftTitleForPath = (path) => {
  const leaf = pathLeaf(path);
  if (leaf.toUpperCase() === "README.md") {
    return path.split("/").filter(Boolean).slice(-2, -1)[0] ?? "README";
  }
  return leaf.replace(/\.md$/i, "") || "untitled";
};

const initialDraftForPath = (path) => `# ${draftTitleForPath(path)}`;

const removeDraftsForTarget = (path, kind) => {
  const matches = (notePath) => kind === "folder" ? notePath.startsWith(`${path}/`) : notePath === path;
  Array.from(draftDocs.keys()).forEach((notePath) => {
    if (matches(notePath)) {
      draftDocs.delete(notePath);
      pendingTitleSelections.delete(notePath);
    }
  });
};

const queueTitleSelection = (path) => {
  pendingTitleSelections.set(path, { anchor: 2, head: 2 + draftTitleForPath(path).length });
};

const applyPendingTitleSelection = (root, view) => {
  const notePath = root.dataset.notePath ?? "";
  const selection = pendingTitleSelections.get(notePath);
  if (!selection || !view) {
    return;
  }

  pendingTitleSelections.delete(notePath);
  requestAnimationFrame(() => {
    view.focus();
    view.dispatch({ selection, scrollIntoView: true });
  });
};

window.addEventListener("liroxnotes-prime-note-draft", (event) => {
  const path = event.detail?.path;
  if (typeof path !== "string" || !path) {
    return;
  }

  draftDocs.set(path, initialDraftForPath(path));
  queueTitleSelection(path);
});

const focusSidebar = () => {
  const sidebar = document.querySelector(sidebarRootSelector);
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

const isSidebarFocused = () => !!document.activeElement?.closest?.(sidebarRootSelector);
const isEditorFocused = () => !!document.activeElement?.closest?.("[data-lirox-editor-root]");

const sidebarItems = () => {
  const sidebar = document.querySelector(sidebarRootSelector);
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

  if (root.dataset.virtualNote === "true" && state.detail.doc.trim() === "") {
    syncChrome(root, state.detail);
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
  draftDocs.delete(state.notePath);
  syncChrome(root, state.detail);
};

const refreshEditorRoot = async (root) => {
  const notePath = root.dataset.notePath ?? "";
  const nextDoc = draftDocs.get(notePath) ?? root.dataset.initialDoc ?? "";
  const state = editorState.get(root) ?? { notePath: "", savedDoc: nextDoc, detail: null };

  if (state.notePath === notePath && state.detail != null) {
    return;
  }

  state.notePath = notePath;
  state.savedDoc = nextDoc;
  state.detail = null;
  editorState.set(root, state);
  syncSidebarDirty(root, false);

  const api = editorApi();
  if (api) {
    const view = api.updateLiroxNotesEditor(root, nextDoc);
    applyPendingTitleSelection(root, view);
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
    draftDocs.set(root.dataset.notePath ?? "", detail.doc);
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

const closeSidebarContextMenu = () => {
  if (sidebarContextMenu) {
    sidebarContextMenu.hidden = true;
  }
};

const ensureSidebarContextMenu = () => {
  if (sidebarContextMenu instanceof HTMLElement) {
    return sidebarContextMenu;
  }

  const menu = document.createElement("div");
  menu.hidden = true;
  menu.dataset.liroxSidebarContextMenu = "true";
  menu.style.cssText = "position:fixed;z-index:50;min-width:11rem;padding:0.25rem;border:1px solid rgb(var(--shell-border));border-radius:0.375rem;background:rgb(var(--shell-chrome));box-shadow:0 12px 32px rgba(0,0,0,0.35);";
  menu.innerHTML = '<button type="button" data-create-kind="note" style="display:flex;width:100%;align-items:center;border:0;border-radius:0.25rem;background:transparent;padding:0.375rem 0.5rem;text-align:left;font:inherit;color:rgb(var(--theme-muted));">New note</button><button type="button" data-create-kind="folder" style="display:flex;width:100%;align-items:center;border:0;border-radius:0.25rem;background:transparent;padding:0.375rem 0.5rem;text-align:left;font:inherit;color:rgb(var(--theme-muted));">New folder</button><button type="button" data-delete-target="true" style="display:flex;width:100%;align-items:center;border:0;border-radius:0.25rem;background:transparent;padding:0.375rem 0.5rem;text-align:left;font:inherit;color:rgb(var(--theme-muted));">Delete</button>';
  document.body.appendChild(menu);
  sidebarContextMenu = menu;

  menu.querySelectorAll("button[data-create-kind]").forEach((button) => {
    button.addEventListener("mouseenter", () => {
      button.style.background = "rgb(var(--theme-surface))";
      button.style.color = "rgb(var(--theme-text))";
    });
    button.addEventListener("mouseleave", () => {
      button.style.background = "transparent";
      button.style.color = "rgb(var(--theme-muted))";
    });
  });

  menu.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const button = event.target.closest("button[data-create-kind]");
    if (button instanceof HTMLButtonElement) {
      const dir = menu.dataset.contextDir ?? "";
      const kind = button.dataset.createKind;
      dispatchStartCreate(dir, kind);
      closeSidebarContextMenu();
      return;
    }

    const deleteButton = event.target.closest("button[data-delete-target]");
    if (!(deleteButton instanceof HTMLButtonElement)) {
      return;
    }

    const path = menu.dataset.contextPath ?? "";
    const kind = menu.dataset.contextKind ?? "";
    if (!path || !kind) {
      closeSidebarContextMenu();
      return;
    }

    const count = Number(menu.dataset.contextCount ?? "0");
    const label = menu.dataset.contextLabel ?? pathLeaf(path);
    const message = kind === "folder"
      ? `Delete folder "${label}" and ${count} file${count === 1 ? "" : "s"}?`
      : `Delete file "${label}"?`;
    if (window.confirm(message)) {
      removeDraftsForTarget(path, kind);
      dispatchDeleteTarget(path, kind);
    }
    closeSidebarContextMenu();
  });

  return menu;
};

const wireSidebarRoot = (root) => {
  if (root.dataset.sidebarBridgeMounted === "true") {
    return;
  }

  root.dataset.sidebarBridgeMounted = "true";
  const menu = ensureSidebarContextMenu();

  root.addEventListener("focusin", () => {
    dispatchAction("focus-sidebar");
  });

  root.addEventListener("contextmenu", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const contextTarget = target.closest("[data-context-dir]") ?? root;
    const contextDir = contextTarget instanceof HTMLElement ? contextTarget.dataset.contextDir ?? "" : "";
    const contextPath = contextTarget instanceof HTMLElement ? contextTarget.dataset.contextPath ?? "" : "";
    const contextKind = contextTarget instanceof HTMLElement ? contextTarget.dataset.contextKind ?? "" : "";
    const contextCount = contextTarget instanceof HTMLElement ? contextTarget.dataset.contextCount ?? "" : "";
    const contextLabel = contextTarget instanceof HTMLElement ? (contextTarget.textContent ?? "").trim() : "";
    event.preventDefault();
    menu.dataset.contextDir = contextDir;
    menu.dataset.contextPath = contextPath;
    menu.dataset.contextKind = contextKind;
    menu.dataset.contextCount = contextCount;
    menu.dataset.contextLabel = contextLabel;
    const deleteButton = menu.querySelector("button[data-delete-target]");
    if (deleteButton instanceof HTMLElement) {
      deleteButton.hidden = !contextPath || !contextKind;
    }
    menu.hidden = false;
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
  });
};

document.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLElement) || !event.target.closest("[data-lirox-sidebar-context-menu]")) {
    closeSidebarContextMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSidebarContextMenu();
  }
});

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
