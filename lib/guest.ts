import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export const GUEST_COOKIE_NAME = "matchday_guest_id";
export const GUEST_NAME_COOKIE = "matchday_guest_name";

export async function getGuestId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_COOKIE_NAME)?.value;
}

export async function getGuestName(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_NAME_COOKIE)?.value;
}

export async function setGuestCookies(guestId: string, guestName: string) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };

  cookieStore.set(GUEST_COOKIE_NAME, guestId, options);
  cookieStore.set(GUEST_NAME_COOKIE, guestName, options);
}

export function createGuestId() {
  return uuidv4();
}
