import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const routes = [...readFileSync("sitemap.xml", "utf8").matchAll(/<loc>https:\/\/rosasbehoundja.github.io([^<]+)<\/loc>/g)].map(match => match[1]!);
const codeArticle = "/pages/blog/articles/2026-08-10-minizinc-modeling/";

test("every local link and media reference exists in the production output", () => {
  function htmlFiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      const file = resolve(directory, entry.name);
      return entry.isDirectory() ? htmlFiles(file) : file.endsWith(".html") ? [file] : [];
    });
  }
  for (const file of htmlFiles("dist")) {
    const route = file.slice(resolve("dist").length);
    for (const match of readFileSync(file, "utf8").matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
      const url = new URL(match[1]!, `http://local.test${route}`);
      if (url.origin !== "http://local.test") continue;
      const target = resolve("dist", `.${decodeURIComponent(url.pathname)}`);
      expect(existsSync(target), `${route}: ${match[1]}`).toBe(true);
      if (statSync(target).isDirectory()) expect(existsSync(resolve(target, "index.html")), target).toBe(true);
    }
  }
});

test("generated pages include the site favicon bundle", () => {
  const home = readFileSync("index.html", "utf8");
  expect(home).toContain('/assets/media/favicon_io/favicon.ico');
  expect(home).toContain('/assets/media/favicon_io/apple-touch-icon.png');
  expect(home).toContain('/assets/media/favicon_io/site.webmanifest');
});

test("every published page has usable landmarks, local assets and accessible markup", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (response.url().startsWith("http://127.0.0.1:4173") && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(route === "/pages/news/" ? 0 : 1);
    await expect(page.locator('nav a[aria-current="page"]')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations, route).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test("all pages retain their main content and navigation without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 780 } });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(`http://127.0.0.1:4173${route}`);
    await expect(page.locator("main")).not.toBeEmpty();
    await expect(page.locator('nav a[href="/pages/work.html"]')).toBeVisible();
    await expect(page.locator("#langBtn")).toBeHidden();
    if (route === "/") {
      await expect(page.locator("main")).toContainText("bachelor's degree in computer science");
      await expect(page.locator("#news, #beyond, .section-title")).toHaveCount(0);
    }
    if (route === "/pages/news/") {
      await expect(page.locator("#news-list > .en-text .news-item")).toHaveCount(20);
      await expect(page.locator("main")).toContainText("first public talk");
    }
    if (route === "/pages/blog.html") await expect(page.locator(".en-text .blog-entry")).toHaveCount(routes.filter(path => path.startsWith("/pages/blog/articles/")).length);
    if (route === "/pages/work.html") {
      await expect(page.getByRole("heading", { name: "My résumé" })).toBeVisible();
      await expect(page.locator(".resume-viewer")).toHaveAttribute("src", "/assets/cv/Rosas_Behoundja_Resume.pdf");
      await expect(page.getByRole("link", { name: "Download résumé" })).toHaveAttribute("download", "Rosas_Behoundja_Resume.pdf");
    }
  }
  await context.close();
});

test("navigation labels do not start with a slash", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".nav-links")).toHaveText("homenewsworkblog");
});

test("home portrait sits beside the introduction and stacks on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const image = page.locator(".en-text .home-portrait");
  const frame = page.locator(".en-text .portrait-frame");
  const intro = page.locator(".en-text .profile-identity");
  await expect(image).toBeVisible();
  expect(await image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const desktopImage = await frame.boundingBox();
  const desktopIntro = await intro.boundingBox();
  expect(desktopIntro!.x).toBeGreaterThan(desktopImage!.x + desktopImage!.width);
  await page.setViewportSize({ width: 320, height: 780 });
  const mobileImage = await frame.boundingBox();
  const mobileIntro = await intro.boundingBox();
  expect(mobileIntro!.y).toBeGreaterThan(mobileImage!.y + mobileImage!.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("English and French persist across navigation; keyboard skip link works", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.getByRole("button", { name: "Passer en français" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.locator('nav a[href="/pages/blog.html"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator("#blog-list > .fr-text")).toBeVisible();
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator("#blog-list > .en-text")).toBeVisible();
});

test("code buttons are anchored, copy successfully, and report clipboard failures", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(codeArticle);
  const pre = page.locator("article.en-text pre").first();
  const copy = pre.getByRole("button");
  await expect(copy).toBeVisible();
  const blockBox = await pre.boundingBox();
  const buttonBox = await copy.boundingBox();
  expect(buttonBox!.y).toBeGreaterThan(blockBox!.y);
  expect(buttonBox!.y + buttonBox!.height).toBeLessThan(blockBox!.y + blockBox!.height);
  await copy.click();
  await expect(copy).toHaveText("Copied!");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await pre.locator("code").textContent());
  await page.getByRole("button", { name: "Passer en français" }).click();
  await expect(page.locator("article.fr-text pre").first().getByRole("button")).toHaveText("Copier");
  await page.evaluate(() => { Object.defineProperty(navigator.clipboard, "writeText", { value: () => Promise.reject(new Error("denied")) }); });
  const frenchPre = page.locator("article.fr-text pre").first();
  await frenchPre.getByRole("button").click();
  await expect(frenchPre.getByRole("status")).toContainText("Copie impossible");
});

test("article return link sits above the title and not in the footer", async ({ page }) => {
  await page.goto(codeArticle);
  const back = page.locator("main > .article-back");
  await expect(back).toHaveAttribute("href", "/pages/blog.html");
  await expect(back).toContainText("Back to articles");
  await expect(page.locator("footer .article-back, footer a[href='/pages/blog.html']")).toHaveCount(0);
  const backBox = await back.boundingBox();
  const titleBox = await page.locator(".page-header h1").boundingBox();
  expect(backBox!.y + backBox!.height).toBeLessThan(titleBox!.y);
});

test("layouts fit narrow and wide screens in both languages", async ({ page }) => {
  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/pages/news/", "/pages/work.html", "/pages/blog.html", codeArticle, "/pages/blog/articles/2026-08-23-dli-return/"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      for (let language = 0; language < 2; language++) {
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${width}px ${route}`).toBe(true);
        await page.locator("#langBtn").click();
      }
    }
  }
});

test("legacy links still reach the correct article", async ({ page }) => {
  await page.goto("/pages/blog/post.html?post=minizinc-modeling");
  await expect(page).toHaveURL(new RegExp(`${codeArticle}$`));
});

test("capture selected desktop/mobile layouts", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: testInfo.outputPath("home-inter.png"), fullPage: true });
  await page.goto("/pages/blog.html");
  await page.screenshot({ path: testInfo.outputPath("blog-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: testInfo.outputPath("home-mobile.png"), fullPage: true });
  await page.goto(codeArticle);
  await expect(page.locator("article.en-text .copy-code").first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("article-mobile.png"), fullPage: true });
});
