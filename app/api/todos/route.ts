import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const todos = await db.collection("todos").find({ name }).toArray();
  return NextResponse.json({ todos });
}

export async function POST(req: Request) {
  const data = await req.json();
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  await db.collection("todos").insertOne(data);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const data = await req.json();
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  await db.collection("todos").deleteOne({ id: data.id });
  return NextResponse.json({ success: true });
}
