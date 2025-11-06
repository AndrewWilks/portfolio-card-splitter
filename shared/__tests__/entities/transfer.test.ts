import { assertEquals, assertThrows } from "@std/assert";
import { Transfer } from "../../entities/transfer.ts";
import type { Cents } from "@shared/types";

Deno.test(
  "Transfer entity - constructor with valid pot-to-pot transfer",
  () => {
    const transfer = new Transfer({
      id: "transfer-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      fromPotId: "pot-1",
      toPotId: "pot-2",
      amountCents: 10000 as Cents,
      occurredOn: new Date(),
      note: "Test transfer",
    });

    assertEquals(transfer.fromPotId, "pot-1");
    assertEquals(transfer.toPotId, "pot-2");
    assertEquals(transfer.amountCents, 10000);
    assertEquals(transfer.isPotTransfer(), true);
    assertEquals(transfer.isCashOut(), false);
    assertEquals(transfer.isCashIn(), false);
  }
);

Deno.test("Transfer entity - constructor with valid cash-out transfer", () => {
  const transfer = new Transfer({
    id: "transfer-123",
    createdAt: new Date(),
    updatedAt: new Date(),
    fromPotId: "pot-1",
    toPotId: null,
    amountCents: 5000 as Cents,
    occurredOn: new Date(),
    note: "Cash withdrawal",
  });

  assertEquals(transfer.fromPotId, "pot-1");
  assertEquals(transfer.toPotId, null);
  assertEquals(transfer.amountCents, 5000);
  assertEquals(transfer.isCashOut(), true);
  assertEquals(transfer.isCashIn(), false);
  assertEquals(transfer.isPotTransfer(), false);
});

Deno.test("Transfer entity - constructor with valid cash-in transfer", () => {
  const transfer = new Transfer({
    id: "transfer-123",
    createdAt: new Date(),
    updatedAt: new Date(),
    fromPotId: null,
    toPotId: "pot-2",
    amountCents: 7500 as Cents,
    occurredOn: new Date(),
    note: "Cash deposit",
  });

  assertEquals(transfer.fromPotId, null);
  assertEquals(transfer.toPotId, "pot-2");
  assertEquals(transfer.amountCents, 7500);
  assertEquals(transfer.isCashIn(), true);
  assertEquals(transfer.isCashOut(), false);
  assertEquals(transfer.isPotTransfer(), false);
});

Deno.test(
  "Transfer entity - constructor throws error when both pot IDs are null",
  () => {
    assertThrows(
      () => {
        new Transfer({
          id: "transfer-123",
          createdAt: new Date(),
          updatedAt: new Date(),
          fromPotId: null,
          toPotId: null,
          amountCents: 1000 as Cents,
          occurredOn: new Date(),
        });
      },
      Error,
      "Transfer must have at least one non-null pot ID"
    );
  }
);

Deno.test(
  "Transfer entity - isCashOut returns true only for cash withdrawals",
  () => {
    const cashOut = new Transfer({
      id: "transfer-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      fromPotId: "pot-1",
      toPotId: null,
      amountCents: 1000 as Cents,
      occurredOn: new Date(),
    });

    const cashIn = new Transfer({
      id: "transfer-2",
      createdAt: new Date(),
      updatedAt: new Date(),
      fromPotId: null,
      toPotId: "pot-1",
      amountCents: 1000 as Cents,
      occurredOn: new Date(),
    });

    const potTransfer = new Transfer({
      id: "transfer-3",
      createdAt: new Date(),
      updatedAt: new Date(),
      fromPotId: "pot-1",
      toPotId: "pot-2",
      amountCents: 1000 as Cents,
      occurredOn: new Date(),
    });

    assertEquals(cashOut.isCashOut(), true);
    assertEquals(cashIn.isCashOut(), false);
    assertEquals(potTransfer.isCashOut(), false);
  }
);

Deno.test(
  "Transfer entity - isCashIn returns true only for cash deposits",
  () => {
    const cashOut = new Transfer({
      id: "transfer-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      fromPotId: "pot-1",
      toPotId: null,
      amountCents: 1000 as Cents,
      occurredOn: new Date(),
    });

    const cashIn = new Transfer({
      id: "transfer-2",
      createdAt: new Date(),
      updatedAt: new Date(),
      fromPotId: null,
      toPotId: "pot-1",
      amountCents: 1000 as Cents,
      occurredOn: new Date(),
    });

    const potTransfer = new Transfer({
      id: "transfer-3",
      createdAt: new Date(),
      updatedAt: new Date(),
      fromPotId: "pot-1",
      toPotId: "pot-2",
      amountCents: 1000 as Cents,
      occurredOn: new Date(),
    });

    assertEquals(cashOut.isCashIn(), false);
    assertEquals(cashIn.isCashIn(), true);
    assertEquals(potTransfer.isCashIn(), false);
  }
);

Deno.test(
  "Transfer entity - isPotTransfer returns true only for pot-to-pot transfers",
  () => {
    const cashOut = new Transfer({
      id: "transfer-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      fromPotId: "pot-1",
      toPotId: null,
      amountCents: 1000 as Cents,
      occurredOn: new Date(),
    });

    const cashIn = new Transfer({
      id: "transfer-2",
      createdAt: new Date(),
      updatedAt: new Date(),
      fromPotId: null,
      toPotId: "pot-1",
      amountCents: 1000 as Cents,
      occurredOn: new Date(),
    });

    const potTransfer = new Transfer({
      id: "transfer-3",
      createdAt: new Date(),
      updatedAt: new Date(),
      fromPotId: "pot-1",
      toPotId: "pot-2",
      amountCents: 1000 as Cents,
      occurredOn: new Date(),
    });

    assertEquals(cashOut.isPotTransfer(), false);
    assertEquals(cashIn.isPotTransfer(), false);
    assertEquals(potTransfer.isPotTransfer(), true);
  }
);
