import { allocations } from "./allocations.ts";
import { events } from "./events.ts";
import { inviteTokens } from "./inviteTokens.ts";
import { members } from "./members.ts";
import { merchants } from "./merchants.ts";
import { passwordResetTokens } from "./passwordResetTokens.ts";
import { payments } from "./payment.ts";
import { pots } from "./pots.ts";
import { reservations } from "./reservations.ts";
import { sessions } from "./sessions.ts";
import { tags } from "./tags.ts";
import { transactions } from "./transactions.ts";
import { transactionTags } from "./transactionTags.ts";
import { transfers } from "./transfers.ts";
import { users } from "./users.ts";

export const Tables = {
  users,
  events,
  inviteTokens,
  members,
  passwordResetTokens,
  payments,
  pots,
  reservations,
  sessions,
  transactions,
  transactionTags,
  transfers,
  allocations,
  merchants,
  tags,
};
