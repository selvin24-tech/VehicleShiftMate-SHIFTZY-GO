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

export function createSessionMiddleware(): RequestHandler {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be set. Add it to your .env file.");
  }

  const PgSession = connectPgSimple(session);
  return session({
    store: new PgSession({ pool, tableName: "session", createTableIfMissing: true }),
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
