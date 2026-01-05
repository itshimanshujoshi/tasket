import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const todos = await db
      .collection("todos")
      .find({ userId: user._id })
      .toArray();
    return NextResponse.json({ todos });
  } catch (error) {
    console.error("GET todos error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    await db.collection("todos").insertOne({
      ...data,
      userId: user._id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST todos error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { _id, ...updateData } = data;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Verify the todo belongs to the user
    const todo = await db.collection("todos").findOne({
      _id: new ObjectId(_id),
      userId: user._id,
    });

    if (!todo) {
      return NextResponse.json(
        { error: "Todo not found or unauthorized" },
        { status: 404 }
      );
    }

    await db.collection("todos").updateOne(
      { _id: new ObjectId(_id), userId: user._id },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT todos error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Verify the todo belongs to the user before deleting
    const result = await db.collection("todos").deleteOne({
      _id: new ObjectId(id),
      userId: user._id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "No todo found with that ID or unauthorized",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}