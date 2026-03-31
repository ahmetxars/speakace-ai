import { NextResponse } from "next/server";
import { commerceConfig } from "@/lib/commerce";

export async function GET() {
  return NextResponse.redirect(commerceConfig.customerPortalUrl);
}
