export const MAGIC_LINK_PLAIN_FIELD = "plain";

export async function isPlainMagicLinkRequest(request: Request): Promise<boolean> {
  try {
    const formData = await request.clone().formData();
    return formData.get(MAGIC_LINK_PLAIN_FIELD) === "1";
  } catch {
    return false;
  }
}
