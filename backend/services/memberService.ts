import { Member } from "@shared/entities";
import { MemberRepository } from "@backend/repositories";
import { z } from "zod";

// Request schemas
const CreateMemberRequestSchema = z.object({
  displayName: z.string().min(1).max(255),
  userId: z.uuid(),
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

export class MemberService {
  constructor(private memberRepository: MemberRepository) {
    this.memberRepository = memberRepository;
  }

  async listMembers(query: Record<string, unknown>): Promise<Member[]> {
    const validatedQuery = ListMembersQuerySchema.parse(query);

    const allMembers = await this.memberRepository.findAll();
    
    if (validatedQuery.includeArchived) {
      // Return all members
      return allMembers || [];
    } else {
      // Return only active (non-archived) members
      return (allMembers || []).filter((m: Member) => !m.archived);
    }
  }

  async createMember(request: unknown): Promise<Member> {
    const validatedRequest = CreateMemberRequestSchema.parse(request);

    // Check if a member with this display name already exists for this user
    const existingMembers = await this.memberRepository.findByUserId(
      validatedRequest.userId
    );
    const duplicate = existingMembers.find(
      (m: Member) =>
        m.displayName.toLowerCase() ===
        validatedRequest.displayName.toLowerCase()
    );

    if (duplicate) {
      throw new Error(
        `Member with display name '${validatedRequest.displayName}' already exists`
      );
    }

    const member = new Member({
      id: crypto.randomUUID(),
      userId: validatedRequest.userId,
      displayName: validatedRequest.displayName,
      archived: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.memberRepository.save(member);
    return member;
  }

  async updateMember(id: string, request: unknown): Promise<Member> {
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
      const userMembers = await this.memberRepository.findByUserId(
        existing.userId
      );
      const duplicate = userMembers.find(
        (m: Member) =>
          m.id !== id &&
          m.displayName.toLowerCase() ===
            validatedRequest.displayName!.toLowerCase()
      );

      if (duplicate) {
        throw new Error(
          `Member with display name '${validatedRequest.displayName}' already exists`
        );
      }
    }

    const updatedMember = new Member({
      id: existing.id,
      userId: existing.userId,
      displayName: validatedRequest.displayName ?? existing.displayName,
      archived: validatedRequest.archived ?? existing.archived,
      isActive: existing.isActive,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    await this.memberRepository.save(updatedMember);
    return updatedMember;
  }

  // Additional business methods
  async listMembersByUserId(
    userId: string,
    includeArchived = false
  ): Promise<Member[]> {
    const members = await this.memberRepository.findByUserId(userId);
    return includeArchived
      ? members
      : members.filter((m: Member) => !m.archived);
  }
}
