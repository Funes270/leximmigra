import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { getSession } from "./kimi/session";
import { getUserById } from "./queries/users";

export async function createContext({ req, res }: { req: Request; res: Response }) {
  const cookies = cookie.parse(req.headers.get("cookie") || "");
  const sessionToken = cookies[Session.CookieName];
  let user = null;
  if (sessionToken) {
    const session = await getSession(sessionToken);
    if (session) {
      user = await getUserById(session.userId);
    }
  }
  return { req, res, user };
}

export type TrpcContext = Awaited<ReturnType<typeof createContext>>;