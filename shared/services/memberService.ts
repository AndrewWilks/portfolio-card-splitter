import { MemberRepository } from "../repositories/index.ts";
import { Member } from "../entities/index.ts";

export class MemberService {
  constructor(private memberRepository: MemberRepository) {}

  listMembers(_query: Record<string, unknown>): Promise<Member[]> {
    throw new Error("Not implemented");
  }

  createMember(_request: unknown): Promise<Member> {
    throw new Error("Not implemented");
  }

  updateMember(_id: string, _request: unknown): Promise<Member> {
    throw new Error("Not implemented");
  }
}
