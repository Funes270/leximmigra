import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery } from "./middleware";
import { getUserByUnionId, createUser, updateUserLastSignIn } from "./queries/users";
import { createSession, getSession, deleteSession } from "./kimi/session";
import { exchangeCodeForToken, getUserInfo } from "./kimi/auth";
import type { TrpcContext } from "./context";

export const authRouter = createRouter({
  me: authedQuery.query(async ({ ctx }) => {
    return ctx.user;
  }),

  exchange: createRouter({
    code: createRouter({
      for: createRouter({
        session: createRouter({
          token: createRouter({
            cookie: createRouter({
              exchange: createRouter({
                mutation: async ({ input, ctx }: { input: { code: string; state: string }; ctx: TrpcContext }) => {
                  const token = await exchangeCodeForToken(input.code);
                  const kimiUser = await getUserInfo(token);
                  let user = await getUserByUnionId(kimiUser.union_id);
                  if (!user) {
                    user = await createUser({
                      unionId: kimiUser.union_id,
                      name: kimiUser.name,
                      email: kimiUser.email,
                      avatar: kimiUser.avatar,
                    });
                  }
                  await updateUserLastSignIn(user.id);
                  const sessionToken = await createSession(user.id);
                  const cookieOptions = getSessionCookieOptions();
                  ctx.res.headers.append("Set-Cookie", cookie.serialize(Session.CookieName, sessionToken, cookieOptions));
                  return { success: true };
                },
              }),
            }),
          }),
        }),
      }),
    }),
  }),

  logout: createRouter({
    mutation: async ({ ctx }: { ctx: TrpcContext }) => {
      const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
      const sessionToken = cookies[Session.CookieName];
      if (sessionToken) {
        await deleteSession(sessionToken);
      }
      const cookieOptions = getSessionCookieOptions();
      ctx.res.headers.append("Set-Cookie", cookie.serialize(Session.CookieName, "", { ...cookieOptions, maxAge: 0 }));
      return { success: true };
    },
  }),
});