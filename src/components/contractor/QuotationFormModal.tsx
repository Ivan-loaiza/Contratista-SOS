// src/components/contractor/QuotationFormModal.tsx
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Plus, XCircle, Calculator, Receipt, FileCheck, FileText } from "lucide-react";
import type { ContractorServiceRequest } from "@/services/ServiceRequestApi";
import Swal from "sweetalert2";

type DocumentKind = "cotizacion" | "factura" | "proforma";

interface ServiceItem {
  description: string;
  hours: string;
  rate: string;
}

interface QuotationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ContractorServiceRequest | null;
  onSubmit: (data: {
    requestId: number;
    kind: DocumentKind;
    items: Array<{ description: string; hours: number; rate: number }>;
    notes: string;
    total: number;
  }) => Promise<void>;
}

export function QuotationFormModal({
  isOpen,
  onClose,
  request,
  onSubmit,
}: QuotationFormModalProps) {
  const [documentType, setDocumentType] = useState<DocumentKind>("cotizacion");
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
    { description: "", hours: "", rate: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill notes when request changes
  useState(() => {
    if (request) {
      setNotes(
        `Servicio: ${request.serviceName}\nUbicación: ${request.location}\n${
          request.visitNotes ? `\nNotas: ${request.visitNotes}` : ""
        }`
      );
    }
  });

  const total = useMemo(() => {
    return serviceItems.reduce((acc, item) => {
      const h = parseFloat(item.hours || "0") || 0;
      const r = parseFloat(item.rate || "0") || 0;
      return acc + h * r;
    }, 0);
  }, [serviceItems]);

  const addServiceItem = () => {
    setServiceItems((prev) => [...prev, { description: "", hours: "", rate: "" }]);
  };

  const removeServiceItem = (index: number) => {
    setServiceItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateServiceItem = (
    index: number,
    field: keyof ServiceItem,
    value: string
  ) => {
    setServiceItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!request) return;

    const validItems = serviceItems
      .map((item) => ({
        description: item.description.trim(),
        hours: parseFloat(item.hours || "0") || 0,
        rate: parseFloat(item.rate || "0") || 0,
      }))
      .filter((item) => item.description && item.hours > 0 && item.rate > 0);

    if (validItems.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Items requeridos",
        text: "Agrega al menos un item con descripción, horas y tarifa válidas",
      });
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        requestId: request.requestId,
        kind: documentType,
        items: validItems,
        notes: notes.trim(),
        total,
      });

      await Swal.fire({
        icon: "success",
        title: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} enviada`,
        html: `
          <div style="text-align:left">
            <p><b>Cliente:</b> ${request.clientName}</p>
            <p><b>Total:</b> $${total.toFixed(2)}</p>
            <p class="mt-2">El cliente recibirá el documento.</p>
          </div>
        `,
      });

      // Reset form
      setServiceItems([{ description: "", hours: "", rate: "" }]);
      setNotes("");
      setDocumentType("cotizacion");
      onClose();
    } catch (error: any) {
      console.error("Error sending document:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "No se pudo enviar el documento",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDocumentIcon = (type: DocumentKind) => {
    switch (type) {
      case "cotizacion":
        return <Calculator className="w-4 h-4" />;
      case "factura":
        return <Receipt className="w-4 h-4" />;
      case "proforma":
        return <FileCheck className="w-4 h-4" />;
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Crear Documento
            </DialogTitle>
            <DialogDescription>
              Para {request.clientName} • Solicitud #{request.requestId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Document Type Selector */}
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={documentType === "cotizacion" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDocumentType("cotizacion")}
                  className={
                    documentType === "cotizacion" ? "bg-green-600 hover:bg-green-700" : ""
                  }
                >
                  {getDocumentIcon("cotizacion")}
                  <span className="ml-1">Cotización</span>
                </Button>
                <Button
                  type="button"
                  variant={documentType === "factura" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDocumentType("factura")}
                  className={
                    documentType === "factura" ? "bg-green-600 hover:bg-green-700" : ""
                  }
                >
                  {getDocumentIcon("factura")}
                  <span className="ml-1">Factura</span>
                </Button>
                <Button
                  type="button"
                  variant={documentType === "proforma" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDocumentType("proforma")}
                  className={
                    documentType === "proforma" ? "bg-green-600 hover:bg-green-700" : ""
                  }
                >
                  {getDocumentIcon("proforma")}
                  <span className="ml-1">Proforma</span>
                </Button>
              </div>
            </div>

            {/* Service Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servicio:</span>
                <span className="font-medium">{request.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descripción:</span>
                <span className="font-medium text-right">{request.description}</span>
              </div>
              {request.scheduledVisitDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visita programada:</span>
                  <span className="font-medium">
                    {new Date(request.scheduledVisitDate).toLocaleDateString()}
                    {request.scheduledVisitTime && ` ${request.scheduledVisitTime}`}
                  </span>
                </div>
              )}
            </div>

            {/* Service Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Servicios y Mano de Obra</Label>
                <Button type="button" variant="outline" size="sm" onClick={addServiceItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Item
                </Button>
              </div>

              {serviceItems.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium text-sm">Item {index + 1}</h5>
                    {serviceItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeServiceItem(index)}
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Descripción del servicio"
                      value={item.description}
                      onChange={(e) =>
                        updateServiceItem(index, "description", e.target.value)
                      }
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Horas"
                        type="number"
                        step="0.5"
                        min="0"
                        value={item.hours}
                        onChange={(e) => updateServiceItem(index, "hours", e.target.value)}
                      />
                      <Input
                        placeholder="Tarifa/hora ($)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateServiceItem(index, "rate", e.target.value)}
                      />
                    </div>

                    {item.hours && item.rate && (
                      <div className="text-right text-sm font-medium text-green-600">
                        Subtotal: ${(parseFloat(item.hours) * parseFloat(item.rate)).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total:</span>
                  <span className="text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Términos y condiciones, garantías, métodos de pago, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/1000 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || total <= 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading
                ? "Enviando..."
                : `Enviar ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
