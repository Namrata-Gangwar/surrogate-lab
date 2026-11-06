export type Design = { load: number; thickness: number; width: number; hole: number; radius: number };
export const initialDesign: Design = { load: 12, thickness: 14, width: 48, hole: 0.58, radius: 8 };
export const materialYield = 250;
export function estimatePeak(d: Design) {
  const nominal = (d.load * 1000 * 200) / (d.width * d.thickness ** 2 / 6);
  const concentration = 1 + (d.radius < 8 ? (8 - d.radius) * 0.045 : 0) + Math.abs(d.hole - 0.55) * 0.5;
  return Math.max(8, nominal * concentration * 0.10);
}
export function estimateMass(d: Design) {
  return Math.max(0.1, (200 * d.width * d.thickness - Math.PI * d.radius ** 2 * d.thickness) * 7.85e-6 * 1000);
}
export function stressAt(x: number, y: number, z: number, d: Design) {
  const beam = 16 + d.load * 2.2 * (1 - x) * (0.55 + Math.abs(y) * 0.55);
  const holeDistance = Math.hypot(x - d.hole, y * 1.8);
  const concentration = 58 * Math.exp(-holeDistance * 7) * Math.sqrt(d.load / 12) * (8 / d.radius);
  const edge = 18 * Math.abs(z) * (d.width / 48);
  return Math.min(250, beam + concentration + edge);
}
export function colorForStress(value: number): string {
  const stops = [[16, 49, 114], [18, 157, 194], [55, 184, 126], [244, 190, 69], [239, 89, 65]];
  const t = Math.max(0, Math.min(1, value / 250)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(t)); const f = t - i;
  return `rgb(${stops[i].map((c, k) => Math.round(c + (stops[i + 1][k] - c) * f)).join(",")})`;
}
