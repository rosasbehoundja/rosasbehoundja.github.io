# szj.io style academic site template

This is an Eleventy port of the **page structures and exact served Bulma stylesheet** used by [szj.io](https://www.szj.io/). It covers the homepage, talks, blog, news, work history, and Markdown article layouts. The project is isolated from the existing Vite site in the parent directory.

The copied `src/assets/bulma.css` is preserved byte for byte from the reference site. `src/assets/manni.css` and `src/assets/pattern.png` are also from the reference. Keep attribution and review the reference site's [CC BY-NC-SA 4.0 content license](https://creativecommons.org/licenses/by-nc-sa/4.0/) before publishing or reusing its materials. The site content comes from this repository's `contents/` directory; it does not include Shannon Shen's biography, papers, talks, or photos.

## Run

```bash
cd academic-template
npm install
npm run dev
```

Open the URL printed by Eleventy (normally <http://localhost:4173/>). `npm run build` generates `site/`.

`npm run dev` and `npm run build` first run `npm run sync`. The sync script imports English and French Markdown articles from `../contents/blog/posts/` and `../contents/news/posts/`, copies their local media, and rebuilds the homepage update cards. Edit the original files in `contents/`, then run the build again. English pages are at `/posts/` and `/news/`; translated articles are at `/fr/posts/` and `/fr/news/`. The timeline and work history read directly from `contents/pages/`.

## Customize

| What | File |
| --- | --- |
| Name, tagline, portrait, email, profiles | `src/_data/site.json` |
| Social icons and links | `src/_data/socials.json` |
| Navigation | `src/_data/nav.json` |
| Research bio | `src/_data/research.md` |
| Research directions | `src/_data/directions.json` |
| Project groups | `src/_data/projects.json` |
| Dated updates | `../contents/news/posts/*/index.en.md` |
| Publications and featured research cards | `src/publications/*.md` |
| Talks | `src/talks/*.md` |
| Blog and news articles | `../contents/blog/posts/*/index.{en,fr}.md`, `../contents/news/posts/*/index.{en,fr}.md` |
| Work history and timeline | `../contents/pages/work/index.en.md`, `../contents/pages/news/index.{en,fr}.md` |

Publication front matter supports `title`, `year`, `authors`, `venue`, `summary`, `featured`, `focus`, optional `image`, and a `links` list with `label` and `url`. `focus` should match a value in `directions.json`. The Markdown body becomes the detailed text in the publication list.

Talk front matter supports `title`, `date`, `event`, `eventUrl`, `image`, and `slides`. Post front matter supports `layout: post.njk`, `title`, `description`, `date`, `readingTime`, `image`, and `permalink`.

The source CSS references Google Fonts, and the page uses Font Awesome, Academicons, and Bulma Tooltip stylesheets. Those vendor resources still load externally. To adapt this for another person, replace the content in `contents/`, the identity data in `src/_data/`, and the owner media. The research bio in `src/_data/research.md` and research directions in `src/_data/directions.json` are separate from the import.
