import { MemberRepository as SharedMemberRepository } from "@shared/repositories";
import { Member } from "@shared/entities";

export class MemberRepository extends SharedMemberRepository {
  override save(_member: Member): Promise<void> {
    // TODO: Implement save method to insert member into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<Member | null> {
    // TODO: Implement findById method to query member by ID from database
    return Promise.reject("Not implemented");
  }

  override findByEmail(_email: string): Promise<Member | null> {
    // TODO: Implement findByEmail method to query member by email from database
    return Promise.reject("Not implemented");
  }

  override findByStatus(_status: string): Promise<Member[]> {
    // TODO: Implement findByStatus method to query members by status from database
    return Promise.reject("Not implemented");
  }
}
