export function isCataloniaPostalCode(cp: string): boolean {
  if (!/^\d{5}$/.test(cp)) return false;

  const prefix = cp.substring(0, 2);

  return ["08", "17", "25", "43"].includes(prefix);
}
