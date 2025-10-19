import { Member } from "@shared/entities";

interface I_MemberRepository {
  save(member: Member): Promise<void>;
  findById(id: string): Promise<Member | null>;
  findByEmail(email: string): Promise<Member | null>;
  findByStatus(status: string): Promise<Member[]>;
}

export class MemberRepository implements I_MemberRepository {
  save(_member: Member): Promise<void> {
    return Promise.reject("Not implemented");
  }
  findById(_id: string): Promise<Member | null> {
    return Promise.reject("Not implemented");
  }
  findByEmail(_email: string): Promise<Member | null> {
    return Promise.reject("Not implemented");
  }
  findByStatus(_status: string): Promise<Member[]> {
    return Promise.reject("Not implemented");
  }
}
