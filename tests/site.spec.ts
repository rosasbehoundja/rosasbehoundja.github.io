import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const routes = [...readFileSync("sitemap.xml", "utf8").matchAll(/<loc>https:\/\/rosasbehoundja.github.io([^<]+)<\/loc>/g)].map(match => match[1]!);
const sampleArticle = "/pages/blog/articles/2026-08-23-dli-return/";

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
    await expect(page.locator('nav .nav-cv')).toHaveAttribute("href", "https://drive.google.com/file/d/1PuwNCgRNbc0qbkmHqzXKQxSUImPmjPZB/view?usp=sharing");
    await expect(page.locator(".nav-social a")).toHaveCount(3);
    await expect(page.locator("#langBtn")).toBeHidden();
    if (route === "/") {
      await expect(page.locator("main")).toContainText("final-year Computer Science student");
      await expect(page.locator("#news, #beyond, .section-title")).toHaveCount(0);
    }
    if (route === "/pages/news/") {
      await expect(page.locator("#news-list > .en-text .news-item")).toHaveCount(21);
      await expect(page.locator("main")).toContainText("first public talk");
    }
    if (route === "/pages/blog.html") {
      await expect(page.locator('.en-text a[href="/pages/blog/articles/reading-of-the-week/"]')).toHaveCount(2);
      await expect(page.locator(".en-text .blog-entry")).toHaveCount(3);
    }
  }
  await context.close();
});

test("navigation labels do not start with a slash", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".nav-links")).toHaveText("homenewsblog");
});

test("blog links to a single reading index and keeps the posts list", async ({ page }) => {
  await page.goto("/pages/blog.html");
  const readings = page.locator(".en-text .blog-disclosure").first();
  const posts = page.locator(".en-text .blog-disclosure").nth(1);
  await expect(readings).toHaveAttribute("open", "");
  await expect(posts).not.toHaveAttribute("open", "");
  await expect(readings.locator(".blog-entry")).toHaveCount(1);
  await expect(readings.locator("img")).toHaveAttribute("src", /preview-.*\.jpg$/);
  await posts.locator("summary").click();
  await expect(posts).toHaveAttribute("open", "");
  await expect(posts.locator(".blog-entry")).toHaveCount(2);
  await readings.locator('a[href="/pages/blog/articles/reading-of-the-week/"]').first().click();
  await expect(page.locator(".en-text .reading-index-list li")).toHaveCount(6);
  await expect(page.locator(".en-text .reading-index-list a").first()).toHaveAttribute("href", "/pages/blog/articles/2026-09-27-reading-of-the-week-6/");
  await expect(page.locator(".en-text .reading-index-list time").first()).toHaveText("September 27, 2026");
});

test("weekly readings return to their index", async ({ page }) => {
  await page.goto("/pages/blog/articles/2026-09-27-reading-of-the-week-6/");
  await expect(page.locator("main > .article-back")).toHaveAttribute("href", "/pages/blog/articles/reading-of-the-week/");
  await expect(page.locator("main > .article-back")).toContainText("Back to readings");
});

test("external and document links open in a new tab while site links stay in this tab", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('nav a[href="https://github.com/rosasbehoundja"]')).toHaveAttribute("target", "_blank");
  await expect(page.locator(".nav-cv")).toHaveAttribute("target", "_blank");
  await expect(page.locator('nav a[href="/pages/news/"]')).not.toHaveAttribute("target", "_blank");
  await page.goto("/pages/news/");
  await expect(page.locator('a[href="/assets/media/pdfs/DLI2026_X_MPVRP-CC.pdf"]').first()).toHaveAttribute("target", "_blank");
  await expect(page.locator('a[href="/pages/news/articles/2026-07-17-mentoring-noai/"]').first()).not.toHaveAttribute("target", "_blank");
});

test("news rows show month and year together", async ({ page }) => {
  await page.goto("/pages/news/");
  await expect(page.locator(".en-text .news-date").first()).toHaveText("Sep, 2026");
  await expect(page.locator(".en-text .news-item").first()).toContainText("Research Engineer position at Ai4Innov Technologies");
  await expect(page.locator(".en-text .news-date").nth(4)).toHaveText("Aug, 2026");
  await expect(page.locator(".en-text .news-date").nth(5)).toHaveText("Jul, 2026");
  await page.goto("/pages/news/articles/2026-06-19-end-internship-lrsia/");
  await expect(page.locator(".en-text.page-header time, .page-header time .en-text")).toHaveText("August 15, 2026");
});

test("home portrait sits right of the introduction and stacks on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const image = page.locator(".en-text .home-portrait");
  const frame = page.locator(".en-text .portrait-frame");
  const intro = page.locator(".en-text .home-intro-copy");
  await expect(image).toBeVisible();
  expect(await image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const desktopImage = await frame.boundingBox();
  const desktopIntro = await intro.boundingBox();
  expect(desktopImage!.x).toBeGreaterThan(desktopIntro!.x + desktopIntro!.width);
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

test("article return link sits above the title and not in the footer", async ({ page }) => {
  await page.goto(sampleArticle);
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
    for (const route of ["/", "/pages/news/", "/pages/blog.html", "/pages/blog/articles/reading-of-the-week/", sampleArticle]) {
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
  await page.goto("/pages/blog/post.html?post=2026-08-27-dli-return");
  await expect(page).toHaveURL(new RegExp(`${sampleArticle}$`));
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
  await page.goto(sampleArticle);
  await expect(page.locator("article.en-text")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("article-mobile.png"), fullPage: true });
});
