export interface DropdownOption {
  text: string;
  value: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onchange: (val: string) => void;
  small: boolean;
}

export default function Dropdown({
  options,
  value,
  onchange,
  small,
}: DropdownProps) {
  const wrapper = small ? "select-wrapper small" : "select-wrapper";
  const arrow = small ? "select-arrow small" : "select-arrow";
  return window.H(
    "div",
    { className: wrapper },
    window.H(
      "select",
      { onchange: (e: any) => onchange(e.target.value) },
      options.map((o) =>
        window.H(
          "option",
          { value: o.value, selected: value === o.value },
          o.text
        )
      )
    ),
    window.H("div", { className: arrow }, "▼")
  );
}
