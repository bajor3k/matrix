// src/components/CustodianBar.tsx

export function CustodianBar({
  custodian,
  values,
}: {
  custodian: string;
  values: string[];
}) {
  return (
    <div className="bg-card border border-border/20 rounded-xl px-4 py-3 flex items-center justify-between">
      <span className="font-semibold text-foreground">{custodian}</span>
      <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
        {values.map((v, i) => (
          <React.Fragment key={i}>
            <span>{v}</span>
            {i < values.length - 1 && (
              <span className="text-muted-foreground/50">·</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
