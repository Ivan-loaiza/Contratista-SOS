import { useAuth } from "@/context/AuthContext";
import { useClientDocuments } from "@/hooks/useClientDocuments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentCard } from "./DocumentCard";
import type { ClientDocumentDto } from "@/types/document";
import Swal from "sweetalert2";

export const DocumentsList = () => {
  const { user } = useAuth();
  const { docs, loading, error } = useClientDocuments(user?.userId);

  const handlePayDocument = async (document: ClientDocumentDto) => {
    const documentType = document.kind === "Factura" ? "factura" : document.kind.toLowerCase();

    await Swal.fire({
      icon: "info",
      title: "Pagar documento",
      html: `
        <div style="text-align:left">
          <p>Estás por pagar la <b>${documentType}</b> de <b>${document.contractorName}</b>.</p>
          <p>Monto: <b>$${document.amount.toFixed(2)}</b></p>
          <p class="mt-2">Integra aquí tu flujo de pago.</p>
        </div>
      `,
      confirmButtonText: "Entendido",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones, Proformas y Facturas</CardTitle>
          <CardDescription>Gestiona todos los documentos enviados por los contratistas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Cargando documentos...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones, Proformas y Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cotizaciones, Proformas y Facturas</CardTitle>
        <CardDescription>Gestiona todos los documentos enviados por los contratistas</CardDescription>
      </CardHeader>
      <CardContent>
        {docs.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Aún no tienes documentos. Cuando el contratista envíe uno, aparecerá aquí.
          </div>
        ) : (
          <div className="space-y-4">
            {docs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onPayClick={handlePayDocument} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
