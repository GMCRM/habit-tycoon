// Shared large-number abbreviation, used anywhere a dollar amount needs to
// stay readable at any scale — including Habit Tycoon-tier values, which run
// well past trillions (up to ~$10 octillion for a maxed-out Tycoon Oil
// Company). Short-scale units, each 1000x the last.
const UNITS: { threshold: number; suffix: string }[] = [
  { threshold: 1e27, suffix: 'Oc' }, // octillion
  { threshold: 1e24, suffix: 'Sp' }, // septillion
  { threshold: 1e21, suffix: 'Sx' }, // sextillion
  { threshold: 1e18, suffix: 'Qi' }, // quintillion
  { threshold: 1e15, suffix: 'Qa' }, // quadrillion
  { threshold: 1e12, suffix: 'T' },  // trillion
  { threshold: 1e9, suffix: 'B' },   // billion
  { threshold: 1e6, suffix: 'M' },   // million
  { threshold: 1e3, suffix: 'K' },   // thousand
];

/**
 * Abbreviates a dollar amount for display (e.g. 1500 -> "1.5K", 25000000000
 * -> "25B", 10000000000000000000000000000 -> "10Oc"). Amounts under $1,000
 * are shown exactly, with commas and two decimal places.
 */
export function formatLargeNumber(amount: number): string {
  if (amount < 0) {
    return `-${formatLargeNumber(-amount)}`;
  }
  for (const unit of UNITS) {
    if (amount >= unit.threshold) {
      const value = amount / unit.threshold;
      return value >= 10 ? `${Math.floor(value)}${unit.suffix}` : `${value.toFixed(1)}${unit.suffix}`;
    }
  }
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
