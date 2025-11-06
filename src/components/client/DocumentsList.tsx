import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useClientDocuments } from "@/hooks/useClientDocuments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentCard } from "./DocumentCard";
import { DocumentPaymentModal } from "./DocumentPaymentModal";
import type { ClientDocumentDto } from "@/services/DocumentApi";

export const DocumentsList = () => {
  const { user } = useAuth();
  const { docs, loading, error, refetch } = useClientDocuments(user?.userId);
  const [selectedDocument, setSelectedDocument] = useState<ClientDocumentDto | null>(null);

  const handlePayDocument = (document: ClientDocumentDto) => {
    setSelectedDocument(document);
  };

  const handlePaymentSuccess = () => {
    refetch();
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones y Facturas</CardTitle>
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

      <DocumentPaymentModal
        isOpen={selectedDocument !== null}
        onClose={() => setSelectedDocument(null)}
        document={selectedDocument}
        clientId={user?.userId || 0}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};
