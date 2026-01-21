export default function PageHeader({ title }: { title: string }) {
    return (
      <main className="flex w-full flex-col justify-between items-start">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          {title}
        </h1>
      </main>
    );
  }
  
