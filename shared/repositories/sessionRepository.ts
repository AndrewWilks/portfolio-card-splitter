import { Session } from "../entities/session.ts";

export interface I_SessionRepository {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  delete(id: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export class SessionRepository implements I_SessionRepository {
  save(_session: Session): Promise<void> {
    return Promise.reject("Not implemented");
  }
  findById(_id: string): Promise<Session | null> {
    return Promise.reject("Not implemented");
  }
  delete(_id: string): Promise<void> {
    return Promise.reject("Not implemented");
  }
  deleteExpired(): Promise<void> {
    return Promise.reject("Not implemented");
  }
}
