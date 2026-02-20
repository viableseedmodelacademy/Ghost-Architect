import { NextRequest, NextResponse } from "next/server";
import { getSession, changePassword, hashPassword } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check if user is logged in
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Change password
    const result = await changePassword(currentPassword, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to change password" },
        { status: 400 }
      );
    }

    // Generate new hash for manual update
    const newHash = await hashPassword(newPassword);

    return NextResponse.json({ 
      success: true, 
      message: "Password changed successfully",
      // For Vercel deployment: user needs to update env var
      instruction: "To complete password change on Vercel, update ADMIN_PASSWORD_HASH in your environment variables with the new hash.",
      newHash // Include for manual update
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "An error occurred while changing password" },
      { status: 500 }
    );
  }
}

// GET endpoint to check auth status
export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json({
      isLoggedIn: session.isLoggedIn,
      email: session.email,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { isLoggedIn: false, email: "", expiresAt: 0 },
      { status: 200 }
    );
  }
}