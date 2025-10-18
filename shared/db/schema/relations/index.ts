import { allocationsRelations } from "./allocationsRelations.ts";
import { eventsRelations } from "./eventsRelations.ts";
import { inviteTokensRelations } from "./inviteTokensRelations.ts";
import { membersRelations } from "./membersRelations.ts";
import { merchantsRelations } from "./merchantsRelations.ts";
import { passwordResetTokensRelations } from "./passwordResetTokensRelations.ts";
import { paymentsRelations } from "./paymentsRelations.ts";
import { potsRelations } from "./potsRelations.ts";
import { reservationsRelations } from "./reservationsRelations.ts";
import { sessionsRelations } from "./sessionsRelations.ts";
import { tagsRelations } from "./tagsRelations.ts";
import { transactionsRelations } from "./transactionsRelations.ts";
import { transfersRelations } from "./transfersRelations.ts";
import { usersRelations } from "./usersRelations.ts";

export const Relations = {
  usersRelations,
  transfersRelations,
  transactionsRelations,
  tagsRelations,
  sessionsRelations,
  reservationsRelations,
  potsRelations,
  paymentsRelations,
  passwordResetTokensRelations,
  merchantsRelations,
  membersRelations,
  inviteTokensRelations,
  eventsRelations,
  allocationsRelations,
};
