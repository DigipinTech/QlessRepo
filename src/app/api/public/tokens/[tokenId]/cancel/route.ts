import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelToken, QueueError } from "@/lib/queue/engine";

export async function POST(_req: Request, ctx: RouteContext<"/api/public/tokens/[tokenId]/cancel">) {
  try {
    const { tokenId } = await ctx.params;
    const token = await prisma.token.findUnique({ where: { id: tokenId } });
    if (!token) return NextResponse.json({ error: "Token not found." }, { status: 404 });

    const updated = await cancelToken({ hospitalId: token.hospitalId, tokenId });
    return NextResponse.json({ token: updated });
  } catch (err) {
    if (err instanceof QueueError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
