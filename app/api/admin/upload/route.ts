import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

/** Vercel serverless request body limit is ~4.5MB for server uploads */
const MAX_FILE_SIZE = 4 * 1024 * 1024;

function isImageFile(file: Blob): boolean {
  if (file.type.startsWith("image/")) return true;
  // Some phone photos arrive without a MIME type
  if (!file.type && file instanceof File) {
    return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name);
  }
  return false;
}

async function saveToPublicUploads(file: Blob, filename: string): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", "catalog");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/catalog/${filename}`;
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 },
      );
    }

    if (!isImageFile(file)) {
      return NextResponse.json(
        { error: "Only image files are allowed (JPG, PNG, WebP)" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "Each image must be under 4MB. Compress the photo or paste an image URL instead.",
        },
        { status: 400 },
      );
    }

    const originalName =
      file instanceof File && file.name ? file.name : "photo.jpg";
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filename = `${Date.now()}-${safeName}`;

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken) {
      const blob = await put(`catalog/${filename}`, file, {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
      });
      return NextResponse.json({ url: blob.url });
    }

    // Local / non-Vercel fallback so catalogue can still be managed in development
    if (!process.env.VERCEL) {
      const url = await saveToPublicUploads(file, filename);
      return NextResponse.json({ url });
    }

    return NextResponse.json(
      {
        error:
          "Photo upload is not set up on this site yet (missing BLOB_READ_WRITE_TOKEN). Paste an image URL below, or add Vercel Blob storage.",
      },
      { status: 503 },
    );
  } catch (error) {
    console.error("Admin upload error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
