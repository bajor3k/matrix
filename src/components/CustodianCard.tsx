
// src/components/CustodianCard.tsx
export function CustodianCard({
  custodian,
  label,
  values
}: {
  custodian: string;
  label: string;
  values: string[];
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-2">
      <h3 className="text-lg font-semibold text-foreground">{custodian}</h3>

      <div className="text-sm text-muted-foreground">
        <span className="font-medium">{label}:</span>
      </div>

      <ul className="text-sm text-foreground space-y-1 pl-2">
        {values.map((v, i) => (
          <li key={i}>- {v}</li>
        ))}
      </ul>
    </div>
  );
}
