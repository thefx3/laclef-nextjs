export default function PageShell({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <section className="w-full rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="flex flex-1 flex-col gap-6 font-sans">
          {children}
        </div>
      </section>
    );
  }
  
