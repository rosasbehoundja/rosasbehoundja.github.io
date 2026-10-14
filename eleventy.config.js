import markdownIt from "markdown-it";

export default function (eleventyConfig) {
  // Imported Markdown is generated during prebuild and ignored by Git, but
  // Eleventy must still include it in the rendered site.
  eleventyConfig.setUseGitIgnore(false);
  const md = markdownIt({ html: true, linkify: true });
  eleventyConfig.addFilter("markdown", value => md.render(value || ""));
  eleventyConfig.addFilter("date", (value, format) => {
    const date = new Date(value);
    if (format === "yyyy") return date.toISOString().slice(0, 4);
    if (format === "yyyy-MM-dd") return date.toISOString().slice(0, 10);
    if (format === "dd MMM yyyy") return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
    if (format === "yyyy MMMM") return new Intl.DateTimeFormat("en", { year: "numeric", month: "long", timeZone: "UTC" }).format(date);
    return new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
  });
  eleventyConfig.addPassthroughCopy({ "templates/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "templates/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "templates/.nojekyll": ".nojekyll" });
  eleventyConfig.addCollection("publications", collection => collection.getFilteredByGlob("templates/publications/*.md").sort((a, b) => b.data.year - a.data.year));
  eleventyConfig.addCollection("updates", collection => collection.getFilteredByGlob("templates/updates/imported/*.md").sort((a, b) => (b.date - a.date) || (a.data.order - b.data.order)));
  eleventyConfig.addCollection("posts", collection => collection.getFilteredByGlob("templates/posts/imported/en/*.md").sort((a, b) => b.date - a.date));
  eleventyConfig.addCollection("postsFr", collection => collection.getFilteredByGlob("templates/posts/imported/fr/*.md").sort((a, b) => b.date - a.date));
  eleventyConfig.addCollection("newsArticles", collection => collection.getFilteredByGlob("templates/news-articles/imported/en/*.md").sort((a, b) => b.date - a.date));
  eleventyConfig.addCollection("newsArticlesFr", collection => collection.getFilteredByGlob("templates/news-articles/imported/fr/*.md").sort((a, b) => b.date - a.date));
  eleventyConfig.addCollection("talks", collection => collection.getFilteredByGlob("templates/talks/*.md").sort((a, b) => b.date - a.date));
  eleventyConfig.addFilter("filterFeatured", items => items.filter(item => item.data.featured));
  eleventyConfig.addFilter("filterFocus", (items, focus) => items.filter(item => item.data.focus === focus));
  eleventyConfig.addTransform("external-links-new-tab", (content, outputPath) => {
    if (typeof outputPath !== "string" || !outputPath.endsWith(".html")) return content;
    return content.replace(/<a\b([^>]*)>/gi, (tag, attributes) => {
      const href = attributes.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
      if (!href || !/^https?:\/\//i.test(href)) return tag;
      const rel = attributes.match(/\brel\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
      const values = new Set([...rel.split(/\s+/).filter(Boolean), "noopener", "noreferrer"]);
      const cleaned = attributes.replace(/\s+(?:target|rel)\s*=\s*(["']).*?\1/gi, "");
      return `<a${cleaned} target="_blank" rel="${[...values].join(" ")}">`;
    });
  });
  return { dir: { input: "templates", output: "site", includes: "_includes", data: "_data" }, markdownTemplateEngine: "njk" };
}
