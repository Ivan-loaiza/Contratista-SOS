//import { ReactNode } from "react";

import type { ReactNode } from "react";
import { NotificationBell } from "./NotificationBell";

export const DashboardHeader = ({
  title,
  subtitle,
  children,
  showNotifications = false,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  showNotifications?: boolean;
}) => (
  <header className="bg-white border-b px-6 py-4">
    <div className="flex items-center justify-between max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {showNotifications && <NotificationBell />}
        {children}
      </div>
    </div>
  </header>
);
