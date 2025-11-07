import { assert, assertEquals, assertRejects } from "@std/assert";
import { PotService } from "@backend/services";
import { PotRepository, ReservationRepository } from "@backend/repositories";
import { Pot, PotScope, PotType, PotVisibility } from "@shared/entities";
import { Cents } from "@shared/types";
import { withTestDB } from "../testHelpers.ts";

Deno.test({
  name: "PotService - ACL - allows owner to see and manage their SOLO pot",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const potRepository = new PotRepository();
      const reservationRepository = new ReservationRepository();
      const potService = new PotService(potRepository, reservationRepository);

      const ownerId = "550e8400-e29b-41d4-a716-446655440001";

      // Create a SOLO pot
      const soloPot = await potService.createPot({
        name: "My Solo Savings",
        balanceCents: 10000,
        scope: PotScope.SOLO,
        ownerId,
        accountType: PotType.SAVINGS,
      });

      // Owner can list and see their pot
      const pots = await potService.listPots(ownerId);
      assertEquals(pots.length, 1);
      assertEquals(pots[0].name, "My Solo Savings");

      // Owner can get pot directly
      const pot = await potService.getPot(soloPot.id, ownerId);
      assertEquals(pot.id, soloPot.id);

      // Owner can update pot
      const updated = await potService.updatePot(
        soloPot.id,
        { name: "Updated Solo Pot" },
        ownerId
      );
      assertEquals(updated.name, "Updated Solo Pot");

      // Owner can deposit
      await potService.deposit(soloPot.id, 5000, ownerId);
      const afterDeposit = await potService.getPot(soloPot.id, ownerId);
      assertEquals(afterDeposit.balanceCents, 15000);
    });
  },
});

Deno.test({
  name: "PotService - ACL - prevents non-owners from accessing SOLO pots",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const potRepository = new PotRepository();
      const reservationRepository = new ReservationRepository();
      const potService = new PotService(potRepository, reservationRepository);

      const ownerId = "550e8400-e29b-41d4-a716-446655440001";
      const otherUserId = "550e8400-e29b-41d4-a716-446655440002";

      // Create a SOLO pot
      const soloPot = await potService.createPot({
        name: "Private Savings",
        balanceCents: 10000,
        scope: PotScope.SOLO,
        ownerId,
        accountType: PotType.SAVINGS,
      });

      // Non-owner cannot list pot
      const pots = await potService.listPots(otherUserId);
      assertEquals(pots.length, 0, "Non-owner should not see SOLO pot");

      // Non-owner cannot get pot
      await assertRejects(
        async () => await potService.getPot(soloPot.id, otherUserId),
        Error,
        "does not have access"
      );

      // Non-owner cannot update pot
      await assertRejects(
        async () =>
          await potService.updatePot(
            soloPot.id,
            { name: "Hacked" },
            otherUserId
          ),
        Error,
        "does not have MANAGE access"
      );

      // Non-owner cannot deposit
      await assertRejects(
        async () => await potService.deposit(soloPot.id, 1000, otherUserId),
        Error,
        "does not have MANAGE access"
      );
    });
  },
});

Deno.test({
  name: "PotService - ACL - enforces READ-only access on SHARED pots",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const potRepository = new PotRepository();
      const reservationRepository = new ReservationRepository();
      const potService = new PotService(potRepository, reservationRepository);

      const ownerId = "550e8400-e29b-41d4-a716-446655440001";
      const readUserId = "550e8400-e29b-41d4-a716-446655440004";

      // Create a SHARED pot with ACLs
      const visibilityAcls: Record<string, PotVisibility> = {
        [readUserId]: PotVisibility.READ,
      };

      const pot = Pot.parse({
        name: "Shared Vacation Fund",
        balanceCents: 50000,
        scope: PotScope.SHARED,
        ownerId,
        accountType: PotType.SAVINGS,
        visibilityAcls,
      });

      const [savedPot] = await potRepository.save(pot);

      // User with READ access can list and view
      const pots = await potService.listPots(readUserId);
      assertEquals(pots.length, 1);

      const retrieved = await potService.getPot(savedPot.id, readUserId);
      assertEquals(retrieved.name, "Shared Vacation Fund");

      // User with READ access CANNOT update
      await assertRejects(
        async () =>
          await potService.updatePot(
            savedPot.id,
            { name: "Hacked Fund" },
            readUserId
          ),
        Error,
        "does not have MANAGE access"
      );

      // User with READ access CANNOT deposit
      await assertRejects(
        async () => await potService.deposit(savedPot.id, 1000, readUserId),
        Error,
        "does not have MANAGE access"
      );
    });
  },
});

