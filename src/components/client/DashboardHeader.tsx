//import { ReactNode } from "react";

import type { ReactNode } from "react";

export const DashboardHeader = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) => (
  <header className="bg-white border-b px-6 py-4">
    <div className="flex items-center justify-between max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  </header>
);
