# Rosas Behoundja's website

The repository root is the Eleventy project. It uses Bulma, Markdown content, and the page structure adapted from [szj.io](https://www.szj.io/).

## Develop and build

```bash
npm ci
npm run dev
```

The development server starts at `http://localhost:4173/`. Run `npm run build` to generate the deployable `site/` directory. GitHub Actions builds from the repository root and uploads `site/` to GitHub Pages.

## Where to edit

- `src/posts/<slug>/index.en.md` and `index.fr.md` hold English and French blog and news articles. The Reading of the week archive is in `src/posts/en/` and `src/posts/fr/`.
- `src/updates/` holds homepage updates as dated Markdown files.
- `src/assets/post-media/` holds article images. Owner details and project lists are in `src/_data/`.
- `eleventy.config.js` defines the Eleventy input, collections, and output paths.

Each post Markdown file needs `layout: post.njk`, `title`, `date`, `lang`, `permalink`, and `articleType` in its front matter. Use `description`, `image`, and `imageAlt` for its listing.

See [the content map](docs/eleventy.md) for specific files. The reference layout and stylesheet are credited in the site footer. Review the reference site's [CC BY-NC-SA 4.0 content license](https://creativecommons.org/licenses/by-nc-sa/4.0/) before reusing its materials elsewhere.
