// Save, Delete, FindByID, FindAll
import { db } from "@db";

import { entities } from "@shared/entities-map";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";
import {
  entityTableMap,
  hardDeleteEntities,
  softDeleteEntities,
} from "./entityTableMap.ts";

import { eq } from "drizzle-orm";

type TKeysOfRepository = keyof typeof entities;
type TSchemaKeys = keyof typeof Tables;

export class Repository<T extends TKeysOfRepository> {
  protected schemaType: TSchemaKeys;

  constructor(private entityType: T, public dbClient = db) {
    this.dbClient = dbClient;
    this.schemaType = entityTableMap[entityType];
  }

  // ==== Search Methods ====

  async findById(
    _id: string
  ): Promise<InstanceType<(typeof entities)[T]> | null> {
    const found = await this.dbClient
      .select()
      // deno-lint-ignore no-explicit-any
      .from(Tables[this.schemaType] as any)
      .where(eq(Tables[this.schemaType].id, _id));

    if (found.length === 0) {
      return null;
    }

    if (found.length > 1) {
      throw new Error(`Multiple ${this.entityType} found with id: ${_id}`);
    }

    // Convert DB row (snake_case) to entity data (camelCase)
    const camelCaseData = objectKeysToCamel(
      found[0] as Record<string, unknown>
    );

    // deno-lint-ignore no-explicit-any
    return new entities[this.entityType](camelCaseData as any) as InstanceType<
      (typeof entities)[T]
    >;
  }

  async findAll(): Promise<InstanceType<(typeof entities)[T]>[] | null> {
    const found = await this.dbClient
      .select()
      // deno-lint-ignore no-explicit-any
      .from(Tables[this.schemaType] as any)
      .orderBy(Tables[this.schemaType].createdAt);

    if (found.length === 0) {
      return null;
    }

    return found.map((row) => {
      // Convert DB row (snake_case) to entity data (camelCase)
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);

      return new entities[this.entityType](
        // deno-lint-ignore no-explicit-any
        camelCaseData as any
      ) as InstanceType<(typeof entities)[T]>;
    });
  }

  // ==== Save Method ====

  protected async update(_entity: InstanceType<(typeof entities)[T]>) {
    _entity.updatedAt = new Date();
    return (
      (await this.dbClient
        // deno-lint-ignore no-explicit-any
        .update(Tables[this.schemaType] as any)
        .set(_entity.toJSON)
        .where(eq(Tables[this.schemaType].id, _entity.id))
        .returning()) as InstanceType<(typeof entities)[T]>[]
    );
  }

  protected async insert(_entity: InstanceType<(typeof entities)[T]>) {
    // Use toJSON to get plain object with correct fields
    const insertData = _entity.toJSON;

    return (
      (await this.dbClient
        // deno-lint-ignore no-explicit-any
        .insert(Tables[this.schemaType] as any)
        .values(insertData)
        .returning()) as InstanceType<(typeof entities)[T]>[]
    );
  }

  async save(
    _entity: InstanceType<(typeof entities)[T]>
  ): Promise<InstanceType<(typeof entities)[T]>[]> {
    const hasEntity = await this.findById(_entity.id);
    if (hasEntity !== null) {
      return await this.update(_entity);
    }
    return await this.insert(_entity);
  }

  // ==== Delete Method ====
  protected async deleteHard(
    _id: string
  ): Promise<InstanceType<(typeof entities)[T]>[]> {
    return (
      (await this.dbClient
        // deno-lint-ignore no-explicit-any
        .delete(Tables[this.schemaType] as any)
        .where(eq(Tables[this.schemaType].id, _id))
        .returning()) as InstanceType<(typeof entities)[T]>[]
    );
  }

  async delete(_id: string): Promise<InstanceType<(typeof entities)[T]>[]> {
    const hasEntity = await this.findById(_id);

    if (hasEntity === null) {
      throw new Error(
        `Cannot delete ${this.entityType} with id ${_id} as it does not exist`
      );
    }

    // Check if this entity supports soft delete
    if (softDeleteEntities.has(this.entityType)) {
      // Soft delete: toggle isActive
      // deno-lint-ignore no-explicit-any
      const entityWithIsActive = hasEntity as any;

      if (entityWithIsActive.isActive === false) {
        throw new Error(
          `${this.entityType} with id ${_id} is already inactive`
        );
      }

      entityWithIsActive.toggleActive();
      return await this.update(hasEntity);
    }

    if (hardDeleteEntities.has(this.entityType)) {
      // Hard delete: permanently remove from database
      return await this.deleteHard(_id);
    }

    throw new Error(
      `Delete strategy not defined for entity type: ${this.entityType}`
    );
  }
}
