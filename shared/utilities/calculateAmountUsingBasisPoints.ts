import { Cents, basisPoints, zBasisPoints } from "@shared/types";

export function calculateAmountUsingBasisPoints(
  basisPoints: basisPoints,
  amountCents: Cents
): Cents {
  const parsed = zBasisPoints.parse(basisPoints);
  const basisPointsDecimal = parsed / 10000;
  return Math.round(amountCents * basisPointsDecimal) as Cents;
}
