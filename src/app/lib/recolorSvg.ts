// Recolors a garment's flat-fill SVG paths to a target color while keeping
// each path's own lightness — so the fold/shadow shading pattern already
// baked into the garment survives, only the hue/saturation changes. A CSS
// hue-rotate filter can't do this correctly: a near-grayscale base color
// (e.g. grey pants) has almost no hue to rotate, so it barely changes.

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

// Replaces every fill="rgb(...)" and stroke="rgb(...)" in the SVG source
// with a version that keeps that path's original lightness but takes the
// hue and saturation from targetHex.
export function recolorSvg(svgInner: string, targetHex: string): string {
  const [tr, tg, tb] = hexToRgb(targetHex);
  const [targetH, targetS] = rgbToHsl(tr, tg, tb);

  return svgInner.replace(/(fill|stroke)="rgb\((\d+),(\d+),(\d+)\)"/g, (_match, attr, r, g, b) => {
    const [, , l] = rgbToHsl(Number(r), Number(g), Number(b));
    const [nr, ng, nb] = hslToRgb(targetH, targetS, l);
    return `${attr}="rgb(${nr},${ng},${nb})"`;
  });
}
