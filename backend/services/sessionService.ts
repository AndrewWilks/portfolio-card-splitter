import { SessionService as SharedSessionService } from "@shared/services";
import { Session } from "@shared/entities";

export class SessionService extends SharedSessionService {
  static override create(_userId: string, _expirationHours = 24): Session {
    // TODO: Implement create method to create new session
    throw new Error("Not implemented");
  }

  static override isValid(_session: Session): boolean {
    // TODO: Implement isValid method to check if session is valid
    throw new Error("Not implemented");
  }

  static override timeUntilExpiry(_session: Session): number {
    // TODO: Implement timeUntilExpiry method to calculate time until expiry
    throw new Error("Not implemented");
  }
}
