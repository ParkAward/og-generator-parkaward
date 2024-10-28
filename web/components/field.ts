interface FieldProps {
  label: string;
  input: any;
}

export default function Field({ label, input }: FieldProps) {
  return window.H(
    "div",
    { className: "field" },
    window.H(
      "label",
      window.H("div", { className: "field-label" }, label),
      window.H("div", { className: "field-value" }, input)
    )
  );
}
