import { MerchantService as SharedMerchantService } from "@shared/services";
import { Merchant, Tag } from "@shared/entities";
import { MerchantRepository } from "../repositories/merchantRepository.ts";
import { TagRepository } from "../repositories/tagRepository.ts";
import { z } from "zod";

// Request schemas
const CreateMerchantRequestSchema = z.object({
  name: z.string().min(1).max(255),
  location: z.string().max(255).optional(),
});

const UpdateMerchantRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  location: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
});

const CreateTagRequestSchema = z.object({
  name: z.string().min(1).max(100),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

const UpdateTagRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateMerchantRequest = z.infer<typeof CreateMerchantRequestSchema>;
export type UpdateMerchantRequest = z.infer<typeof UpdateMerchantRequestSchema>;
export type CreateTagRequest = z.infer<typeof CreateTagRequestSchema>;
export type UpdateTagRequest = z.infer<typeof UpdateTagRequestSchema>;

export class MerchantService extends SharedMerchantService {
  // The constructor is inherited from SharedMerchantService
  // which takes (merchantRepository, tagRepository)

  override listMerchants(_query: Record<string, unknown>): Promise<Merchant[]> {
    // For now, return all merchants. In the future, this could filter by query params
    // TODO: Implement filtering logic based on query parameters
    const merchants: Merchant[] = [];

    // Since we don't have a findAll method in MerchantRepository yet, we'll need to add it
    // For now, return empty array
    return Promise.resolve(merchants);
  }

  override async createMerchant(request: unknown): Promise<Merchant> {
    const validatedRequest = CreateMerchantRequestSchema.parse(request);

    // Check if merchant with this name already exists
    const existing = await this.merchantRepository.findByName(
      validatedRequest.name
    );
    if (existing) {
      throw new Error(
        `Merchant with name "${validatedRequest.name}" already exists`
      );
    }

    const merchant = Merchant.create({
      name: validatedRequest.name,
      location: validatedRequest.location,
      isActive: true,
    });

    await this.merchantRepository.save(merchant);
    return merchant;
  }

  override async updateMerchant(
    id: string,
    request: unknown
  ): Promise<Merchant> {
    const validatedRequest = UpdateMerchantRequestSchema.parse(request);

    // Find existing merchant
    const existing = await this.merchantRepository.findById(id);
    if (!existing) {
      throw new Error(`Merchant with id "${id}" not found`);
    }

    // Check name uniqueness if name is being updated
    if (validatedRequest.name && validatedRequest.name !== existing.name) {
      const nameExists = await this.merchantRepository.findByName(
        validatedRequest.name
      );
      if (nameExists) {
        throw new Error(
          `Merchant with name "${validatedRequest.name}" already exists`
        );
      }
    }

    // Create updated merchant
    const updatedMerchant = Merchant.from({
      ...existing.toJSON(),
      ...validatedRequest,
      updatedAt: new Date(),
    });

    await this.merchantRepository.save(updatedMerchant);
    return updatedMerchant;
  }

  override async listTags(): Promise<Tag[]> {
    return await this.tagRepository.findAll();
  }

  override async createTag(request: unknown): Promise<Tag> {
    const validatedRequest = CreateTagRequestSchema.parse(request);

    // Check if tag with this name already exists
    const existing = await this.tagRepository.findByName(validatedRequest.name);
    if (existing) {
      throw new Error(
        `Tag with name "${validatedRequest.name}" already exists`
      );
    }

    const tag = Tag.create({
      name: validatedRequest.name,
      color: validatedRequest.color,
      isActive: true,
    });

    await this.tagRepository.save(tag);
    return tag;
  }

  override async updateTag(id: string, request: unknown): Promise<Tag> {
    const validatedRequest = UpdateTagRequestSchema.parse(request);

    // Find existing tag
    const existing = await this.tagRepository.findById(id);
    if (!existing) {
      throw new Error(`Tag with id "${id}" not found`);
    }

    // Check name uniqueness if name is being updated
    if (validatedRequest.name && validatedRequest.name !== existing.name) {
      const nameExists = await this.tagRepository.findByName(
        validatedRequest.name
      );
      if (nameExists) {
        throw new Error(
          `Tag with name "${validatedRequest.name}" already exists`
        );
      }
    }

    // Create updated tag
    const updatedTag = Tag.from({
      ...existing.toJSON(),
      ...validatedRequest,
      updatedAt: new Date(),
    });

    await this.tagRepository.save(updatedTag);
    return updatedTag;
  }
}
