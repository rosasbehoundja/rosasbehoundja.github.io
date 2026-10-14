import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const templateRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
rmSync(path.join(templateRoot, "site"), { recursive: true, force: true });
await import("./sync-content.mjs");
