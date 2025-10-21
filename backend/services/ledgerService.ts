import { LedgerService as SharedLedgerService } from "@shared/services";

export class LedgerService extends SharedLedgerService {
  override getLedger(): Promise<unknown> {
    // TODO: Implement getLedger method to return ledger data
    return Promise.reject(new Error("Not implemented"));
  }
}
