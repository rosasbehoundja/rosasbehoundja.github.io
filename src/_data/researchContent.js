import { readFileSync } from "node:fs";
export default readFileSync(new URL("./research.md", import.meta.url), "utf8");
