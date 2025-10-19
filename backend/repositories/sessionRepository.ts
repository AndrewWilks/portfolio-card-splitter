import { SessionRepository as SharedSessionRepository } from "@shared/repositories";
import { Session } from "@shared/entities";

export class SessionRepository extends SharedSessionRepository {
  override save(_session: Session): Promise<void> {
    // TODO: Implement save method to insert session into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<Session | null> {
    // TODO: Implement findById method to query session by ID from database
    return Promise.reject("Not implemented");
  }

  override delete(_id: string): Promise<void> {
    // TODO: Implement delete method to remove session from database
    return Promise.reject("Not implemented");
  }

  override deleteExpired(): Promise<void> {
    // TODO: Implement deleteExpired method to remove expired sessions from database
    return Promise.reject("Not implemented");
  }
}
