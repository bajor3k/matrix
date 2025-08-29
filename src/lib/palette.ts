
export const BABY_BLUE_PALETTE = [
  '#98CEF3',
  '#B9E0FF',
  '#D0E6FB',
  '#E6D6FD',
  '#E4C5FB',
  '#D2ACFB',
];

export const kpiColor = () => BABY_BLUE_PALETTE[0];

/* Useful helpers */
export function cycleColors<T = string>(n: number, palette = BABY_BLUE_PALETTE): T[] {
  const colors = [];
  for (let i = 0; i < n; i++) colors.push(palette[i % palette.length] as any);
  return colors;
}
