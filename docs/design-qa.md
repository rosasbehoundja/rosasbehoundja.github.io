# Design QA

**Source visual truth:** live `https://www.szj.io/`, `/talks`, `/posts`, and `/posts/chapyter.html`, captured in `qa/source-*.png`.

**Implementation baseline:** `http://localhost:4173/`, `/talks/`, `/posts/`, and the former sample article, captured in `qa/template-*.png`. These captures predate the owner-content import.

**Comparison evidence:** `qa/comparison-home.png`, `qa/comparison-talks.png`, `qa/comparison-posts.png`, `qa/comparison-article.png`, and `qa/comparison-mobile.png`. Desktop source captures were 1126×485 pixels; implementation captures were 1113×833 pixels. For the desktop comparison images, the implementation was cropped to the same first 485 pixels and scaled horizontally by about 1.2%. The mobile homepage pair was captured sequentially in one tab at a 390×844 CSS viewport; both images are 375×812 pixels after browser chrome. State was the initial page view except for the interaction tests noted below.

**Findings**

- No actionable P0, P1, or P2 visual mismatch remains in the captured page types. The exact served `bulma.css` was copied byte for byte (SHA-256 `f6123212c7b87ac39b8124947e8ba0b7c5acd6073ca60b7465c6d3867daf4746`). Fonts, type hierarchy, colors, hero spacing, column grids, nav, section shadows, cards, tabs, talk rows, post rows, and article header/body structure use the source classes and stylesheet.
- The portrait, writing image, talk image, author name, and sample copy differ by design because the template is for another person. These alter wrapping and page height, especially on mobile; they are not CSS changes. The source's fourth social icon and more numerous items also create horizontal overflow that the shorter sample content does not.

**Comparison history**

1. Initial implementation used a separate CSS design and did not match the reference. Replaced it with the source stylesheet and page structures.
2. The publication panel was hidden because the source CSS requires `.tab-content.is-active`; fixed the class and tab behavior. Verified all three views and Show more in the browser.
3. The blog article initially lacked the base layout, then its body used an extra `post` class that shifted content left. Fixed both and compared `qa/comparison-article.png` with the source. Added a sample image to exercise the image slot.
4. The research filter initially used an unused class. Updated it to the source's `is-not-active` state. Verified update selection, publication tabs, Show more, and research filtering. Navigation to talks, blog index, and post detail works. Final browser console had no errors.

**Content update:** The former sample post, publications, updates, and talk were removed. The current build imports the owner's English and French blog/news articles and news timeline from `contents/`. The current article layout was checked in the in-app browser at `/posts/2026-08-23-dli-return/`.

**Project update (2026-10-14):** The Projects section now includes the user's MPVRP-CC description and both supplied links, the constraint programming resource list, Tech trends monitor, and Cartographie immobilière automatisée. Review Scraper and SentiMaster were removed from the Projects list. Eleventy generated 32 pages successfully; the generated homepage check found every requested project and neither removed project. The Projects section was inspected in the in-app browser at `http://localhost:4173/#projects` with the source stylesheet unchanged.

**Homepage refinement (2026-10-14):** Compared the live reference's tag classes, featured-card icon slot, inline organization logos, and research heading highlights with the local page. The homepage now uses the reference's red, blue, and green Bulma tag colors; two emoji icons occupy the featured-card icon slots; four local organization logos load inline; and all three direction headings use the reference's colored highlight states. Checked the local page at desktop and 390px mobile width, confirmed the CV text remains visible on mobile, exercised the research filter, and verified the updated project copy in the rendered page. The main `bulma.css` file is unchanged. `npm run build` succeeded with 32 pages.

**Deployment source update (2026-10-14):** GitHub Pages builds from the repository root and uploads `site/`. The previous root Vite source, generated bundle, duplicate media, unused template samples, and obsolete home/work Markdown pages were removed. The built homepage contains the requested Google verification tag; `robots.txt`, `.nojekyll`, and the current sitemap are in the artifact. The build generated 32 HTML pages and 32 sitemap URLs, with no missing local links or assets.

**Implementation checklist for reuse by another person:** Replace the owner content in `contents/`, `templates/_data/`, and owner media before publishing.

**Follow-up polish:** If the template is to work entirely offline, package the externally loaded Google Fonts, Font Awesome, Academicons, and Bulma Tooltip resources locally.

final result: passed
