import { NextResponse } from "next/server";
import { isMarketingLeadPersistenceAvailable } from "@/lib/marketing-leads";
import { processMarketingLeadNurture } from "@/lib/server/marketing-lead-nurture";

export const maxDuration = 300;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (secret) {
    return authHeader === `Bearer ${secret}`;
  }

  const isProduction = process.env.APP_ENV === "production" || process.env.NODE_ENV === "production";
  if (!isProduction) {
    return Boolean(request.headers.get("x-vercel-cron"));
  }

  return false;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isMarketingLeadPersistenceAvailable()) {
    return NextResponse.json({ error: "Marketing lead persistence is unavailable." }, { status: 503 });
  }

  const url = new URL(request.url);
  const parsedLimit = Number(url.searchParams.get("limit") ?? "200");
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(Math.floor(parsedLimit), 1), 500)
    : 200;
  const dryRun = url.searchParams.get("dryRun") === "1";
  const result = await processMarketingLeadNurture({ limit, dryRun });

  return NextResponse.json(result);
}
