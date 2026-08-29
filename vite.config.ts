import { cpSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const root = process.cwd();

function generatedArticles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return generatedArticles(path);
    return entry.name === "index.html" ? [path] : [];
  });
}

export default defineConfig({
  base: "/",
  plugins: [
    tailwindcss(),
    {
      name: "regenerate-markdown-pages",
      handleHotUpdate(context) {
        if (!context.file.includes(`${resolve(root, "contents")}/`) || !context.file.endsWith(".md")) return;
        execFileSync(process.execPath, ["--experimental-strip-types", resolve(root, "scripts/generate-pages.ts")], {
          cwd: root,
          stdio: "inherit",
        });
        context.server.ws.send({ type: "full-reload" });
        return [];
      },
    },
    {
      name: "copy-markdown-sources",
      closeBundle() {
        const source = resolve(root, "contents");
        if (existsSync(source)) cpSync(source, resolve(root, "dist/contents"), { recursive: true });
        for (const directory of ["media", "cv"]) {
          const source = resolve(root, `assets/${directory}`);
          if (existsSync(source)) cpSync(source, resolve(root, `dist/assets/${directory}`), { recursive: true });
        }
        for (const file of ["robots.txt", "sitemap.xml"]) {
          const path = resolve(root, file);
          if (existsSync(path)) cpSync(path, resolve(root, `dist/${file}`));
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      input: [
        resolve(root, "index.html"),
        resolve(root, "pages/work.html"),
        resolve(root, "pages/blog.html"),
        resolve(root, "pages/theme.html"),
        resolve(root, "pages/blog/post.html"),
        resolve(root, "pages/news/article.html"),
        ...generatedArticles(resolve(root, "pages/blog/articles")),
        ...generatedArticles(resolve(root, "pages/news/articles")),
      ],
    },
  },
});
