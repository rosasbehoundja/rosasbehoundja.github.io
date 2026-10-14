# Rosas Behoundja's Eleventy website

The repository root is the source and build root for the live GitHub Pages site. It uses Eleventy, Markdown, and the Bulma stylesheet and page structure adapted from [szj.io](https://www.szj.io/). The copied `templates/assets/bulma.css` is preserved from the reference; the site uses Rosas Behoundja's own content and media.

## Develop and build

```bash
npm ci
npm run dev
```

Eleventy prints the local preview URL. `npm run build` generates `site/`, which GitHub Actions uploads to Pages. The homepage includes the Google site verification tag. `templates/sitemap.xml.njk` creates a sitemap from the generated routes; `templates/robots.txt` and `templates/.nojekyll` are copied into the output.

The build syncs English and French articles from `contents/blog/posts/` and `contents/news/posts/`. The homepage Latest section comes from `contents/pages/news/index.en.md`. Edit those source Markdown files rather than the generated files under `templates/posts/imported/`, `templates/news-articles/imported/`, or `templates/updates/imported/`. Published images and files live in `templates/assets/`.

Each blog Markdown file needs a one-sentence `description` in its front matter. The blog listing and page metadata use that sentence. Set `preview_image` and `preview_image_alt` when the listing should show a lead image.

| Content | Source |
| --- | --- |
| Name, headline, portrait, contact | `templates/_data/site.json` |
| Social links | `templates/_data/socials.json` |
| Research biography | `templates/_data/research.md` |
| Research directions | `templates/_data/directions.json` |
| Featured research cards | `templates/_data/featuredProjects.json` |
| Project list | `templates/_data/projects.json` |
| Publications | `templates/publications/*.md` |
| Talks | `templates/talks/*.md` |
| Blog and news articles | `contents/blog/posts/`, `contents/news/posts/` |
| Latest timeline | `contents/pages/news/index.en.md` |

The reference layout and stylesheet are credited in the site footer. Review the reference site's [CC BY-NC-SA 4.0 content license](https://creativecommons.org/licenses/by-nc-sa/4.0/) before reusing its materials elsewhere.
