import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import type { RequestHandler } from "express";
import { pool } from "./db";
import { storage } from "./storage";
import { verifyPassword } from "./lib/password";
import type { User } from "@shared/schema";

type SafeUser = Omit<User, "password">;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // Augments req.user across the app with our user shape (password stripped).
    interface User extends SafeUser {}
  }
}

function stripPassword(user: User): SafeUser {
  const { password, ...safe } = user;
  return safe;
}

// Shared session store — also used to authenticate the WebSocket upgrade
// request against the same server-side session record (see verifySessionCookie
// below), so the WS layer never has to trust a client-supplied identity.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sessionStore: any = null;

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be set. Add it to your .env file.");
  }
  return secret;
}

export function createSessionMiddleware(): RequestHandler {
  const secret = getSessionSecret();
  const PgSession = connectPgSimple(session);
  sessionStore = new PgSession({ pool, tableName: "session", createTableIfMissing: true });
  return session({
    store: sessionStore,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  });
}

/**
 * Resolve the authenticated user id for a raw Node request (used at the
 * WebSocket upgrade, before Express/Passport middleware runs). Reads the
 * signed session cookie, unsigns it with SESSION_SECRET, and looks the
 * session up in the same Postgres-backed store used for normal HTTP auth —
 * i.e. the exact same trust boundary as `requireAuth`. Never trusts anything
 * supplied by the client itself.
 */
export async function resolveUserIdFromCookie(cookieHeader: string | undefined): Promise<number | null> {
  if (!cookieHeader || !sessionStore) return null;
  const cookie = await import("cookie");
  const signature = await import("cookie-signature");
  const parsed = cookie.parse(cookieHeader);
  const raw = parsed["connect.sid"];
  if (!raw) return null;

  const unsigned = raw.startsWith("s:") ? signature.unsign(raw.slice(2), getSessionSecret()) : false;
  if (!unsigned) return null;

  return new Promise((resolve) => {
    sessionStore!.get(unsigned, (err: Error | null, sessionData: any) => {
      if (err || !sessionData) return resolve(null);
      const userId = sessionData.passport?.user;
      resolve(typeof userId === "number" ? userId : null);
    });
  });
}

export function configurePassport() {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) return done(null, false, { message: "Invalid email or password" });

          const valid = await verifyPassword(password, user.password);
          if (!valid) return done(null, false, { message: "Invalid email or password" });

          return done(null, stripPassword(user));
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, (user as SafeUser).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      done(null, stripPassword(user));
    } catch (error) {
      done(error as Error);
    }
  });

  return passport;
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Not authenticated" });
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
};
