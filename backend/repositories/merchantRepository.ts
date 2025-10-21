import { MerchantRepository as SharedMerchantRepository } from "@shared/repositories";
import { Merchant } from "@shared/entities";
import { db, Schemas } from "@db";
import { eq } from "drizzle-orm";

export class MerchantRepository extends SharedMerchantRepository {
  constructor(private dbClient = db) {
    super();
  }

  override async save(merchant: Merchant): Promise<void> {
    const data = merchant.toJSON();
    await this.dbClient
      .insert(Schemas.Tables.merchants)
      .values({
        id: data.id,
        name: data.name,
        location: data.location || null,
        mergedIntoId: data.mergedIntoId || null,
        isActive: data.isActive,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .onConflictDoUpdate({
        target: Schemas.Tables.merchants.id,
        set: {
          name: data.name,
          location: data.location || null,
          mergedIntoId: data.mergedIntoId || null,
          isActive: data.isActive,
          updatedAt: data.updatedAt,
        },
      });
  }

  override async findById(id: string): Promise<Merchant | null> {
    const result = await this.dbClient
      .select()
      .from(Schemas.Tables.merchants)
      .where(eq(Schemas.Tables.merchants.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return Merchant.from({
      ...row,
      location: row.location || undefined,
      mergedIntoId: row.mergedIntoId || undefined,
    });
  }

  override async findByName(name: string): Promise<Merchant | null> {
    const result = await this.dbClient
      .select()
      .from(Schemas.Tables.merchants)
      .where(eq(Schemas.Tables.merchants.name, name))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return Merchant.from({
      ...row,
      location: row.location || undefined,
      mergedIntoId: row.mergedIntoId || undefined,
    });
  }
}
