# Rosas Behoundja's Eleventy website

The repository root is the source and build root for the live GitHub Pages site. It uses Eleventy, Markdown, and the Bulma stylesheet and page structure adapted from [szj.io](https://www.szj.io/). The copied `src/assets/bulma.css` is preserved from the reference; the site uses Rosas Behoundja's own content and media.

## Develop and build

```bash
npm ci
npm run dev
```

Eleventy prints the local preview URL. `npm run build` generates `site/`, which GitHub Actions uploads to Pages. The homepage includes the Google site verification tag. `src/sitemap.xml.njk` creates a sitemap from the generated routes; `src/robots.txt` and `src/.nojekyll` are copied into the output.

The build reads English and French articles directly from `src/posts/<slug>/index.en.md` and `index.fr.md`. The Reading of the week archive lives in `src/posts/en/` and `src/posts/fr/`. The homepage Latest section reads Markdown files from `src/updates/`; add an update as `YYYY-MM-DD.md`. Published images and files live in `src/assets/`.

Each post Markdown file needs `layout: post.njk`, `title`, `date`, `lang`, `permalink`, and `articleType` in its front matter. The blog listing uses `description` and `image` when provided.

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
| Blog and news articles | `src/posts/<slug>/index.en.md`, `index.fr.md` |
| Latest updates | `src/updates/YYYY-MM-DD.md` |

The reference layout and stylesheet are credited in the site footer. Review the reference site's [CC BY-NC-SA 4.0 content license](https://creativecommons.org/licenses/by-nc-sa/4.0/) before reusing its materials elsewhere.
