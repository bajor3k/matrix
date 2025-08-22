export function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 p-5 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold text-white/90 mb-2 md:mb-2.5">
        {title}
      </h2>
      <div className="text-sm md:text-base leading-relaxed text-white/75">
        {children}
      </div>
    </section>
  );
}
