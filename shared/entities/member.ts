import { z } from "zod";

// For members table. Links to users, handles display names and archiving.
export const MemberSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  displayName: z.string().min(1).max(255),
  archived: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MemberData = z.infer<typeof MemberSchema>;

export class Member {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly displayName: string,
    public readonly archived: boolean = false,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(
    data: Omit<MemberData, "id" | "createdAt" | "updatedAt">,
  ): Member {
    const validated = MemberSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }).parse(data);

    return new Member(
      crypto.randomUUID(),
      validated.userId,
      validated.displayName,
      validated.archived,
      new Date(),
      new Date(),
    );
  }

  static from(data: MemberData): Member {
    const validated = MemberSchema.parse(data);
    return new Member(
      validated.id,
      validated.userId,
      validated.displayName,
      validated.archived,
      validated.createdAt,
      validated.updatedAt,
    );
  }

  toJSON(): MemberData {
    return {
      id: this.id,
      userId: this.userId,
      displayName: this.displayName,
      archived: this.archived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
