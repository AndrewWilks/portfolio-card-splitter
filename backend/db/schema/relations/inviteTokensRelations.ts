import { relations } from "drizzle-orm";
import { inviteTokens } from "../tables/inviteTokens.ts";

export const inviteTokensRelations = relations(inviteTokens, () => ({}));
