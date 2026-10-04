// Pure physics for the optics lab — New Cartesian sign convention (the one
// used in NCERT/CBSE Class 10 textbooks). No React, no DOM: safe to unit
// test and safe to copy as-is into the main student app's lib folder.
//
// Convention: light travels left -> right. Object is always real, placed to
// the left, so its distance u is entered by the caller as a positive
// magnitude and converted internally to a negative number.
// f is positive for convex lens & convex mirror, negative for concave lens
// & concave mirror (this differs from the naive "converging = positive"
// shortcut — a convex MIRROR is diverging but still gets +f in this
// convention because its focus is measured on the same side rule as v).

export type OpticsDevice = 'convex_lens' | 'concave_lens' | 'concave_mirror' | 'convex_mirror';

export interface OpticsResult {
  v: number;            // signed image distance; +/-Infinity when atInfinity
  m: number;             // signed magnification
  atInfinity: boolean;
  isVirtual: boolean;
  erect: boolean;
  imageHeight: number;   // signed
}

export function isMirror(device: OpticsDevice): boolean {
  return device === 'concave_mirror' || device === 'convex_mirror';
}

function signedFocalLength(device: OpticsDevice, focalLength: number): number {
  switch (device) {
    case 'convex_lens': return focalLength;
    case 'concave_lens': return -focalLength;
    case 'concave_mirror': return -focalLength;
    case 'convex_mirror': return focalLength;
  }
}

/**
 * @param u positive distance of the object from the pole/centre (what the student dragged to)
 * @param objectHeight positive magnitude
 */
export function computeOptics(
  device: OpticsDevice,
  focalLength: number,
  u: number,
  objectHeight: number
): OpticsResult {
  const f = signedFocalLength(device, focalLength);
  const mirror = isMirror(device);
  const uSigned = -Math.abs(u); // real object always on the incoming side

  // Mirror: 1/v = 1/f - 1/u   |   Lens: 1/v = 1/f + 1/u
  const invV = mirror ? 1 / f - 1 / uSigned : 1 / f + 1 / uSigned;

  if (Math.abs(invV) < 1e-9) {
    return { v: Infinity, m: Infinity, atInfinity: true, isVirtual: false, erect: false, imageHeight: Infinity };
  }

  const v = 1 / invV;
  const m = mirror ? -v / uSigned : v / uSigned;
  const imageHeight = m * objectHeight;

  // Mirror: real image forms in front (same side as object) -> v negative.
  // Lens: real image forms on the far side (opposite the object) -> v positive.
  const isVirtual = mirror ? v > 0 : v < 0;

  return { v, m, atInfinity: false, isVirtual, erect: m > 0, imageHeight };
}

export type Goal = 'big_real' | 'small_real' | 'virtual_big' | 'vanish';

export function classifyForMission(result: OpticsResult): Goal {
  if (result.atInfinity) return 'vanish';
  if (result.isVirtual) return 'virtual_big';
  return Math.abs(result.m) >= 1 ? 'big_real' : 'small_real';
}
