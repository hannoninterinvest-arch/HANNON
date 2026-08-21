import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

for (const p of [
  resolve(process.cwd(), ".env"),
  resolve(__dirname, "..", ".env"),
]) {
  if (existsSync(p)) config({ path: p, override: false });
}
