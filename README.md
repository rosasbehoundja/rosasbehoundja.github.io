# Rosas Behoundja's website

The live website is built from [`src/`](src/) with Eleventy, Bulma, and Markdown. The original articles and news timeline are kept in [`src/contents/`](src/contents/); `src/scripts/sync-content.mjs` imports them during development and builds. Images and other published assets live in `src/src/assets/`.

## Run locally

```bash
cd src
npm ci
npm run dev
```

Eleventy prints the preview URL (starting at `http://localhost:4173/`). To make the production output, run `npm run build` from `src/`; the deployable files are in `src/site/`.

GitHub Actions runs this same build and deploys `src/site/` to GitHub Pages on pushes to `main`.
