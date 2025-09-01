
'use client';

import * as React from "react";
import { useRemoveDropzonesOnReports } from "@/hooks/useRemoveDropzonesOnReports";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  useRemoveDropzonesOnReports();

  // data-route makes our CSS scoping easy and safe
  return <div data-route="reports">{children}</div>;
}
