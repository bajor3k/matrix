export function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#101010] p-5 md:p-6">
      <h2 className="report-heading">{title}</h2>
      <div className="report-copy">{children}</div>
    </section>
  );
}
