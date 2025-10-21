import { Context } from "hono";
import { TransferService } from "@backend/services";

export function apiTransfersCreate(
  _c: Context,
  _transferService: TransferService
) {
  // TODO: Implement POST /api/transfers endpoint to create a transfer
  // - Validate request body with CreateTransferSchema
  // - Create transfer using TransferService
  // - Return transfer response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