Deno.test({
  name: "PotService - ACL - enforces MANAGE access on SHARED pots",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const potRepository = new PotRepository();
      const reservationRepository = new ReservationRepository();
      const potService = new PotService(potRepository, reservationRepository);

      const ownerId = "550e8400-e29b-41d4-a716-446655440001";
      const manageUserId = "550e8400-e29b-41d4-a716-446655440003";

      // Create a SHARED pot with ACLs
      const visibilityAcls: Record<string, PotVisibility> = {
        [manageUserId]: PotVisibility.MANAGE,
      };

      const pot = Pot.parse({
        name: "Shared Emergency Fund",
        balanceCents: 20000,
        scope: PotScope.SHARED,
        ownerId,
        accountType: PotType.CASH,
        visibilityAcls,
      });

      const [savedPot] = await potRepository.save(pot);

      // User with MANAGE access can list and view
      const pots = await potService.listPots(manageUserId);
      assertEquals(pots.length, 1);

      // User with MANAGE access CAN update
      const updated = await potService.updatePot(
        savedPot.id,
        { name: "Updated Emergency Fund" },
        manageUserId
      );
      assertEquals(updated.name, "Updated Emergency Fund");

      // User with MANAGE access CAN deposit
      await potService.deposit(savedPot.id, 5000, manageUserId);
      const afterDeposit = await potService.getPot(savedPot.id, manageUserId);
      assertEquals(afterDeposit.balanceCents, 25000);
    });
  },
});

Deno.test({
  name: "PotService - ACL - prevents users without ACL entries from accessing SHARED pots",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const potRepository = new PotRepository();
      const reservationRepository = new ReservationRepository();
      const potService = new PotService(potRepository, reservationRepository);

      const ownerId = "550e8400-e29b-41d4-a716-446655440001";
      const otherUserId = "550e8400-e29b-41d4-a716-446655440002";
      const manageUserId = "550e8400-e29b-41d4-a716-446655440003";

      // Create a SHARED pot with ACLs (but not including otherUserId)
      const visibilityAcls: Record<string, PotVisibility> = {
        [manageUserId]: PotVisibility.MANAGE,
      };

      const pot = Pot.parse({
        name: "Exclusive Fund",
        balanceCents: 30000,
        scope: PotScope.SHARED,
        ownerId,
        accountType: PotType.SAVINGS,
        visibilityAcls,
      });

      const [savedPot] = await potRepository.save(pot);

      // User not in ACL cannot list pot
      const pots = await potService.listPots(otherUserId);
      assertEquals(pots.length, 0, "User without ACL entry should not see pot");

      // User not in ACL cannot get pot
      await assertRejects(
        async () => await potService.getPot(savedPot.id, otherUserId),
        Error,
        "does not have access"
      );

      // User not in ACL cannot update pot
      await assertRejects(
        async () =>
          await potService.updatePot(
            savedPot.id,
            { name: "Unauthorized" },
            otherUserId
          ),
        Error,
        "does not have MANAGE access"
      );

      // User not in ACL cannot deposit
      await assertRejects(
        async () => await potService.deposit(savedPot.id, 1000, otherUserId),
        Error,
        "does not have MANAGE access"
      );
    });
  },
});

Deno.test({
  name: "PotService - enriches pots with derived values (reserved/available)",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const potRepository = new PotRepository();
      const reservationRepository = new ReservationRepository();
      const potService = new PotService(potRepository, reservationRepository);

      const ownerId = "550e8400-e29b-41d4-a716-446655440001";

      // This test verifies that the service correctly calculates and includes
      // derived values (reservedCents, availableCents) when returning pots.
      // These values are NOT persisted in the database but calculated from reservations.

      const pot = await potService.createPot({
        name: "Fund with Reservations",
        balanceCents: 10000,
        scope: PotScope.SOLO,
        ownerId,
        accountType: PotType.SAVINGS,
      });

      // Initially, no reservations
      const initialPot = await potService.getPot(pot.id, ownerId);
      assertEquals(initialPot.reservedCents, 0 as Cents);
      assertEquals(initialPot.availableCents, 10000 as Cents);

      // Verify toJSON includes derived values
      const json = initialPot.toJSON;
      assert("reservedCents" in json, "toJSON should include reservedCents");
      assert("availableCents" in json, "toJSON should include availableCents");
      assertEquals(json.reservedCents, 0);
      assertEquals(json.availableCents, 10000);
    });
  },
});

Deno.test({
  name: "PotService - validates deposit amount is positive",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const potRepository = new PotRepository();
      const reservationRepository = new ReservationRepository();
      const potService = new PotService(potRepository, reservationRepository);

      const ownerId = "550e8400-e29b-41d4-a716-446655440001";

      const pot = await potService.createPot({
        name: "Test Pot",
        balanceCents: 5000,
        scope: PotScope.SOLO,
        ownerId,
        accountType: PotType.CASH,
      });

      // Negative deposit should fail
      await assertRejects(
        async () => await potService.deposit(pot.id, -1000, ownerId),
        Error,
        "must be positive"
      );

      // Zero deposit should fail
      await assertRejects(
        async () => await potService.deposit(pot.id, 0, ownerId),
        Error,
        "must be positive"
      );
    });
  },
});
