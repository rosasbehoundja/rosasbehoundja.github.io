import { cpSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const root = process.cwd();

function generatedArticles(kind: "blog" | "news"): string[] {
  return readdirSync(resolve(root, `contents/${kind}/posts`), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^[a-z0-9-]+$/.test(entry.name))
    .map(entry => resolve(root, `pages/${kind}/articles/${entry.name}/index.html`));
}

export default defineConfig({
  base: "/",
  plugins: [
    {
      name: "regenerate-markdown-pages",
      handleHotUpdate(context) {
        const contentChanged = context.file.startsWith(`${resolve(root, "contents")}/`) && context.file.endsWith(".md");
        const templateChanged = context.file.startsWith(`${resolve(root, "scripts")}/`) && context.file.endsWith(".ts");
        if (!contentChanged && !templateChanged) return;
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
        resolve(root, "pages/blog/articles/reading-of-the-week/index.html"),
        resolve(root, "pages/news/index.html"),
        resolve(root, "pages/theme.html"),
        resolve(root, "pages/blog/post.html"),
        resolve(root, "pages/news/article.html"),
        ...generatedArticles("blog"),
        ...generatedArticles("news"),
      ],
    },
  },
});
