import "./main";

const root = document.querySelector<HTMLElement>("[data-article]");
if (root) {
  root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    const url = new URL(link.href, location.href);
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== location.origin) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });

  const codeBlocks = root.querySelectorAll<HTMLPreElement>("pre");
  if (codeBlocks.length) {
    void (async () => {
      const { default: Prism } = await import("prismjs");
      await import("prismjs/components/prism-clike");
      await import("prismjs/themes/prism-tomorrow.css");
      Prism.languages.minizinc = Prism.languages.extend("clike", {
        keyword: /\b(?:array|annotation|bool|constraint|enum|float|function|include|int|maximize|minimize|of|output|predicate|set|solve|string|var)\b/,
        builtin: /\b(?:alldifferent|show|sum)\b/,
      });
      Prism.highlightAllUnder(root);
    })();
  }
  codeBlocks.forEach((pre) => {
    pre.classList.add("code-block");
    const button = document.createElement("button");
    button.className = "copy-code";
    button.type = "button";
    button.textContent = document.documentElement.classList.contains("lang-fr") ? "Copier" : "Copy";
    button.addEventListener("click", async () => {
      const code = pre.querySelector("code")?.textContent ?? "";
      await navigator.clipboard.writeText(code);
      const french = document.documentElement.classList.contains("lang-fr");
      button.textContent = french ? "Copié !" : "Copied!";
      window.setTimeout(() => { button.textContent = french ? "Copier" : "Copy"; }, 1600);
    });
    pre.appendChild(button);
  });

  if (root.textContent?.includes("$")) {
    void Promise.all([
      import("katex/contrib/auto-render"),
      import("katex/dist/katex.min.css"),
    ]).then(([{ default: renderMathInElement }]) => {
      renderMathInElement(root, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    });
  }
}
