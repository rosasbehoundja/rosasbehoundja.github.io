import "./main";
import { renderInline, renderMarkdown, setHTML } from "./content";
import homeFr from "/contents/pages/home/index.fr.md?raw";
import homeEn from "/contents/pages/home/index.en.md?raw";
import beyondFr from "/contents/pages/beyond/index.fr.md?raw";
import beyondEn from "/contents/pages/beyond/index.en.md?raw";
import newsFr from "/contents/pages/news/index.fr.md?raw";
import newsEn from "/contents/pages/news/index.en.md?raw";

const ITEMS_PER_PAGE = 10;

interface NewsEntry {
  header: string;
  fr: string;
  en: string;
}

function parseNewsEntries(raw: string): Array<{ header: string; content: string }> {
  const matches = [...raw.matchAll(/^###[ \t]+(.+?)[ \t]*$/gm)];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? raw.length;
    return { header: (match[1] ?? "").trim(), content: raw.slice(start, end).trim() };
  });
}

function init(): void {
  const home = { fr: homeFr.trim(), en: homeEn.trim() };
  const beyond = { fr: beyondFr.trim(), en: beyondEn.trim() };
  setHTML("about-fr", renderMarkdown(home.fr));
  setHTML("about-en", renderMarkdown(home.en));
  setHTML("beyond-fr", renderMarkdown(beyond.fr));
  setHTML("beyond-en", renderMarkdown(beyond.en));

  const localizedNews = { fr: newsFr.trim(), en: newsEn.trim() };
  const frEntries = parseNewsEntries(localizedNews.fr);
  const enEntries = parseNewsEntries(localizedNews.en);
  const entries: NewsEntry[] = frEntries.map((entry, index) => ({
    header: entry.header,
    fr: entry.content,
    en: enEntries[index]?.content ?? "",
  }));
  const more = entries.find((entry) => entry.header.toUpperCase() === "MORE");
  const news = entries.filter((entry) => entry.header.toUpperCase() !== "MORE");
  let page = 0;

  const render = (): void => {
    const list = document.getElementById("news-list");
    if (!list) return;
    list.innerHTML = news.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).map((item) => `
      <div class="news-item flex flex-col sm:flex-row gap-1 sm:gap-6 items-start text-sm">
        <span class="news-date font-mono text-neutral-500 whitespace-nowrap min-w-[100px]">${item.header}</span>
        <span class="news-content text-neutral-700"><span class="fr-text">${renderInline(item.fr)}</span><span class="en-text">${renderInline(item.en)}</span></span>
      </div>`).join("");

    const pages = Math.max(1, Math.ceil(news.length / ITEMS_PER_PAGE));
    const pagination = document.getElementById("newsPagination");
    if (pagination) pagination.style.display = pages > 1 ? "" : "none";
    const indicator = document.getElementById("newsPageIndicator");
    if (indicator) indicator.textContent = `${page + 1} / ${pages}`;
    const previous = document.querySelector<HTMLButtonElement>("#prevNews");
    const next = document.querySelector<HTMLButtonElement>("#nextNews");
    if (previous) previous.disabled = page === 0;
    if (next) next.disabled = page >= pages - 1;
  };

  document.getElementById("prevNews")?.addEventListener("click", () => { if (page > 0) { page--; render(); } });
  document.getElementById("nextNews")?.addEventListener("click", () => { if ((page + 1) * ITEMS_PER_PAGE < news.length) { page++; render(); } });
  render();

  if (more) setHTML("news-more", `<p class="fr-text mt-5 text-sm text-neutral-600">${renderInline(more.fr)}</p><p class="en-text mt-5 text-sm text-neutral-600">${renderInline(more.en)}</p>`);
}

init();
