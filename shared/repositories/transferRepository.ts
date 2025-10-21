import { Transfer } from "../entities/transfer.ts";

interface I_TransferRepository {
  save(transfer: Transfer): Promise<void>;
  findById(id: string): Promise<Transfer | null>;
  findByPotId(potId: string): Promise<Transfer[]>;
}

export class TransferRepository implements I_TransferRepository {
  save(_transfer: Transfer): Promise<void> {
    return Promise.reject("Not implemented");
  }

  findById(_id: string): Promise<Transfer | null> {
    return Promise.reject("Not implemented");
  }

  findByPotId(_potId: string): Promise<Transfer[]> {
    return Promise.reject("Not implemented");
  }
}
