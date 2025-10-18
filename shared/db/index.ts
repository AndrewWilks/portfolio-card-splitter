import { Enums } from "./schema/enums/index.ts";
import { Relations } from "./schema/relations/index.ts";
import { Tables } from "./schema/tables/index.ts";

export { db } from "./db.client.ts";

export const Schemas = {
  Enums,
  Tables,
  Relations,
};
