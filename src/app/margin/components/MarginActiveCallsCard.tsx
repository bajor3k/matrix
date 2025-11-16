// app/margin/components/MarginActiveCallsCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MarginActiveCallsCard() {
  // Dummy data for now
  const activeMarginCalls = 12;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold">
          Accounts in Margin Call
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
          {activeMarginCalls}
        </div>
        <p className="text-xs text-muted-foreground">
          Active calls across all accounts
        </p>
      </CardContent>
    </Card>
  );
}
