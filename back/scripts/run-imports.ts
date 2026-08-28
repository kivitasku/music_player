import "dotenv/config";

import { importMusic } from "./import-music.js";

async function main() {
  try {
    await importMusic();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();