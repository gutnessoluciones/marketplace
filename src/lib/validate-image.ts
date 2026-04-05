// Magic bytes for image validation (prevents MIME spoofing)
const IMAGE_SIGNATURES: { mime: string; bytes: number[] }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8
];

/**
 * Validate that file contents match its claimed MIME type by checking magic bytes.
 * Returns true if the file content matches a known image signature.
 */
export async function validateImageBytes(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const header = new Uint8Array(buffer);

  return IMAGE_SIGNATURES.some((sig) =>
    sig.bytes.every((byte, i) => header[i] === byte),
  );
}
