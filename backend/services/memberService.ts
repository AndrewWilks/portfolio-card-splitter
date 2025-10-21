import { MemberService as SharedMemberService } from "@shared/services";
import { Member } from "@shared/entities";
import { MemberRepository } from "../repositories/memberRepository.ts";
import { z } from "zod";

// Request schemas
const CreateMemberRequestSchema = z.object({
  displayName: z.string().min(1).max(255),
  userId: z.string().uuid(),
});

const UpdateMemberRequestSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  archived: z.boolean().optional(),
});

const ListMembersQuerySchema = z.object({
  includeArchived: z.coerce.boolean().default(false),
});

export type CreateMemberRequest = z.infer<typeof CreateMemberRequestSchema>;
export type UpdateMemberRequest = z.infer<typeof UpdateMemberRequestSchema>;
export type ListMembersQuery = z.infer<typeof ListMembersQuerySchema>;

export class MemberService extends SharedMemberService {
  constructor(memberRepository: MemberRepository) {
    super(memberRepository);
  }

  override async listMembers(
    query: Record<string, unknown>,
  ): Promise<Member[]> {
    const validatedQuery = ListMembersQuerySchema.parse(query);

    if (validatedQuery.includeArchived) {
      // Return all members
      return await (this.memberRepository as MemberRepository).findAll();
    } else {
      // Return only active (non-archived) members
      return await this.memberRepository.findByStatus("active");
    }
  }

  override async createMember(request: unknown): Promise<Member> {
    const validatedRequest = CreateMemberRequestSchema.parse(request);

    // Check if a member with this display name already exists for this user
    const existingMembers = await (
      this.memberRepository as MemberRepository
    ).findByUserId(validatedRequest.userId);
    const duplicate = existingMembers.find(
      (m: Member) =>
        m.displayName.toLowerCase() ===
          validatedRequest.displayName.toLowerCase(),
    );

    if (duplicate) {
      throw new Error(
        `Member with display name '${validatedRequest.displayName}' already exists`,
      );
    }

    const member = Member.create({
      userId: validatedRequest.userId,
      displayName: validatedRequest.displayName,
      archived: false,
    });

    await this.memberRepository.save(member);
    return member;
  }

  override async updateMember(id: string, request: unknown): Promise<Member> {
    const validatedRequest = UpdateMemberRequestSchema.parse(request);

    const existing = await this.memberRepository.findById(id);
    if (!existing) {
      throw new Error(`Member with id '${id}' not found`);
    }

    // If archiving, check if member has active allocations (TODO: implement this check)
    if (validatedRequest.archived === true) {
      // TODO: Check for active allocations before allowing archive
      // For now, allow archiving
    }

    // If updating display name, check for duplicates within the same user
    if (validatedRequest.displayName) {
      const userMembers = await (
        this.memberRepository as MemberRepository
      ).findByUserId(existing.userId);
      const duplicate = userMembers.find(
        (m: Member) =>
          m.id !== id &&
          m.displayName.toLowerCase() ===
            validatedRequest.displayName!.toLowerCase(),
      );

      if (duplicate) {
        throw new Error(
          `Member with display name '${validatedRequest.displayName}' already exists`,
        );
      }
    }

    const updatedMember = Member.create({
      userId: existing.userId,
      displayName: validatedRequest.displayName ?? existing.displayName,
      archived: validatedRequest.archived ?? existing.archived,
    });

    // Preserve the original ID and creation date
    const memberWithId = Member.from({
      ...updatedMember.toJSON(),
      id: existing.id,
      createdAt: existing.createdAt,
    });

    await this.memberRepository.save(memberWithId);
    return memberWithId;
  }

  // Additional business methods
  async listMembersByUserId(
    userId: string,
    includeArchived = false,
  ): Promise<Member[]> {
    const members = await (
      this.memberRepository as MemberRepository
    ).findByUserId(userId);
    return includeArchived
      ? members
      : members.filter((m: Member) => !m.archived);
  }
}
