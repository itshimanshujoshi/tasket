import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      );
    }

    if (!user.resetOTP || !user.resetOTPExpiry) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new one." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(user.resetOTPExpiry)) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (user.resetOTP !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetOTP: "",
          resetOTPExpiry: "",
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
