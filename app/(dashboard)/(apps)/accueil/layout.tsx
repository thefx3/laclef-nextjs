import FeaturedSidebar from "@/components/accueil/FeaturedSidebar";
import type { ReactNode } from "react";

export default function AccueilLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid lg:grid-cols-[1fr_16rem] flex-1 min-w-0">
      <div className="w-full min-w-0">
        {children}
      </div>
      <div className="w-[16rem] shrink-0">
         <FeaturedSidebar />
      </div>
    </div>
  );
}

