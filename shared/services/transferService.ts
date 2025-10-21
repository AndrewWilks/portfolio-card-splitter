import { PotRepository, TransferRepository } from "../repositories/index.ts";
import { Transfer } from "../entities/index.ts";

export class TransferService {
  constructor(
    private transferRepository: TransferRepository,
    private potRepository: PotRepository,
  ) {}

  createTransfer(_request: unknown): Promise<Transfer> {
    throw new Error("Not implemented");
  }
}
