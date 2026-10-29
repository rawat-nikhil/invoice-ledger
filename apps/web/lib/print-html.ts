export function printHtmlDocument(html: string): void {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "1200px";
  iframe.style.height = "800px";
  iframe.style.border = "0";

  const cleanup = () => {
    iframe.remove();
  };

  iframe.addEventListener("load", () => {
    const frameWindow = iframe.contentWindow;
    const frameDocument = iframe.contentDocument;
    if (!frameWindow || !frameDocument || frameDocument.body.childElementCount === 0) {
      return;
    }

    frameWindow.addEventListener("afterprint", cleanup, { once: true });
    window.addEventListener("afterprint", cleanup, { once: true });
    frameWindow.focus();
    frameWindow.print();
  });

  iframe.srcdoc = html;
  document.body.appendChild(iframe);
}
