import { BRAND, number, string } from "zod";

export type Cents = number & BRAND<"Cents">;
export const zCents = number().brand<"Cents">();

export type basisPoints = number & BRAND<"basisPoints">;
export const zBasisPoints = number().brand<"basisPoints">().min(0).max(10000);

export type HexColor = string & BRAND<"HexColor">;
export const zHexColor = string()
  .brand<"HexColor">()
  .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/);
