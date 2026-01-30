import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "База даних тимчасово відключена",
    status: "disabled"
  });
}
