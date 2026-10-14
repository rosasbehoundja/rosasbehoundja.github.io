# szj.io style academic site template

This is an Eleventy port of the **page structures and exact served Bulma stylesheet** used by [szj.io](https://www.szj.io/). It covers the homepage, talks index, blog index, and Markdown blog article layout. Its content is editable for a different person. The project is isolated from the existing Vite site in the parent directory.

The copied `src/assets/bulma.css` is preserved byte for byte from the reference site. `src/assets/manni.css` and `src/assets/pattern.png` are also from the reference. Keep attribution and review the reference site's [CC BY-NC-SA 4.0 content license](https://creativecommons.org/licenses/by-nc-sa/4.0/) before publishing or reusing its materials. This starter uses owner content from the parent repository and clearly marked sample publication/post content; it does not include Shannon Shen's biography, papers, talks, or photos.

## Run

```bash
cd academic-template
npm install
npm run dev
```

Open <http://localhost:4173/>. `npm run build` generates `site/`.

## Customize

| What | File |
| --- | --- |
| Name, tagline, portrait, email, profiles | `src/_data/site.json` |
| Social icons and links | `src/_data/socials.json` |
| Navigation | `src/_data/nav.json` |
| Research bio | `src/_data/research.md` |
| Research directions | `src/_data/directions.json` |
| Project groups | `src/_data/projects.json` |
| Dated updates | `src/updates/*.md` |
| Publications and featured research cards | `src/publications/*.md` |
| Talks | `src/talks/*.md` |
| Blog posts | `src/posts/*.md` |

Publication front matter supports `title`, `year`, `authors`, `venue`, `summary`, `featured`, `focus`, optional `image`, and a `links` list with `label` and `url`. `focus` should match a value in `directions.json`. The Markdown body becomes the detailed text in the publication list.

Talk front matter supports `title`, `date`, `event`, `eventUrl`, `image`, and `slides`. Post front matter supports `layout: post.njk`, `title`, `description`, `date`, `readingTime`, `image`, and `permalink`.

The source CSS references Google Fonts, and the page uses Font Awesome, Academicons, and Bulma Tooltip stylesheets. Those vendor resources still load externally. Replace the sample portrait, resume, and post images before using this as another person's site.
