export const normalizeFilter = <T extends string>(
  value: T | null,
): T | undefined => {
  if (!value || value === "_") {
    return undefined;
  }

  return value;
};