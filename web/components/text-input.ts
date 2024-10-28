interface TextInputProps {
  value: string;
  oninput: (val: string) => void;
  small: boolean;
  placeholder?: string;
  type?: string;
}

export default function TextInput({
  value,
  oninput,
  small,
  type = "text",
  placeholder = "",
}: TextInputProps) {
  return window.H(
    "div",
    { className: "input-outer-wrapper" + (small ? " small" : "") },
    window.H(
      "div",
      { className: "input-inner-wrapper" },
      window.H("input", {
        type,
        value,
        placeholder,
        oninput: (e: any) => oninput(e.target.value),
      })
    )
  );
}
