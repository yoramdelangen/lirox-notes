const editorSelector = "[data-lirox-editor-root]";
const saveButtonSelector = "[data-lirox-save-button]";
const saveStateSelector = "[data-lirox-save-state]";
const changedCountSelector = "[data-lirox-changed-count]";

const editorState = new WeakMap();
const editorRoots = new WeakSet();
let activeRoot = null;

const editorApi = () => window.LiroxNotesEditor;

const retryRefresh = (root) => {
  requestAnimationFrame(() => {
    void refreshEditorRoot(root);
  });
};

const setText = (root, selector, value) => {
  root.querySelectorAll(selector).forEach((node) => {
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

  const button = root.querySelector(saveButtonSelector);
  if (button) {
    button.textContent = label;
    button.disabled = !dirty;
  }

  root.dataset.dirty = String(dirty);
  document.title = dirty ? `${title} • Unsaved` : title;
};

const pushEditorChange = (detail) => {
  window.dispatchEvent(new CustomEvent("lirox-notes-editor-change", { detail }));
};

const saveCurrentDoc = (root) => {
  const state = editorState.get(root);
  if (!state || state.detail == null) {
    return;
  }

  state.savedDoc = state.detail.doc;
  syncChrome(root, state.detail);
};

const refreshEditorRoot = async (root) => {
  const nextDoc = root.dataset.initialDoc ?? "";
  const state = editorState.get(root) ?? { savedDoc: nextDoc, detail: null };
  state.savedDoc = nextDoc;
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
  editorState.set(root, { savedDoc: root.dataset.initialDoc ?? "", detail: null });

  root.addEventListener("focusin", () => {
    activeRoot = root;
  });

  root.addEventListener("pointerdown", () => {
    activeRoot = root;
  });

  root.addEventListener("lirox-editor-change", (event) => {
    const detail = event.detail;
    const previous = editorState.get(root)?.detail?.doc;
    editorState.set(root, { savedDoc: editorState.get(root)?.savedDoc ?? root.dataset.initialDoc ?? "", detail });
    syncChrome(root, detail);

    if (detail.doc !== previous) {
      pushEditorChange(detail);
    }
  });

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest(saveButtonSelector);
    if (button && root.contains(button)) {
      saveCurrentDoc(root);
    }
  });
};

const mountOrRefreshEditors = () => {
  document.querySelectorAll(editorSelector).forEach((root) => {
    wireEditorRoot(root);
    void refreshEditorRoot(root);
  });
};

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s" && activeRoot) {
    event.preventDefault();
    saveCurrentDoc(activeRoot);
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
    attributeFilter: ["data-initial-doc"]
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", observeDom, { once: true });
} else {
  observeDom();
}
