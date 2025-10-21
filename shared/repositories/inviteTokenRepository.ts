import { InviteToken } from "../entities/inviteToken.ts";

interface I_InviteTokenRepository {
  save(token: InviteToken): Promise<void>;
  findById(id: string): Promise<InviteToken | null>;
  findByEmail(email: string): Promise<InviteToken[]>;
  delete(id: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export class InviteTokenRepository implements I_InviteTokenRepository {
  save(_token: InviteToken): Promise<void> {
    return Promise.reject("Not implemented");
  }
  findById(_id: string): Promise<InviteToken | null> {
    return Promise.reject("Not implemented");
  }
  findByEmail(_email: string): Promise<InviteToken[]> {
    return Promise.reject("Not implemented");
  }
  delete(_id: string): Promise<void> {
    return Promise.reject("Not implemented");
  }
  deleteExpired(): Promise<void> {
    return Promise.reject("Not implemented");
  }
}
