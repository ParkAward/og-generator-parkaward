interface ImagePreviewProps {
  src: string;
  onclick: () => void;
  onload: () => void;
  onerror: () => void;
  loading: boolean;
}

export default function ImagePreview({
  src,
  onclick,
  onload,
  onerror,
  loading,
}: ImagePreviewProps) {
  const style = {
    filter: loading ? "blur(5px)" : "",
    opacity: loading ? 0.1 : 1,
  };
  const title = "Click to copy image URL to clipboard";
  return window.H(
    "a",
    { className: "image-wrapper", href: src, onclick },
    window.H("img", { src, onload, onerror, style, title })
  );
}
