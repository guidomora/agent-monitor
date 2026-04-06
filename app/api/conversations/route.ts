import { NextResponse } from "next/server";
import { getConversationSummaries } from "@/lib/twilio/messages";
import { getErrorMessage, getErrorStatus } from "@/lib/twilio/server-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conversations = await getConversationSummaries();

    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) },
    );
  }
}
