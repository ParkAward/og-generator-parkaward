interface ButtonProps {
  label: string;
  onclick: () => void;
}

export default function Button({ label, onclick }: ButtonProps) {
  return window.H("button", { onclick }, label);
}
