import "./main";
import { renderMarkdown, setHTML } from "./content";
import workFr from "/contents/pages/work/index.fr.md?raw";
import workEn from "/contents/pages/work/index.en.md?raw";

const work = { fr: workFr.trim(), en: workEn.trim() };
setHTML("work-fr", renderMarkdown(work.fr));
setHTML("work-en", renderMarkdown(work.en));
