interface ToastProps {
  show: boolean;
  message: string;
}

export default function Toast({ show, message }: ToastProps) {
  const style = { transform: show ? "translate3d(0,-0px,-0px) scale(1)" : "" };
  return window.H(
    "div",
    { className: "toast-area" },
    window.H(
      "div",
      { className: "toast-outer", style },
      window.H(
        "div",
        { className: "toast-inner" },
        window.H("div", { className: "toast-message" }, message)
      )
    )
  );
}
