# Design QA

**Source visual truth:** live `https://www.szj.io/`, `/talks`, `/posts`, and `/posts/chapyter.html`, captured in `qa/source-*.png`.

**Implementation:** `http://localhost:4173/`, `/talks/`, `/posts/`, and `/posts/welcome.html`, captured in `qa/template-*.png`.

**Comparison evidence:** `qa/comparison-home.png`, `qa/comparison-talks.png`, `qa/comparison-posts.png`, `qa/comparison-article.png`, and `qa/comparison-mobile.png`. Desktop source captures were 1126×485 pixels; implementation captures were 1113×833 pixels. For the desktop comparison images, the implementation was cropped to the same first 485 pixels and scaled horizontally by about 1.2%. The mobile homepage pair was captured sequentially in one tab at a 390×844 CSS viewport; both images are 375×812 pixels after browser chrome. State was the initial page view except for the interaction tests noted below.

**Findings**

- No actionable P0, P1, or P2 visual mismatch remains in the captured page types. The exact served `bulma.css` was copied byte for byte (SHA-256 `f6123212c7b87ac39b8124947e8ba0b7c5acd6073ca60b7465c6d3867daf4746`). Fonts, type hierarchy, colors, hero spacing, column grids, nav, section shadows, cards, tabs, talk rows, post rows, and article header/body structure use the source classes and stylesheet.
- The portrait, writing image, talk image, author name, and sample copy differ by design because the template is for another person. These alter wrapping and page height, especially on mobile; they are not CSS changes. The source's fourth social icon and more numerous items also create horizontal overflow that the shorter sample content does not.

**Comparison history**

1. Initial implementation used a separate CSS design and did not match the reference. Replaced it with the source stylesheet and page structures.
2. The publication panel was hidden because the source CSS requires `.tab-content.is-active`; fixed the class and tab behavior. Verified all three views and Show more in the browser.
3. The blog article initially lacked the base layout, then its body used an extra `post` class that shifted content left. Fixed both and compared `qa/comparison-article.png` with the source. Added a sample image to exercise the image slot.
4. The research filter initially used an unused class. Updated it to the source's `is-not-active` state. Verified update selection, publication tabs, Show more, and research filtering. Navigation to talks, blog index, and post detail works. Final browser console had no errors.

**Open questions:** None for the page types. The template intentionally ships sample content rather than copying every article and personal asset from the reference.

**Implementation checklist:** Replace sample publications, talk, post, portrait, and resume; edit profile data and links before publishing.

**Follow-up polish:** If the template is to work entirely offline, package the externally loaded Google Fonts, Font Awesome, Academicons, and Bulma Tooltip resources locally.

final result: passed
