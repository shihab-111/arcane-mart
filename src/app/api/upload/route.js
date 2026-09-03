import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/auth';
import { handler, ok, fail } from '@/lib/api';
import { uploadBuffer, cloudinaryReady } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
// First bytes of each allowed format — a renamed .exe won't pass.
const MAGIC = [
  [0xff, 0xd8, 0xff],                    // jpeg
  [0x89, 0x50, 0x4e, 0x47],              // png
  [0x52, 0x49, 0x46, 0x46],              // webp (RIFF)
  [0x00, 0x00, 0x00],                    // avif box length prefix
];
const looksLikeImage = (buf) => MAGIC.some((sig) => sig.every((b, i) => buf[i] === b));

export const POST = handler(async (req) => {
  await requireAdmin();
  const form = await req.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return fail('No file received', 422);
  if (!ALLOWED.includes(file.type)) return fail('Only JPG, PNG, WebP or AVIF images are allowed', 415);
  if (file.size > MAX_BYTES) return fail('Image must be under 5 MB', 413);

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!looksLikeImage(buffer)) return fail('That file is not a real image', 415);

  if (cloudinaryReady) {
    const result = await uploadBuffer(buffer, 'arcane-mart');
    return ok({ url: result.secure_url, publicId: result.public_id });
  }

  // Local fallback (VPS only — serverless hosts have a read-only filesystem).
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await writeFile(path.join(dir, name), buffer);
  // Site-relative path: works on any domain, no NEXT_PUBLIC_SITE_URL needed.
  return ok({ url: `/uploads/${name}` });
});
