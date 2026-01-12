import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { sendOTPEmail } from "@/lib/email";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          resetOTP: otp,
          resetOTPExpiry: otpExpiry,
        },
      }
    );

    await sendOTPEmail(email, user.name, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
