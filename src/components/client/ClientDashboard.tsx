import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, FileText, Clock, LogOut, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/ClientDashboardContext";
import { useSocketNotifications } from "@/hooks/useSocketNotifications";

import { ServiceRequestForm } from "./ServiceRequestForm";
import { ContractorsList } from "./ContractorsList";
import { DocumentsList } from "./DocumentsList";
import { HistoryList } from "./HistoryList";
import { StatsSummary } from "./StatsSummary";
import { DashboardHeader } from "./DashboardHeader";

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useDashboard();

  // 🔌 Socket para recibir notificaciones en tiempo real (SignalR / WebSocket)
  const { notice, acceptedBy, dismissNotice } = useSocketNotifications(user?.userId);

  // 🚫 Redirección si no hay sesión
  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Panel Cliente"
        subtitle="SOS Service-on demand"
        showNotifications={true}
      >
        <Button variant="outline" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </DashboardHeader>

      <div className="max-w-6xl mx-auto p-6">
        {/* 🔔 Banner de notificación */}
        {notice && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{notice}</p>
              {acceptedBy && <p className="text-sm opacity-80">Contratista: {acceptedBy}</p>}
            </div>
            <button
              onClick={dismissNotice}
              className="rounded-md px-2 py-1 text-sm hover:bg-green-100"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* 📁 Pestañas principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-fit mb-6">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Search className="w-4 h-4" /> Inicio
            </TabsTrigger>
            <TabsTrigger value="contractors" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Contratistas
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Documentos
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Historial
            </TabsTrigger>
          </TabsList>

          {/* 🏠 Secciones */}
          <TabsContent value="home">
            <div className="grid lg:grid-cols-2 gap-6">
              <ServiceRequestForm />
              <StatsSummary />
            </div>
          </TabsContent>

          <TabsContent value="contractors">
            <ContractorsList />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsList />
          </TabsContent>

          <TabsContent value="history">
            <HistoryList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
