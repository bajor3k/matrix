import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function CrmFooterSection({ firm, custodians }: { firm: any, custodians: string[] }) {
  // Determine label for the codes column
  function getCustodianLabel(cust: string) {
    if (cust === "Pershing" || cust === "PAS") return "IP Codes";
    if (cust === "Fidelity") return "G Numbers";
    if (cust === "Schwab") return "Masters";
    if (cust === "Goldman" || cust === "Goldman Sachs") return "Rep Codes";
    return "Codes";
  }

  // Extract codes for each custodian
  const codesByCustodian = custodians.map((c) => ({
    name: c,
    label: getCustodianLabel(c),
    codes: firm?.codes?.[c] || [], // expects something like firm.codes.Pershing = ["1129", "4821"]
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

      {/* Column 1 — Custodian Codes */}
      <Card className="bg-card border border-border/10 rounded-xl">
        <CardHeader>
          <CardTitle>Custodian Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content intentionally removed */}
        </CardContent>
      </Card>

      {/* Column 2 — Firm Documents */}
      <Card className="bg-card border border-border/10 rounded-xl">
        <CardHeader>
          <CardTitle>{firm?.firmInfo?.ip} Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {/* Content intentionally removed */}
        </CardContent>
      </Card>

      {/* Column 3 — Misc Documents */}
      <Card className="bg-card border border-border/10 rounded-xl">
        <CardHeader>
          <CardTitle>Misc Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {/* Content intentionally removed */}
        </CardContent>
      </Card>

    </div>
  );
}
