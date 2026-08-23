import "./main";

const params = new URLSearchParams(location.search);
const requested = params.get("post") ?? "";
const isBlog = location.pathname.includes("/blog/");
const aliases: Record<string, string> = isBlog ? {
  "minizinc-modeling": "2026-08-10-minizinc-modeling",
  "2026-08-27-dli-return": "2026-08-23-dli-return",
} : {
  "mentoring-noai-2026": "2026-07-17-mentoring-noai",
  "deep-learning-indaba-2026": "2026-07-03-deep-learning-indaba",
  "end-internship-lrsia-2026": "2026-06-19-end-internship-lrsia",
  "world-backup-day-2026": "2026-03-31-world-backup-day",
  "start-internship-lrsia-2026": "2026-02-16-start-internship-lrsia",
  "retrospective-2025": "2026-01-26-retrospective-2025",
};
const slug = aliases[requested] ?? requested;
if (/^[a-z0-9-]+$/.test(slug)) {
  location.replace(`/pages/${isBlog ? "blog" : "news"}/articles/${slug}/`);
}
