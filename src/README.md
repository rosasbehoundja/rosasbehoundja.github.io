# Rosas Behoundja's Eleventy website

This directory is the source and build root for the live GitHub Pages site. It uses Eleventy, Markdown, and the Bulma stylesheet and page structure adapted from [szj.io](https://www.szj.io/). The copied `src/assets/bulma.css` is preserved from the reference; the site uses Rosas Behoundja's own content and media.

## Develop and build

```bash
cd src
npm ci
npm run dev
```

Eleventy prints the local preview URL. `npm run build` generates `site/`, which GitHub Actions uploads to Pages. The homepage includes the Google site verification tag. `src/sitemap.xml.njk` creates a sitemap from the generated routes; `src/robots.txt` and `src/.nojekyll` are copied into the output.

The build syncs English and French articles from `contents/blog/posts/` and `contents/news/posts/`. The homepage Latest section comes from `contents/pages/news/index.en.md`. Edit those source Markdown files rather than the generated files under `src/posts/imported/`, `src/news-articles/imported/`, or `src/updates/imported/`. Published images and files live in `src/assets/`.

| Content | Source |
| --- | --- |
| Name, headline, portrait, contact | `src/_data/site.json` |
| Social links | `src/_data/socials.json` |
| Research biography | `src/_data/research.md` |
| Research directions | `src/_data/directions.json` |
| Featured research cards | `src/_data/featuredProjects.json` |
| Project list | `src/_data/projects.json` |
| Publications | `src/publications/*.md` |
| Talks | `src/talks/*.md` |
| Blog and news articles | `contents/blog/posts/`, `contents/news/posts/` |
| Latest timeline | `contents/pages/news/index.en.md` |

The reference layout and stylesheet are credited in the site footer. Review the reference site's [CC BY-NC-SA 4.0 content license](https://creativecommons.org/licenses/by-nc-sa/4.0/) before reusing its materials elsewhere.
