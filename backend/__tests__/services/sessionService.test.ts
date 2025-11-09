import { assertEquals, assertExists } from '@std/assert';
import { SessionService } from '../../services/sessionService.ts';
import { SessionRepository } from '../../repositories/sessionRepository.ts';
import { UserRepository } from '../../repositories/userRepository.ts';
import { clearAllData } from '../testHelpers.ts';
import { User, UserRole } from '../../../shared/entities/user.ts';

Deno.test({
  name: 'SessionService - create session',
  fn: async () => {
    await clearAllData();
    const userRepo = new UserRepository();
    const sessionRepo = new SessionRepository();
    const sessionService = new SessionService(sessionRepo);
    
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      passwordHash: 'hash',
      role: UserRole.USER,
    });
    const savedUser = await userRepo.save(user);
    
    const session = await sessionService.create(savedUser[0].id);
    
    assertExists(session.id);
    assertEquals(session.userId, savedUser[0].id);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: 'SessionService - validate session',
  fn: async () => {
    await clearAllData();
    const userRepo = new UserRepository();
    const sessionRepo = new SessionRepository();
    const sessionService = new SessionService(sessionRepo);
    
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test2@example.com',
      passwordHash: 'hash',
      role: UserRole.USER,
    });
    const savedUser = await userRepo.save(user);
    
    const session = await sessionService.create(savedUser[0].id, 24);
    assertEquals(sessionService.isValid(session), true);
    
    const expiredSession = await sessionService.create(savedUser[0].id, -1);
    assertEquals(sessionService.isValid(expiredSession), false);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});