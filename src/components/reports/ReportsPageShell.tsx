export default function ReportsPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="reports-root"
      className="
        w-full max-w-none               /* ← full width */
        px-3 md:px-4 xl:px-6            /* subtle page padding */
        space-y-5
      "
    >
      {children}
    </main>
  );
}
