// app/reports/test/refresh-action.ts
"use server";

import { revalidateTag } from "next/cache";

export async function revalidateTestTag() {
  // Allows a manual refresh if/when we switch off no-store later
  revalidateTag("reports-test");
}
