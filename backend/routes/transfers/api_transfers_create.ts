import { Context } from "hono";
import { TransferService } from "@backend/services";
import { Transfer } from "@shared/entities";
import { z } from "zod";

// Request schema for HTTP API (dates as strings)
const CreateTransferRequestSchema = Transfer.createSchema.extend({
  occurredOn: z.iso.datetime(),
});

export async function apiTransfersCreate(
  c: Context,
  transferService: TransferService
) {
  try {
    const body = await c.req.json();
    const validatedRequest = CreateTransferRequestSchema.parse(body);

    // Transform date string to Date object for service
    const transfer = await transferService.createTransfer({
      ...validatedRequest,
      occurredOn: new Date(validatedRequest.occurredOn),
    });

    return c.json(
      {
        transfer: transfer.toJSON,
        message: "Transfer created successfully",
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: error.issues }, 400);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
