import { mountAllLiroxNotesEditors } from "/assets/editor.js";

const mount = () => {
  mountAllLiroxNotesEditors();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}
