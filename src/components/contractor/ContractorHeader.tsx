// src/components/contractor/ContractorHeader.tsx
import { Button } from "../ui/button";
import { Bell, LogOut, Wrench } from "lucide-react";

interface ContractorHeaderProps {
  contractorName?: string;
  onLogout: () => void;
  notificationCount?: number;
}

export function ContractorHeader({
  contractorName,
  onLogout,
  notificationCount = 0,
}: ContractorHeaderProps) {
  return (
    <header className="bg-white border-b px-6 py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Panel Contratista</h1>
            <p className="text-sm text-muted-foreground">
              {contractorName ? `Bienvenido, ${contractorName}` : "SOS Service-on-Demand"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
