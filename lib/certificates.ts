import sharp from "sharp";
import path from "path";

export async function generateCertificate(name: string) {
  const templatePath = path.join(
    process.cwd(),
    "public",
    "certificate-template.png",
  );

  const svg = `
    <svg width="2000" height="1414">
      <style>
        .name {
          font-family: Georgia, serif;
          font-size: 58px;
          fill: #111827;
        }
      </style>

      <text
        x="1000"
        y="690"
        text-anchor="middle"
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
