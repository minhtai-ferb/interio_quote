import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const folder = form.get("folder");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Thiếu file hình ảnh" }, { status: 400 });
  }
  if (folder !== "templates" && folder !== "quotes") {
    return NextResponse.json({ error: "folder không hợp lệ" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Chỉ chấp nhận JPEG, PNG hoặc WEBP" },
      { status: 400 }
    );
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "Hình ảnh vượt quá 8MB" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadImage(buffer, folder);
    return NextResponse.json(uploaded);
  } catch {
    return NextResponse.json(
      { error: "Tải hình ảnh lên Cloudinary thất bại" },
      { status: 502 }
    );
  }
}
