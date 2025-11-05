import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";
import type { ClientDocumentDto } from "@/types/document";
import { downloadPDF, openPDFInNewTab, generateDocumentFilename } from "@/utils/pdfUtils";
import Swal from "sweetalert2";

interface DocumentCardProps {
  document: ClientDocumentDto;
  onPayClick?: (document: ClientDocumentDto) => void;
}

export const DocumentCard = ({ document, onPayClick }: DocumentCardProps) => {
  const handleView = () => {
    if (!document.pdfUrl) {
      Swal.fire({
        icon: "info",
        text: "Este documento no tiene archivo adjunto.",
      });
      return;
    }
    openPDFInNewTab(document.pdfUrl);
  };

  const handleDownload = async () => {
    if (!document.pdfUrl) {
      Swal.fire({
        icon: "info",
        text: "Este documento no tiene archivo adjunto.",
      });
      return;
    }

    try {
      const filename = generateDocumentFilename(
        document.kind,
        document.contractorName,
        document.date
      );
      await downloadPDF(document.pdfUrl, filename);

      Swal.fire({
        icon: "success",
        title: "Descarga completada",
        text: `El documento se ha descargado correctamente.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al descargar",
        text: "No se pudo descargar el documento. Intenta de nuevo.",
      });
    }
  };

  const getDocumentTypeLabel = (kind: string): string => {
    switch (kind) {
      case "Cotizacion":
        return "Cotización";
      case "Factura":
        return "Factura";
      case "Proforma":
        return "Proforma";
      default:
        return kind;
    }
  };

  const getBadgeClass = (status: string): string => {
    switch (status) {
      case "Pagada":
        return "bg-green-100 text-green-700";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700";
      case "Enviada":
        return "bg-blue-100 text-blue-700";
      case "Revision":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {getDocumentTypeLabel(document.kind)}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                De: {document.contractorName}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(document.date).toLocaleString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-lg font-semibold">${document.amount.toFixed(2)}</div>
            <Badge variant="secondary" className={getBadgeClass(document.status)}>
              {document.status}
            </Badge>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              title="Ver documento"
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              title="Descargar documento"
            >
              <Download className="w-4 h-4 mr-1" />
              Descargar
            </Button>

            {document.status === "Pendiente" && onPayClick && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => onPayClick(document)}
              >
                Pagar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
