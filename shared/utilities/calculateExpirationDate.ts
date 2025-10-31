export function calculateExpirationDate(hoursFromNow: number): Date {
  const now = new Date();
  return new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
}
