# Rosas Behoundja's website

The repository root is the Eleventy project. It uses Bulma, Markdown content, and the page structure adapted from [szj.io](https://www.szj.io/).

## Develop and build

```bash
npm ci
npm run dev
```

The development server starts at `http://localhost:4173/`. Run `npm run build` to generate the deployable `site/` directory. GitHub Actions builds from the repository root and uploads `site/` to GitHub Pages.

## Where to edit

- `contents/` holds the original English and French blog and news Markdown, including the Latest timeline in `contents/pages/news/index.en.md`.
- `templates/` holds Eleventy pages, layouts, data, and published assets. Owner details and project lists are in `templates/_data/`.
- `scripts/sync-content.mjs` imports the Markdown into generated files beneath `templates/`. Edit `contents/` rather than those generated files.
- `eleventy.config.js` defines the Eleventy input, collections, and output paths.

Each blog Markdown file needs a one sentence `description` in its front matter. Use `preview_image` and `preview_image_alt` for its listing image.

See [the content map](docs/eleventy.md) for specific files. The reference layout and stylesheet are credited in the site footer. Review the reference site's [CC BY-NC-SA 4.0 content license](https://creativecommons.org/licenses/by-nc-sa/4.0/) before reusing its materials elsewhere.
