import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { sendWelcomeEmail, sendAdminSignupNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const result = await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    });

    // Generate token
    const token = generateToken(result.insertedId.toString());

    // Send welcome email to user
    sendWelcomeEmail(email, name).catch(err =>
      console.error('Failed to send welcome email:', err)
    );

    // Send notification to admin
    sendAdminSignupNotification(email, name).catch(err =>
      console.error('Failed to send admin notification:', err)
    );

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        _id: result.insertedId.toString(),
        email,
        name,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

