export default function ReportsPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground">
      <div
        className={[
          "mx-auto max-w-7xl",
          "px-4 md:px-6 lg:px-8",        // unified gutters
          "pt-3 md:pt-4",                // tight to the top (no big gap)
          "pb-8",                        // reasonable bottom
          "space-y-4 md:space-y-5",      // consistent vertical rhythm
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
