export const toLumberBucksFormat = (value: number): string => {
  return (value ?? 0).toLocaleString('en-US', {
    style    : 'currency',
    currency : 'USD',
    minimumFractionDigits : 0,
  });
};