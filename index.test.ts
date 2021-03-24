import { Entity, exportAll } from "./index";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("esa-exporter", () => {
  test(
    "usage example",
    async () => {
      // noinspection SuspiciousTypeOfGuard
      if (
        typeof process.env.ESA_TEAM !== "string" ||
        typeof process.env.ESA_TOKEN !== "string"
      ) {
        console.warn(`Environment variables are not set: ESA_TEAM, ESA_TOKEN`);
        return;
      }

      const team = process.env.ESA_TEAM;
      const token = process.env.ESA_TOKEN;
      const entities: Entity[] = [];
      for await (const entity of exportAll({ team, token })) {
        switch (entity.$type) {
          case "member":
            console.log(`member: ${entity.screen_name}`);
            break;
          case "post":
            console.log(`post: ${entity.full_name}`);
            break;
        }
        entities.push(entity);
      }
      const file = path.join(
        fs.mkdtempSync(path.join(os.tmpdir(), "esa-")),
        "data.json"
      );
      fs.writeFileSync(file, JSON.stringify(entities));
      console.info(`All data was exported to ${file}`);
    },
    10 * 1000
  );
});
