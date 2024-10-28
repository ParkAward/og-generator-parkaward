import type { ParsedRequest, Theme, FileType } from "../api/_lib/types";
import Button from "./components/button.js";
import Dropdown, { DropdownOption } from "./components/dropdown.js";
import Field from "./components/field.js";
import ImagePreview from "./components/image-preview.js";
import TextInput from "./components/text-input.js";
import Toast from "./components/toast.js";

declare global {
  interface Window {
    H: any;
    R: any;
    copee: any;
  }
}

const { H, R, copee } = window;

let timeout = -1;

const themeOptions: DropdownOption[] = [
  { text: "Light", value: "light" },
  { text: "Dark", value: "dark" },
];

const fileTypeOptions: DropdownOption[] = [
  { text: "PNG", value: "png" },
  { text: "JPEG", value: "jpeg" },
];

const fontSizeOptions: DropdownOption[] = Array.from({ length: 10 })
  .map((_, i) => i * 25)
  .filter((n) => n > 0)
  .map((n) => ({ text: n + "px", value: n + "px" }));

const markdownOptions: DropdownOption[] = [
  { text: "Plain Text", value: "0" },
  { text: "Markdown", value: "1" },
];

interface AppState extends ParsedRequest {
  loading: boolean;
  showToast: boolean;
  messageToast: string;
  widths: string[];
  heights: string[];
  overrideUrl: URL | null;
}

type SetState = (state: Partial<AppState>) => void;

const App = (_: any, state: AppState, setState: SetState) => {
  const setLoadingState = (newState: Partial<AppState>) => {
    window.clearTimeout(timeout);
    if (state.overrideUrl && state.overrideUrl !== newState.overrideUrl) {
      newState.overrideUrl = state.overrideUrl;
    }
    if (newState.overrideUrl) {
      timeout = window.setTimeout(() => setState({ overrideUrl: null }), 200);
    }

    setState({ ...newState, loading: true });
  };
  const {
    fileType = "png",
    fontSize = "100px",
    theme = "light",
    md = true,
    text = "**Hello** World",
    images = ["https://cdn.jsdelivr.net/gh/remojansen/logo.ts@master/ts.svg"],
    widths = [],
    heights = [],
    showToast = false,
    messageToast = "",
    loading = true,
    overrideUrl = null,
  } = state;

  const mdValue = md ? "1" : "0";
  const url = new URL(window.location.origin);
  url.pathname = `${encodeURIComponent(text)}.${fileType}`;
  url.searchParams.append("theme", theme);
  url.searchParams.append("md", mdValue);
  url.searchParams.append("fontSize", fontSize);
  for (let image of images) {
    url.searchParams.append("images", image);
  }
  for (let width of widths) {
    url.searchParams.append("widths", width);
  }
  for (let height of heights) {
    url.searchParams.append("heights", height);
  }

  return H(
    "div",
    { className: "split" },
    H(
      "div",
      { className: "pull-left" },
      H(
        "div",
        H(Field, {
          label: "Theme",
          input: H(Dropdown, {
            options: themeOptions,
            value: theme,
            onchange: (val: Theme) => {
              setLoadingState({ theme: val, images: [] });
            },
          }),
        }),
        H(Field, {
          label: "File Type",
          input: H(Dropdown, {
            options: fileTypeOptions,
            value: fileType,
            onchange: (val: FileType) => setLoadingState({ fileType: val }),
          }),
        }),
        H(Field, {
          label: "Font Size",
          input: H(Dropdown, {
            options: fontSizeOptions,
            value: fontSize,
            onchange: (val: string) => setLoadingState({ fontSize: val }),
          }),
        }),
        H(Field, {
          label: "Text Type",
          input: H(Dropdown, {
            options: markdownOptions,
            value: mdValue,
            onchange: (val: string) => setLoadingState({ md: val === "1" }),
          }),
        }),
        H(Field, {
          label: "Text Input",
          input: H(TextInput, {
            value: text,
            oninput: (val: string) => {
              console.log("oninput " + val);
              setLoadingState({ text: val, overrideUrl: url });
            },
          }),
        }),
        ...images.map((image, i) =>
          H(Field, {
            label: `Image ${i + 1}`,
            input: H(
              "div",
              H(TextInput, {
                value: image,
                oninput: (val: string) => {
                  let clone = [...images];
                  clone[i] = val;
                  setLoadingState({ images: clone, overrideUrl: url });
                },
              }),
              H(
                "div",
                { className: "field-flex" },
                H(TextInput, {
                  value: widths[i],
                  type: "number",
                  placeholder: "width",
                  small: true,
                  oninput: (val: string) => {
                    let clone = [...widths];
                    clone[i] = val;
                    setLoadingState({ widths: clone });
                  },
                }),
                H(TextInput, {
                  value: heights[i],
                  type: "number",
                  placeholder: "height",
                  small: true,
                  oninput: (val: string) => {
                    let clone = [...heights];
                    clone[i] = val;
                    setLoadingState({ heights: clone });
                  },
                })
              ),
              H(
                "div",
                { className: "field-flex" },
                H(Button, {
                  label: `Remove Image ${i + 1}`,
                  onclick: (e: MouseEvent) => {
                    e.preventDefault();
                    const filter = (arr: any[]) =>
                      [...arr].filter((_, n) => n !== i);
                    const imagesClone = filter(images);
                    const widthsClone = filter(widths);
                    const heightsClone = filter(heights);
                    setLoadingState({
                      images: imagesClone,
                      widths: widthsClone,
                      heights: heightsClone,
                    });
                  },
                })
              )
            ),
          })
        ),
        H(Field, {
          label: `Image ${images.length + 1}`,
          input: H(Button, {
            label: `Add Image ${images.length + 1}`,
            onclick: () => {
              setLoadingState({
                images: [
                  ...images,
                  "https://cdn.jsdelivr.net/gh/remojansen/logo.ts@master/ts.svg",
                ],
              });
            },
          }),
        })
      )
    ),
    H(
      "div",
      { className: "pull-right" },
      H(ImagePreview, {
        src: overrideUrl ? overrideUrl.href : url.href,
        loading: loading,
        onload: () => setState({ loading: false }),
        onerror: () => {
          setState({
            showToast: true,
            messageToast: "Oops, an error occurred",
          });
          setTimeout(() => setState({ showToast: false }), 2000);
        },
        onclick: (e: Event) => {
          e.preventDefault();
          const success = copee.toClipboard(url.href);
          if (success) {
            setState({
              showToast: true,
              messageToast: "Copied image URL to clipboard",
            });
            setTimeout(() => setState({ showToast: false }), 3000);
          } else {
            window.open(url.href, "_blank");
          }
          return false;
        },
      })
    ),
    H(Toast, {
      message: messageToast,
      show: showToast,
    })
  );
};

R(H(App), document.getElementById("app"));
