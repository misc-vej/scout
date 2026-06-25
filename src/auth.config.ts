import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/auth" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/home", "/beastiary", "/discover", "/profile"];
      const isProtected = protectedPaths.some(p => nextUrl.pathname.startsWith(p));
      if (isProtected && !isLoggedIn)
        return Response.redirect(new URL("/auth", nextUrl));
      if (isLoggedIn && nextUrl.pathname === "/auth")
        return Response.redirect(new URL("/home", nextUrl));
      return true;
    },
  },
  providers: [],
};
