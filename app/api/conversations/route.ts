import { NextResponse } from "next/server";
import { getConversationSummaries } from "@/features/whatsapp/services/conversations.service";
import { parseConversationPaginationParams } from "@/features/whatsapp/services/conversation-pagination-params";
import { getErrorMessage, getErrorStatus } from "@/features/whatsapp/services/server-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = parseConversationPaginationParams(searchParams);
    const payload = await getConversationSummaries(pagination);

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) },
    );
  }
}
