import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "./mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "";

// Token expiration time in seconds (1 hour)
export const TOKEN_EXPIRY_SECONDS = 60 * 60; // 1 hour

export interface User {
  _id: string;
  email: string;
  name: string;
}

export interface TokenPayload {
  userId: string;
  exp: number;
  iat: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY_SECONDS });
}

export function getTokenExpiry(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload | null;
    return decoded?.exp ?? null;
  } catch {
    return null;
  }
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(
  req: NextRequest
): Promise<User | null> {
  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return null;
    }

    return {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_EXPIRY_SECONDS,
    path: "/",
  });
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

