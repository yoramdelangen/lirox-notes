import './develop.css';
import { mountLiroxNotesEditor } from "./main";

type EditorRoot = HTMLElement & {
  dataset: {
    initialDoc?: string;
    lineNumbers?: string;
    writingWidth?: string;
  };
};

type EditorEventDetail = {
  doc: string;
  title: string;
  hasHeading: boolean;
  headingLevel: number;
  selectionText: string;
  selectionEmpty: boolean;
};

const root = document.querySelector<EditorRoot>("#editor-root")!;
const docInput = document.querySelector<HTMLTextAreaElement>("#doc")!;
const widthInput = document.querySelector<HTMLSelectElement>("#width")!;
const lineNumbersInput = document.querySelector<HTMLInputElement>("#lineNumbers")!;
const events = document.querySelector<HTMLElement>("#events")!;

const mount = () => {
  root.replaceChildren();
  root.dataset.editorMounted = "";
  root.dataset.initialDoc = docInput.value;
  root.dataset.writingWidth = widthInput.value;
  root.dataset.lineNumbers = String(lineNumbersInput.checked);
  mountLiroxNotesEditor(root, docInput.value);
};

root.addEventListener("lirox-editor-change", ((event: Event) => {
  const detail = (event as CustomEvent<EditorEventDetail>).detail;
  events.textContent = JSON.stringify(detail, null, 2);
}) as EventListener);

docInput.addEventListener("change", mount);
widthInput.addEventListener("change", mount);
lineNumbersInput.addEventListener("change", mount);

mount();
