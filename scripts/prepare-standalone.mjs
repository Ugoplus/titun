import { cpSync, existsSync, mkdirSync } from "node:fs";

const standaloneDirectory = ".next/standalone";

if (existsSync(standaloneDirectory)) {
  mkdirSync(`${standaloneDirectory}/.next`, { recursive: true });
  cpSync("public", `${standaloneDirectory}/public`, { recursive: true });
  cpSync(".next/static", `${standaloneDirectory}/.next/static`, { recursive: true });
  console.log("Prepared standalone public and static assets");
}
