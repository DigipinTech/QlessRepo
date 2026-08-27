import { NextResponse } from "next/server";
import { requireApiSession, resolveHospitalScope, handleApiError } from "@/lib/api-helpers";
import { computeAnalytics } from "@/lib/analytics";

export async function GET(req: Request, ctx: RouteContext<"/api/hospitals/[hospitalId]/analytics">) {
  try {
    const { hospitalId } = await ctx.params;
    const session = await requireApiSession();
    resolveHospitalScope(session, hospitalId);

    const url = new URL(req.url);
    const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 7), 1), 90);

    const result = await computeAnalytics(hospitalId, days);
    return NextResponse.json(result);
  } catch (err) {
    return handleApiError(err);
  }
}
