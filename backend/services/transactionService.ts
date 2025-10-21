import { TransactionService as SharedTransactionService } from "@shared/services";
import { Allocation, Transaction } from "@shared/entities";
import { z } from "zod";

// Request schemas
const CreateAllocationRequestSchema = z
  .object({
    memberId: z.string().uuid(),
    rule: z.enum(["percentage", "fixed_amount"]),
    percentage: z.number().int().min(0).max(10000).optional(), // basis points
    amountCents: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.rule === "percentage") {
        return data.percentage !== undefined && data.amountCents === undefined;
      }
      if (data.rule === "fixed_amount") {
        return data.amountCents !== undefined && data.percentage === undefined;
      }
      return false;
    },
    {
      message:
        "Invalid allocation: percentage rule requires percentage, fixed_amount rule requires amountCents",
    },
  );

const CreateTransactionRequestSchema = z.object({
  merchantId: z.string().uuid(),
  description: z.string().min(1).max(500),
  amountCents: z.number().int().positive(),
  type: z.enum(["expense", "income"]).default("expense"),
  transactionDate: z.string().datetime().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  allocations: z.array(CreateAllocationRequestSchema).min(1),
});

const UpdateTransactionRequestSchema = z.object({
  merchantId: z.string().uuid().optional(),
  description: z.string().min(1).max(500).optional(),
  amountCents: z.number().int().positive().optional(),
  type: z.enum(["expense", "income"]).optional(),
  transactionDate: z.string().datetime().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  allocations: z.array(CreateAllocationRequestSchema).min(1).optional(),
});

export type CreateTransactionRequest = z.infer<
  typeof CreateTransactionRequestSchema
>;
export type UpdateTransactionRequest = z.infer<
  typeof UpdateTransactionRequestSchema
>;
export type CreateAllocationRequest = z.infer<
  typeof CreateAllocationRequestSchema
>;

export class TransactionService extends SharedTransactionService {
  // Constructor inherited from SharedTransactionService
  // which takes (transactionRepository, merchantRepository, tagRepository)

  override async listTransactions(
    query: Record<string, unknown>,
  ): Promise<Transaction[]> {
    return await this.transactionRepository.findByQuery(query);
  }

  override async createTransaction(request: unknown): Promise<Transaction> {
    const validatedRequest = CreateTransactionRequestSchema.parse(request);

    // Validate that merchant exists
    const merchant = await this.merchantRepository.findById(
      validatedRequest.merchantId,
    );
    if (!merchant) {
      throw new Error(
        `Merchant with ID ${validatedRequest.merchantId} not found`,
      );
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
    await this.validateAllocations(
      validatedRequest.allocations,
      validatedRequest.amountCents,
    );

    // Create the transaction
    const transactionDate = validatedRequest.transactionDate
      ? new Date(validatedRequest.transactionDate)
      : new Date();

    const transaction = Transaction.create({
      merchantId: validatedRequest.merchantId,
      description: validatedRequest.description,
      amountCents: validatedRequest.amountCents,
      type: validatedRequest.type,
      transactionDate,
      createdById: "system", // TODO: Get from auth context
    });

    // Save transaction
    await this.transactionRepository.save(transaction);

    // Create and save allocations
    const allocations = validatedRequest.allocations.map((allocationReq) =>
      Allocation.create({
        transactionId: transaction.id,
        memberId: allocationReq.memberId,
        rule: allocationReq.rule,
        percentage: allocationReq.percentage,
        amountCents: allocationReq.amountCents,
      })
    );

    // Calculate the actual amounts for percentage-based allocations
    const calculatedAllocations = allocations.map((allocation) => {
      if (allocation.rule === "percentage") {
        const calculatedAmount = allocation.calculateAmount(
          transaction.amountCents,
        );
        return Allocation.from({
          ...allocation.toJSON(),
          calculatedAmountCents: calculatedAmount,
        });
      }
      return allocation;
    });

    await this.transactionRepository.updateAllocations(
      transaction.id,
      calculatedAllocations,
    );

    // TODO: Save transaction tags if provided

    return transaction;
  }

  override async updateTransaction(
    id: string,
    request: unknown,
  ): Promise<Transaction> {
    const validatedRequest = UpdateTransactionRequestSchema.parse(request);

    // Find existing transaction
    const existingTransaction = await this.transactionRepository.findById(id);
    if (!existingTransaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }

    // Validate merchant if provided
    if (validatedRequest.merchantId) {
      const merchant = await this.merchantRepository.findById(
        validatedRequest.merchantId,
      );
      if (!merchant) {
        throw new Error(
          `Merchant with ID ${validatedRequest.merchantId} not found`,
        );
      }
    }

    // Validate allocations if provided
    if (validatedRequest.allocations) {
      const amountCents = validatedRequest.amountCents ||
        existingTransaction.amountCents;
      await this.validateAllocations(validatedRequest.allocations, amountCents);
    }

    // Create updated transaction
    const updatedData = {
      ...existingTransaction.toJSON(),
      ...validatedRequest,
      transactionDate: validatedRequest.transactionDate
        ? new Date(validatedRequest.transactionDate)
        : existingTransaction.transactionDate,
    };

    const updatedTransaction = Transaction.from(updatedData);

    // Save updated transaction
    await this.transactionRepository.save(updatedTransaction);

    // Update allocations if provided
    if (validatedRequest.allocations) {
      const allocations = validatedRequest.allocations.map((allocationReq) =>
        Allocation.create({
          transactionId: updatedTransaction.id,
          memberId: allocationReq.memberId,
          rule: allocationReq.rule,
          percentage: allocationReq.percentage,
          amountCents: allocationReq.amountCents,
        })
      );

      // Calculate amounts for percentage allocations
      const calculatedAllocations = allocations.map((allocation) => {
        if (allocation.rule === "percentage") {
          const calculatedAmount = allocation.calculateAmount(
            updatedTransaction.amountCents,
          );
          return Allocation.from({
            ...allocation.toJSON(),
            calculatedAmountCents: calculatedAmount,
          });
        }
        return allocation;
      });

      await this.transactionRepository.updateAllocations(
        updatedTransaction.id,
        calculatedAllocations,
      );
    }

    return updatedTransaction;
  }

  private validateAllocations(
    allocations: CreateAllocationRequest[],
    totalAmountCents: number,
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
        }%)`,
      );
    }

    // Validate fixed amount allocations don't exceed total
    if (totalFixedAmount > totalAmountCents) {
      throw new Error(
        `Fixed amount allocations (${totalFixedAmount} cents) exceed transaction amount (${totalAmountCents} cents)`,
      );
    }

    // Can't mix percentage and fixed amount allocations
    const hasPercentage = allocations.some((a) => a.rule === "percentage");
    const hasFixedAmount = allocations.some((a) => a.rule === "fixed_amount");

    if (hasPercentage && hasFixedAmount) {
      throw new Error(
        "Cannot mix percentage and fixed amount allocations in the same transaction",
      );
    }
  }
}
