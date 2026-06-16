export function getImageDimensions(
  bytes: Uint8Array
): { width: number; height: number } | null {
  if (bytes.length < 24) return null;

  // PNG: IHDR width/height at bytes 16–23 (big-endian u32)
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint32(16, false);
    const height = view.getUint32(20, false);
    return width > 0 && height > 0 ? { width, height } : null;
  }

  // JPEG: scan for SOF markers (0xFFC0–0xFFC3, 0xFFC5–0xFFC7, 0xFFC9–0xFFCB, 0xFFCD–0xFFCF)
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return parseJpegDimensions(bytes);
  }

  // WebP: RIFF container
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return parseWebpDimensions(bytes);
  }

  return null;
}

function parseJpegDimensions(
  bytes: Uint8Array
): { width: number; height: number } | null {
  let offset = 2;

  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;

    const marker = bytes[offset + 1];
    offset += 2;

    if (marker === 0xd8 || marker === 0xd9) continue;

    const length = (bytes[offset] << 8) | bytes[offset + 1];
    if (length < 2 || offset + length > bytes.length) return null;

    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isSof && offset + 7 <= bytes.length) {
      const height = (bytes[offset + 3] << 8) | bytes[offset + 4];
      const width = (bytes[offset + 5] << 8) | bytes[offset + 6];
      return width > 0 && height > 0 ? { width, height } : null;
    }

    offset += length;
  }

  return null;
}

function parseWebpDimensions(
  bytes: Uint8Array
): { width: number; height: number } | null {
  if (bytes.length < 30) return null;

  const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);

  if (chunk === "VP8X" && bytes.length >= 30) {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return width > 0 && height > 0 ? { width, height } : null;
  }

  if (chunk === "VP8 " && bytes.length >= 30) {
    const width = bytes[26] | (bytes[27] << 8);
    const height = bytes[28] | (bytes[29] << 8);
    return width > 0 && height > 0 ? { width, height } : null;
  }

  if (chunk === "VP8L" && bytes.length >= 25) {
    const bits =
      bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
    const width = 1 + (bits & 0x3fff);
    const height = 1 + ((bits >> 14) & 0x3fff);
    return width > 0 && height > 0 ? { width, height } : null;
  }

  return null;
}
