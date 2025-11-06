import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const todos = await db.collection("todos").find({}).toArray();
  return NextResponse.json({ todos });
}

export async function POST(req: Request) {
  const data = await req.json();
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  await db.collection("todos").insertOne(data);
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const data = await req.json();
  const { _id, ...updateData } = data;
  
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  await db.collection("todos").updateOne(
    { _id: new ObjectId(_id) },
    { $set: updateData }
  );
  
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db.collection("todos").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "No todo found with that ID",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}