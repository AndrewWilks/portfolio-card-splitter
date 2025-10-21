import { MemberService as SharedMemberService } from "@shared/services";
import { Member } from "@shared/entities";

export class MemberService extends SharedMemberService {
  override listMembers(_query: Record<string, unknown>): Promise<Member[]> {
    // TODO: Implement listMembers method to query and return members based on query
    return Promise.reject(new Error("Not implemented"));
  }

  override createMember(_request: unknown): Promise<Member> {
    // TODO: Implement createMember method to create and save new member
    return Promise.reject(new Error("Not implemented"));
  }

  override updateMember(_id: string, _request: unknown): Promise<Member> {
    // TODO: Implement updateMember method to update existing member
    return Promise.reject(new Error("Not implemented"));
  }
}
