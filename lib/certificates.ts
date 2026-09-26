import sharp from "sharp";
import { readFileSync } from "fs";
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
  const fontData = readFileSync(fontPath).toString("base64");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1414" viewBox="0 0 2000 1414">
      <style>
        @font-face {
          font-family: CertificateSerif;
          src: url(data:font/woff;base64,${fontData}) format("woff");
        }

        .name {
          font-family: CertificateSerif;
          font-size: 62px;
          font-weight: 500;
          fill: #111827;
        }
      </style>

      <text
        x="1000"
        y="690"
        text-anchor="middle"
        dominant-baseline="alphabetic"
        class="name"
      >
        ${escapeXml(name)}
      </text>
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

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
