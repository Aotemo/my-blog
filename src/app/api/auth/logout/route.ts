import { jsonOk } from "@/lib/api";
import { destroySessionCookie } from "@/lib/auth";

export async function POST() {
  await destroySessionCookie();
  return jsonOk({ loggedOut: true });
}
