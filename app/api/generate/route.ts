import { NextRequest } from "next/server";
import { generateCertificate } from "@/lib/certificates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = body.name?.trim();

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const certificate = await generateCertificate(name);

    return new Response(certificate, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=certificate.png",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to generate certificate" },
      { status: 500 },
    );
  }
}
