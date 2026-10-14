import markdownIt from "markdown-it";

export default function (eleventyConfig) {
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
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addCollection("publications", collection => collection.getFilteredByGlob("src/publications/*.md").sort((a, b) => b.data.year - a.data.year));
  eleventyConfig.addCollection("updates", collection => collection.getFilteredByGlob("src/updates/imported/*.md").sort((a, b) => (b.date - a.date) || (a.data.order - b.data.order)));
  eleventyConfig.addCollection("posts", collection => collection.getFilteredByGlob("src/posts/imported/en/*.md").sort((a, b) => b.date - a.date));
  eleventyConfig.addCollection("postsFr", collection => collection.getFilteredByGlob("src/posts/imported/fr/*.md").sort((a, b) => b.date - a.date));
  eleventyConfig.addCollection("newsArticles", collection => collection.getFilteredByGlob("src/news-articles/imported/en/*.md").sort((a, b) => b.date - a.date));
  eleventyConfig.addCollection("newsArticlesFr", collection => collection.getFilteredByGlob("src/news-articles/imported/fr/*.md").sort((a, b) => b.date - a.date));
  eleventyConfig.addCollection("talks", collection => collection.getFilteredByGlob("src/talks/*.md").sort((a, b) => b.date - a.date));
  eleventyConfig.addFilter("filterFeatured", items => items.filter(item => item.data.featured));
  eleventyConfig.addFilter("filterFocus", (items, focus) => items.filter(item => item.data.focus === focus));
  return { dir: { input: "src", output: "site", includes: "_includes", data: "_data" }, markdownTemplateEngine: "njk" };
}
