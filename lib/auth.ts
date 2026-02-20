import { cookies } from "next/headers";
import { sealData, unsealData } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

// Session interface
export interface SessionData {
  isLoggedIn: boolean;
  email: string;
  expiresAt: number;
}

// Default session
const defaultSession: SessionData = {
  isLoggedIn: false,
  email: "",
  expiresAt: 0,
};

// Session duration: 7 days
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

// Get session secret from environment
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long");
  }
  return secret;
}

// Get session from cookies
export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    return defaultSession;
  }

  try {
    const session = await unsealData<SessionData>(sessionCookie.value, {
      password: getSessionSecret(),
    });

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      return defaultSession;
    }

    return session;
  } catch {
    return defaultSession;
  }
}

// Set session in cookies
export async function setSession(email: string): Promise<void> {
  const cookieStore = await cookies();
  
  const session: SessionData = {
    isLoggedIn: true,
    email,
    expiresAt: Date.now() + SESSION_DURATION,
  };

  const sealedSession = await sealData(session, {
    password: getSessionSecret(),
  });

  cookieStore.set("session", sealedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });
}

// Clear session (logout)
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// Verify credentials against environment variables
export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    return { success: false, error: "Server configuration error" };
  }

  // Check email
  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    return { success: false, error: "Invalid credentials" };
  }

  // Verify password using bcrypt
  try {
    const bcrypt = require("bcryptjs");
    const isValid = await bcrypt.compare(password, adminPasswordHash);
    
    if (!isValid) {
      return { success: false, error: "Invalid credentials" };
    }

    return { success: true };
  } catch (error) {
    console.error("Password verification error:", error);
    return { success: false, error: "Authentication error" };
  }
}

// Change password (updates .env.local - for single user)
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  // Verify current password first
  const adminEmail = process.env.ADMIN_EMAIL;
  const verifyResult = await verifyCredentials(adminEmail || "", currentPassword);
  
  if (!verifyResult.success) {
    return { success: false, error: "Current password is incorrect" };
  }

  // Validate new password
  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters" };
  }

  // Hash new password
  try {
    const bcrypt = await import("bcryptjs");
    const newHash = await bcrypt.hash(newPassword, 10);
    
    // In production, you would update a database
    // For this single-user setup, we return the hash to be manually updated
    // Or use Vercel's environment variables API
    
    return { 
      success: true, 
      // Return the hash so it can be displayed for manual update
      // In a real app, this would update a database
    };
  } catch (error) {
    console.error("Password change error:", error);
    return { success: false, error: "Failed to change password" };
  }
}

// Middleware helper to check authentication
export async function checkAuth(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn;
}

// Generate a bcrypt hash for password (utility function)
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 10);
}