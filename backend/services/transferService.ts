import { Transfer } from "@shared/entities";
import { TransferRepository, PotRepository } from "@backend/repositories";
import { type z } from "zod";

// Type export using entity schema
export type CreateTransferRequest = z.infer<typeof Transfer.createSchema>;

export class TransferService {
  constructor(
    private transferRepo: TransferRepository,
    private potRepo: PotRepository
  ) {}

  async createTransfer(data: unknown): Promise<Transfer> {
    // Validate request using entity schema (includes validation that at least one pot is specified)
    const validatedData = Transfer.createSchema.parse(data);

    // Validate both pots are not the same
    if (
      validatedData.fromPotId !== null &&
      validatedData.toPotId !== null &&
      validatedData.fromPotId === validatedData.toPotId
    ) {
      throw new Error("Cannot transfer to the same pot");
    }

    // Validate source pot exists (if specified)
    if (validatedData.fromPotId !== null) {
      const fromPot = await this.potRepo.findById(validatedData.fromPotId);
      if (!fromPot) {
        throw new Error(`Source pot not found: ${validatedData.fromPotId}`);
      }
    }

    // Validate destination pot exists (if specified)
    if (validatedData.toPotId !== null) {
      const toPot = await this.potRepo.findById(validatedData.toPotId);
      if (!toPot) {
        throw new Error(`Destination pot not found: ${validatedData.toPotId}`);
      }
    }

    // Create transfer entity
    const transfer = new Transfer({
      fromPotId: validatedData.fromPotId,
      toPotId: validatedData.toPotId,
      amountCents: validatedData.amountCents,
      occurredOn: validatedData.occurredOn,
      note: validatedData.note,
    });

    // Save to database
    const saved = await this.transferRepo.save(transfer);
    return saved[0] as Transfer;
  }

  async findById(id: string): Promise<Transfer | null> {
    return await this.transferRepo.findById(id);
  }

  async findByPotId(potId: string): Promise<Transfer[]> {
    return await this.transferRepo.findByPotId(potId);
  }

  async findCashTransfers(): Promise<Transfer[]> {
    return await this.transferRepo.findCashTransfers();
  }
}
