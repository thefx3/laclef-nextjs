import type { ReactNode } from "react";

export default function MusiqueLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full p-4">
        {children}
    </div>
  );
}