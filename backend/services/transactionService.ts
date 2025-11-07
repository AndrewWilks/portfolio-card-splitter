import {
  Allocation,
  AllocationRule,
  Transaction,
  TransactionType,
} from "@shared/entities";
import {
  TransactionRepository,
  MerchantRepository,
  TagRepository,
  CardAccountRepository,
  CardRepository,
} from "@backend/repositories";
import { type z } from "zod";
import { basisPoints } from "@shared/types";

// Type exports using entity schemas
export type CreateTransactionRequest = z.infer<typeof Transaction.createSchema>;
export type UpdateTransactionRequest = z.infer<typeof Transaction.updateSchema>;
export type CreateAllocationRequest = z.infer<typeof Allocation.createSchema>;

export class TransactionService {
  constructor(
    private transactionRepository: TransactionRepository,
    private merchantRepository: MerchantRepository,
    private tagRepository: TagRepository,
    private cardAccountRepository: CardAccountRepository,
    private cardRepository: CardRepository
  ) {}

  async listTransactions(
    query: Record<string, unknown>
  ): Promise<Transaction[]> {
    return await this.transactionRepository.findByQuery(query);
  }

  async createTransaction(request: unknown): Promise<Transaction> {
    // Validate request using entity schema with nested allocation validation
    const validatedRequest = Transaction.createSchema
      .extend({
        allocations: Allocation.createSchema.array().min(1),
      })
      .parse(request);

    // Validate that merchant exists
    const merchant = await this.merchantRepository.findById(
      validatedRequest.merchantId
    );
    if (!merchant) {
      throw new Error(
        `Merchant with ID ${validatedRequest.merchantId} not found`
      );
    }

    // Validate that CardAccount exists
    const cardAccount = await this.cardAccountRepository.findById(
      validatedRequest.cardAccountId
    );
    if (!cardAccount) {
      throw new Error(
        `CardAccount with ID ${validatedRequest.cardAccountId} not found`
      );
    }

    // If cardId provided, validate Card exists and belongs to CardAccount
    if (validatedRequest.cardId) {
      const card = await this.cardRepository.findById(validatedRequest.cardId);
      if (!card) {
        throw new Error(`Card with ID ${validatedRequest.cardId} not found`);
      }

      // Validate Card belongs to CardAccount
      if (card.cardAccountId !== validatedRequest.cardAccountId) {
        throw new Error(
          `Card ${validatedRequest.cardId} does not belong to CardAccount ${validatedRequest.cardAccountId}`
        );
      }
    }

    // Validate that all tags exist (if provided)
    if (validatedRequest.tagIds) {
      for (const tagId of validatedRequest.tagIds) {
        const tag = await this.tagRepository.findById(tagId);
        if (!tag) {
          throw new Error(`Tag with ID ${tagId} not found`);
        }
      }
    }

    // Validate allocations sum to 100% or total amount
    this.validateAllocations(
      validatedRequest.allocations,
      validatedRequest.amountCents
    );

    // Create the transaction
    const transactionDate = validatedRequest.transactionDate
      ? new Date(validatedRequest.transactionDate)
      : new Date();

    const transaction = new Transaction({
      merchantId: validatedRequest.merchantId,
      description: validatedRequest.description,
      amountCents: validatedRequest.amountCents,
      type:
        validatedRequest.type === "expense"
          ? TransactionType.EXPENSE
          : TransactionType.INCOME,
      transactionDate,
      createdById: "system", // TODO: Get from auth context
      cardAccountId: validatedRequest.cardAccountId,
      cardId: validatedRequest.cardId,
    });

    // Save transaction
    const savedTransaction = await this.transactionRepository.save(transaction);

    // Create and save allocations
    const allocations = validatedRequest.allocations.map((allocationReq) => {
      // Convert user-friendly rule names to enum values
      const rule =
        allocationReq.rule === "percentage"
          ? AllocationRule.basisPoints
          : AllocationRule.FIXED_AMOUNT;

      return new Allocation({
        transactionId: transaction.id,
        memberId: allocationReq.memberId,
        rule,
        basisPoints: allocationReq.percentage as basisPoints | undefined,
        amountCents: allocationReq.amountCents,
      });
    });

    // Save allocations
    for (const allocation of allocations) {
      await this.transactionRepository.updateAllocations(transaction.id, [
        allocation,
      ]);
    }

    // TODO: Save transaction tags if provided

    return savedTransaction[0] as Transaction;
  }

