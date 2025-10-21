import { TransferService as SharedTransferService } from "@shared/services";
import { Transfer } from "@shared/entities";

export class TransferService extends SharedTransferService {
  override createTransfer(_request: unknown): Promise<Transfer> {
    // TODO: Implement createTransfer method to create and save new transfer
    return Promise.reject(new Error("Not implemented"));
  }
}
