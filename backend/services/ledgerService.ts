import {
  CardAccountRepository,
  TransactionRepository,
  PaymentRepository,
} from "@backend/repositories";
import { CardAccount } from "@shared/entities";
import { Cents } from "@shared/types";

export interface CardAccountBalance {
  cardAccount: CardAccount;
  totalTransactions: Cents;
  totalPayments: Cents;
  outstandingBalance: Cents;
  transactionCount: number;
  paymentCount: number;
}

export interface LedgerSummary {
  cardAccounts: CardAccountBalance[];
  totalOutstanding: Cents;
  totalTransactions: Cents;
  totalPayments: Cents;
}

/**
 * LedgerService - Generates ledger reports and financial summaries
 *
 * Calculates outstanding balances per CardAccount by aggregating:
 * - Total transaction amounts for each CardAccount
 * - Total payments made against those transactions
 * - Outstanding balance = Total transactions - Total payments
 */
export class LedgerService {
  constructor(
    private cardAccountRepository: CardAccountRepository,
    private transactionRepository: TransactionRepository,
    private paymentRepository: PaymentRepository
  ) {}

  /**
   * Get outstanding balances for all CardAccounts owned by a user
   * @param userId - The user ID to filter CardAccounts
   * @returns Array of CardAccount balances with outstanding amounts
   */
  async getCardAccountBalances(userId: string): Promise<CardAccountBalance[]> {
    // Get all card accounts for the user
    const cardAccounts = await this.cardAccountRepository.findByOwnerId(userId);

    // Calculate balance for each card account
    const balances = await Promise.all(
      cardAccounts.map(async (cardAccount) => {
        return await this.calculateCardAccountBalance(cardAccount);
      })
    );

    return balances;
  }

  /**
   * Get outstanding balance for a specific CardAccount
   * @param cardAccountId - The CardAccount ID
   * @returns CardAccount balance with outstanding amount
   */
  async getCardAccountBalance(
    cardAccountId: string
  ): Promise<CardAccountBalance> {
    const cardAccount = await this.cardAccountRepository.findById(
      cardAccountId
    );
    if (!cardAccount) {
      throw new Error(`CardAccount with ID ${cardAccountId} not found`);
    }

    return await this.calculateCardAccountBalance(cardAccount);
  }

  /**
   * Get comprehensive ledger summary for a user
   * @param userId - The user ID
   * @returns Complete ledger summary with all CardAccount balances
   */
  async getLedgerSummary(userId: string): Promise<LedgerSummary> {
    const cardAccountBalances = await this.getCardAccountBalances(userId);

    // Calculate totals across all card accounts
    const totalOutstanding = cardAccountBalances.reduce(
      (sum, balance) => sum + balance.outstandingBalance,
      0
    ) as Cents;

    const totalTransactions = cardAccountBalances.reduce(
      (sum, balance) => sum + balance.totalTransactions,
      0
    ) as Cents;

    const totalPayments = cardAccountBalances.reduce(
      (sum, balance) => sum + balance.totalPayments,
      0
    ) as Cents;

    return {
      cardAccounts: cardAccountBalances,
      totalOutstanding,
      totalTransactions,
      totalPayments,
    };
  }

  /**
   * Calculate outstanding balance for a single CardAccount
   * @param cardAccount - The CardAccount to calculate balance for
   * @returns Balance details including transactions, payments, and outstanding
   */
  private async calculateCardAccountBalance(
    cardAccount: CardAccount
  ): Promise<CardAccountBalance> {
    // Get all transactions for this card account
    const transactions = await this.transactionRepository.findByCardAccountId(
      cardAccount.id
    );

    // Calculate total transaction amounts
    const totalTransactions = transactions.reduce(
      (sum, transaction) => sum + transaction.amountCents,
      0
    ) as Cents;

    // Get all payments for these transactions
    const transactionIds = transactions.map((t) => t.id);
    const payments = await this.getPaymentsByTransactionIds(transactionIds);

    // Calculate total payments
    const totalPayments = payments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0
    ) as Cents;

    // Outstanding balance = total transactions - total payments
    const outstandingBalance = (totalTransactions - totalPayments) as Cents;

    return {
      cardAccount,
      totalTransactions,
      totalPayments,
      outstandingBalance,
      transactionCount: transactions.length,
      paymentCount: payments.length,
    };
  }

  /**
   * Helper method to get payments for multiple transaction IDs
   * @param transactionIds - Array of transaction IDs
   * @returns Array of payments
   */
  private async getPaymentsByTransactionIds(transactionIds: string[]) {
    if (transactionIds.length === 0) {
      return [];
    }

    // Get payments for each transaction
    const paymentArrays = await Promise.all(
      transactionIds.map((id) => this.paymentRepository.findByTransactionId(id))
    );

    // Flatten the arrays
    return paymentArrays.flat();
  }

  /**
   * Legacy getLedger method - now redirects to getLedgerSummary
   * @deprecated Use getLedgerSummary(userId) instead
   */
  getLedger(): Promise<unknown> {
    throw new Error(
      "getLedger() is deprecated. Use getLedgerSummary(userId) instead."
    );
  }
}
