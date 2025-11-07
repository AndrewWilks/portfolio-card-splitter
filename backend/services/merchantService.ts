import { Merchant, Tag } from "@shared/entities";
import { MerchantRepository, TagRepository } from "@backend/repositories";
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

export class MerchantService {
  constructor(
    private merchantRepository: MerchantRepository,
    private tagRepository: TagRepository
  ) {}

  async listMerchants(_query: Record<string, unknown>): Promise<Merchant[]> {
    // For now, return all merchants. In the future, this could filter by query params
    // TODO: Implement filtering logic based on query parameters
    const merchants = await this.merchantRepository.findAll();
    return merchants || [];
  }

  async createMerchant(request: unknown): Promise<Merchant> {
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

    const merchant = new Merchant({
      name: validatedRequest.name,
      location: validatedRequest.location,
      isActive: true,
    });

    const saved = await this.merchantRepository.save(merchant);
    return saved[0] as Merchant;
  }

  async updateMerchant(id: string, request: unknown): Promise<Merchant> {
    const validatedRequest = UpdateMerchantRequestSchema.parse(request);

    // Find existing merchant
    const existing = await this.merchantRepository.findById(id);
    if (!existing) {
      throw new Error(`Merchant with id "${id}" not found`);
    }

    // Check name uniqueness if name is being updated
    const existingData = existing.toJSON;
    if (validatedRequest.name && validatedRequest.name !== existingData.name) {
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
    const updatedMerchant = new Merchant({
      ...existingData,
      ...validatedRequest,
      updatedAt: new Date(),
    });

    const saved = await this.merchantRepository.save(updatedMerchant);
    return saved[0] as Merchant;
  }

  async listTags(): Promise<Tag[]> {
    const tags = await this.tagRepository.findAll();
    return tags || [];
  }

  async createTag(request: unknown): Promise<Tag> {
    const validatedRequest = CreateTagRequestSchema.parse(request);

    // Check if tag with this name already exists
    const existing = await this.tagRepository.findByName(validatedRequest.name);
    if (existing) {
      throw new Error(
        `Tag with name "${validatedRequest.name}" already exists`
      );
    }

    const tag = new Tag({
      name: validatedRequest.name,
      color: (validatedRequest.color ||
        "#000000") as import("@shared/types").HexColor,
      isActive: true,
    });

    const saved = await this.tagRepository.save(tag);
    return saved[0] as Tag;
  }

  async updateTag(id: string, request: unknown): Promise<Tag> {
    const validatedRequest = UpdateTagRequestSchema.parse(request);

    // Find existing tag
    const existing = await this.tagRepository.findById(id);
    if (!existing) {
      throw new Error(`Tag with id "${id}" not found`);
    }

    // Check name uniqueness if name is being updated
    const existingData = existing.toJSON;
    if (validatedRequest.name && validatedRequest.name !== existingData.name) {
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
    const updatedTag = new Tag({
      ...existingData,
      name: validatedRequest.name ?? existingData.name,
      color: (validatedRequest.color ??
        existingData.color) as import("@shared/types").HexColor,
      isActive: validatedRequest.isActive ?? existingData.isActive,
      updatedAt: new Date(),
    });

    const saved = await this.tagRepository.save(updatedTag);
    return saved[0] as Tag;
  }
}
