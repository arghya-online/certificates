import sharp from "sharp";
import { readFileSync } from "fs";
import * as fontkit from "fontkit";
import path from "path";

export async function generateCertificate(name: string) {
  const templatePath = path.join(
    process.cwd(),
    "public",
    "certificate-template.png",
  );
  const fontPath = path.join(
    process.cwd(),
    "node_modules",
    "@fontsource",
    "playfair-display",
    "files",
    "playfair-display-latin-500-normal.woff",
  );
  const font = fontkit.create(readFileSync(fontPath)) as fontkit.Font;
  const namePaths = createNamePaths(font, name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1414" viewBox="0 0 2000 1414">
      <g fill="#111827">${namePaths}</g>
    </svg>
  `;

  const certificate = await sharp(templatePath)
    .composite([
      {
        input: Buffer.from(svg),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  return certificate;
}

function createNamePaths(font: fontkit.Font, name: string) {
  const fontSize = 58;
  const scale = fontSize / font.unitsPerEm;
  const run = font.layout(name);
  const width = run.advanceWidth * scale;
  let cursor = 1000 - width / 2;

  return run.glyphs
    .map((glyph, index) => {
      const pathData = glyph.path.toSVG();
      const x = cursor + (run.positions[index]?.xOffset || 0) * scale;
      const y = 690 + (run.positions[index]?.yOffset || 0) * scale;
      cursor += (run.positions[index]?.xAdvance || glyph.advanceWidth) * scale;
      return `<path d="${pathData}" transform="translate(${x} ${y}) scale(${scale} ${-scale})"/>`;
    })
    .join("");
}