  async updateTransaction(id: string, request: unknown): Promise<Transaction> {
    // Validate request using entity schema
    const validatedRequest = Transaction.updateSchema
      .extend({
        allocations: Allocation.createSchema.array().min(1).optional(),
      })
      .parse(request);

    // Find existing transaction
    const existingTransaction = await this.transactionRepository.findById(id);
    if (!existingTransaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }

    // Validate merchant if provided
    if (validatedRequest.merchantId) {
      const merchant = await this.merchantRepository.findById(
        validatedRequest.merchantId
      );
      if (!merchant) {
        throw new Error(
          `Merchant with ID ${validatedRequest.merchantId} not found`
        );
      }
    }

    const existingData = existingTransaction.toJSON;

    // Validate allocations if provided
    if (validatedRequest.allocations) {
      const amountCents =
        validatedRequest.amountCents || existingData.amountCents;
      this.validateAllocations(validatedRequest.allocations, amountCents);
    }

    // Create updated transaction
    const updatedTransaction = new Transaction({
      ...existingData,
      merchantId: validatedRequest.merchantId ?? existingData.merchantId,
      description: validatedRequest.description ?? existingData.description,
      amountCents: validatedRequest.amountCents ?? existingData.amountCents,
      type: validatedRequest.type
        ? validatedRequest.type === "expense"
          ? TransactionType.EXPENSE
          : TransactionType.INCOME
        : existingData.type,
      transactionDate: validatedRequest.transactionDate
        ? new Date(validatedRequest.transactionDate)
        : existingData.transactionDate,
      updatedAt: new Date(),
    });

    // Save updated transaction
    const saved = await this.transactionRepository.save(updatedTransaction);

    // Update allocations if provided
    if (validatedRequest.allocations) {
      const allocations = validatedRequest.allocations.map((allocationReq) => {
        const rule =
          allocationReq.rule === "percentage"
            ? AllocationRule.basisPoints
            : AllocationRule.FIXED_AMOUNT;

        return new Allocation({
          transactionId: updatedTransaction.id,
          memberId: allocationReq.memberId,
          rule,
          basisPoints: allocationReq.percentage as basisPoints | undefined,
          amountCents: allocationReq.amountCents,
        });
      });

      // Save allocations
      for (const allocation of allocations) {
        await this.transactionRepository.updateAllocations(
          updatedTransaction.id,
          [allocation]
        );
      }
    }

    return saved[0] as Transaction;
  }

  private validateAllocations(
    allocations: CreateAllocationRequest[],
    totalAmountCents: number
  ): void {
    if (allocations.length === 0) {
      throw new Error("At least one allocation is required");
    }

    let totalPercentage = 0;
    let totalFixedAmount = 0;

    for (const allocation of allocations) {
      if (allocation.rule === "percentage") {
        totalPercentage += allocation.percentage || 0;
      } else if (allocation.rule === "fixed_amount") {
        totalFixedAmount += allocation.amountCents || 0;
      }
    }

    // Validate percentage allocations sum to 100% (10000 basis points)
    if (totalPercentage > 0 && totalPercentage !== 10000) {
      throw new Error(
        `Percentage allocations must sum to 100% (currently ${
          totalPercentage / 100
        }%)`
      );
    }

    // Validate fixed amount allocations don't exceed total
    if (totalFixedAmount > totalAmountCents) {
      throw new Error(
        `Fixed amount allocations (${totalFixedAmount} cents) exceed transaction amount (${totalAmountCents} cents)`
      );
    }

    // Can't mix percentage and fixed amount allocations
    const hasPercentage = allocations.some((a) => a.rule === "percentage");
    const hasFixedAmount = allocations.some((a) => a.rule === "fixed_amount");

    if (hasPercentage && hasFixedAmount) {
      throw new Error(
        "Cannot mix percentage and fixed amount allocations in the same transaction"
      );
    }
  }
}
