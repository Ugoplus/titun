import { NextResponse } from "next/server";
import { expireReservations } from "@/lib/orders/service";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const released = await expireReservations();
  return NextResponse.json({ released });
}
