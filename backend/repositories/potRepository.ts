import { PotRepository as SharedPotRepository } from "@shared/repositories";
import { Pot } from "@shared/entities";
import { db, Schemas } from "@db";
import { eq } from "drizzle-orm";

export class PotRepository extends SharedPotRepository {
  constructor(private dbClient = db) {
    super();
  }

  override async save(pot: Pot): Promise<void> {
    const data = pot.toJSON();
    await this.dbClient
      .insert(Schemas.Tables.pots)
      .values({
        id: data.id,
        name: data.name,
        description: data.description,
        type: data.type,
        location: data.location,
        ownerId: data.ownerId,
        balanceCents: data.balanceCents,
        isActive: data.isActive,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .onConflictDoUpdate({
        target: Schemas.Tables.pots.id,
        set: {
          name: data.name,
          description: data.description,
          type: data.type,
          location: data.location,
          ownerId: data.ownerId,
          balanceCents: data.balanceCents,
          isActive: data.isActive,
          updatedAt: data.updatedAt,
        },
      });
  }

  override async findById(id: string): Promise<Pot | null> {
    const result = await this.dbClient
      .select()
      .from(Schemas.Tables.pots)
      .where(eq(Schemas.Tables.pots.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return Pot.from({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      type: row.type,
      location: row.location ?? undefined,
      ownerId: row.ownerId,
      balanceCents: row.balanceCents,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  override async findByOwner(ownerId: string): Promise<Pot[]> {
    const results = await this.dbClient
      .select()
      .from(Schemas.Tables.pots)
      .where(eq(Schemas.Tables.pots.ownerId, ownerId));

    return results.map((row) =>
      Pot.from({
        id: row.id,
        name: row.name,
        description: row.description ?? undefined,
        type: row.type,
        location: row.location ?? undefined,
        ownerId: row.ownerId,
        balanceCents: row.balanceCents,
        isActive: row.isActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    );
  }

  override async updateBalance(id: string, amount: number): Promise<void> {
    await this.dbClient
      .update(Schemas.Tables.pots)
      .set({
        balanceCents: amount,
        updatedAt: new Date(),
      })
      .where(eq(Schemas.Tables.pots.id, id));
  }

  override async findAvailableBalances(): Promise<Record<string, number>> {
    const results = await this.dbClient
      .select({
        id: Schemas.Tables.pots.id,
        balanceCents: Schemas.Tables.pots.balanceCents,
      })
      .from(Schemas.Tables.pots)
      .where(eq(Schemas.Tables.pots.isActive, true));

    const balances: Record<string, number> = {};
    for (const row of results) {
      balances[row.id] = row.balanceCents;
    }
    return balances;
  }
}
