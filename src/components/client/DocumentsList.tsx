// src/components/DocumentsList.tsx
import { useAuth } from "@/context/AuthContext";
import { useClientDocuments } from "@/hooks/useClientDocuments";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export const DocumentsList = () => {
  const { user } = useAuth();
  const { docs, loading, error } = useClientDocuments(user?.userId);

  if (loading) return <p>Cargando documentos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!docs.length) return <p>No hay documentos disponibles.</p>;

  return (
    <div className="space-y-4">
      {docs.map((doc) => (
        <Card key={doc.documentId}>
          <CardContent className="flex justify-between items-center p-4">
            {/* 🧾 Sección izquierda: tipo de documento y contratista */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold capitalize">
                  {doc.kind === "Cotizacion"
                    ? "Cotización"
                    : doc.kind === "Factura"
                    ? "Factura"
                    : "Proforma"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {doc.contractorName ?? "Contratista desconocido"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* 💰 Sección derecha: monto + estado */}
            <div className="text-right">
              <p className="font-medium text-base">
                ${doc.total.toFixed(2)}
              </p>
              <Badge
                variant={
                  doc.status === "Pagada"
                    ? "default"
                    : doc.status === "Pendiente"
                    ? "secondary"
                    : "outline"
                }
                className={
                  doc.status === "Pagada"
                    ? "bg-green-100 text-green-700"
                    : doc.status === "Pendiente"
                    ? "bg-yellow-100 text-yellow-700"
                    : doc.status === "Revision"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }
              >
                {doc.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
