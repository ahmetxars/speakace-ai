const MAX_AVATAR_BYTES = 2_000_000;
const MAX_AVATAR_DATA_URL_LENGTH = 32 + Math.ceil(MAX_AVATAR_BYTES / 3) * 4;
const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function validateAvatarDataUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > MAX_AVATAR_DATA_URL_LENGTH) return null;
  const match = /^data:image\/(png|jpeg|webp);base64,/.exec(value);
  if (!match) return null;

  const encoded = value.slice(match[0].length);
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.length > MAX_AVATAR_BYTES || bytes.toString("base64") !== encoded) return null;

  switch (match[1]) {
    case "png":
      return bytes.subarray(0, 8).equals(PNG_HEADER) ? value : null;
    case "jpeg":
      return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? value : null;
    case "webp":
      return bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? value : null;
    default:
      return null;
  }
}
