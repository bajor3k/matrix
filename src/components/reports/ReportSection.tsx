export function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/50 p-5 md:p-6 dark:bg-transparent">
      <h2 className="text-lg md:text-xl font-semibold text-foreground/90 mb-2 md:mb-2.5">
        {title}
      </h2>
      <div className="text-sm md:text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
