import { NextResponse } from "next/server";
import { getConversationMessages } from "@/lib/twilio/messages";
import { getErrorMessage, getErrorStatus } from "@/lib/twilio/server-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { conversationId } = await context.params;

  try {
    const messages = await getConversationMessages(decodeURIComponent(conversationId));

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) },
    );
  }
}
