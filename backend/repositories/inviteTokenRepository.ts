import { InviteTokenRepository as SharedInviteTokenRepository } from "@shared/repositories";
import { InviteToken } from "@shared/entities";

export class InviteTokenRepository extends SharedInviteTokenRepository {
  override save(_token: InviteToken): Promise<void> {
    // TODO: Implement save method to insert invite token into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<InviteToken | null> {
    // TODO: Implement findById method to query invite token by ID from database
    return Promise.reject("Not implemented");
  }

  override findByEmail(_email: string): Promise<InviteToken[]> {
    // TODO: Implement findByEmail method to query invite tokens by email from database
    return Promise.reject("Not implemented");
  }

  override delete(_id: string): Promise<void> {
    // TODO: Implement delete method to remove invite token from database
    return Promise.reject("Not implemented");
  }

  override deleteExpired(): Promise<void> {
    // TODO: Implement deleteExpired method to remove expired invite tokens from database
    return Promise.reject("Not implemented");
  }
}
