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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { XCircle, Calculator, Receipt, FileText, Wrench, Package } from "lucide-react";
import type { ContractorServiceRequest } from "@/services/ServiceRequestApi";
import type { DocumentKind, DocumentItemType, CreateDocumentItemDto } from "@/services/DocumentApi";
import Swal from "sweetalert2";

interface DocumentItem {
  itemType: DocumentItemType; // 0 = Service, 1 = Material
  description: string;
  // Para servicios
  hours?: string;
  hourlyRate?: string;
  // Para materiales
  quantity?: string;
  unit?: string;
  unitPrice?: string;
}

interface QuotationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ContractorServiceRequest | null;
  onSubmit: (data: {
    requestId: number;
    clientId: number;
    contractorId: number;
    kind: DocumentKind;
    items: CreateDocumentItemDto[];
    notes: string;
    total?: number;
  }) => Promise<void>;
}

export function QuotationFormModal({
  isOpen,
  onClose,
  request,
  onSubmit,
}: QuotationFormModalProps) {
  const [documentType, setDocumentType] = useState<DocumentKind>(0); // 0 = Cotizacion
  const [items, setItems] = useState<DocumentItem[]>([
    { itemType: 0, description: "", hours: "", hourlyRate: "" },
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

  // Calculate total
  const total = useMemo(() => {
    return items.reduce((acc, item) => {
      if (item.itemType === 0) {
        // Service
        const h = parseFloat(item.hours || "0") || 0;
        const r = parseFloat(item.hourlyRate || "0") || 0;
        return acc + h * r;
      } else {
        // Material
        const q = parseFloat(item.quantity || "0") || 0;
        const p = parseFloat(item.unitPrice || "0") || 0;
        return acc + q * p;
      }
    }, 0);
  }, [items]);

  const addItem = (type: DocumentItemType) => {
    if (type === 0) {
      setItems((prev) => [
        ...prev,
        { itemType: 0, description: "", hours: "", hourlyRate: "" },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        { itemType: 1, description: "", quantity: "", unit: "", unitPrice: "" },
      ]);
    }
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof DocumentItem, value: string | DocumentItemType) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        // Si cambia el tipo de item, resetear campos
        if (field === "itemType") {
          const newItemType = value as DocumentItemType;
          if (newItemType === 0) {
            return {
              itemType: 0,
              description: item.description,
              hours: "",
              hourlyRate: "",
            };
          } else {
            return {
              itemType: 1,
              description: item.description,
              quantity: "",
              unit: "",
              unitPrice: "",
            };
          }
        }

        return { ...item, [field]: value };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!request) return;

    // Validate and convert items
    const validItems: CreateDocumentItemDto[] = [];

    for (const item of items) {
      if (!item.description.trim()) continue;

      if (item.itemType === 0) {
        // Service item
        const hours = parseFloat(item.hours || "0");
        const hourlyRate = parseFloat(item.hourlyRate || "0");

        if (hours > 0 && hourlyRate > 0) {
          validItems.push({
            itemType: 0,
            description: item.description.trim(),
            hours,
            hourlyRate,
          });
        }
      } else {
        // Material item
        const quantity = parseFloat(item.quantity || "0");
        const unitPrice = parseFloat(item.unitPrice || "0");

        if (quantity > 0 && unitPrice > 0 && item.unit?.trim()) {
          validItems.push({
            itemType: 1,
            description: item.description.trim(),
            quantity,
            unit: item.unit.trim(),
            unitPrice,
          });
        }
      }
    }

    if (validItems.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Items requeridos",
        text: "Agrega al menos un item válido con todos los campos completos",
      });
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        requestId: request.requestId,
        clientId: request.clientId,
        contractorId: request.contractorId,
        kind: documentType,
        items: validItems,
        notes: notes.trim(),
        total,
      });

      const docTypeName = documentType === 0 ? "Cotización" : "Factura";

      await Swal.fire({
        icon: "success",
        title: `${docTypeName} enviada`,
        html: `
          <div style="text-align:left">
            <p><b>Cliente:</b> ${request.clientName}</p>
            <p><b>Total:</b> $${total.toFixed(2)}</p>
            <p class="mt-2">El cliente recibirá el documento.</p>
          </div>
        `,
      });

      // Reset form
      setItems([{ itemType: 0, description: "", hours: "", hourlyRate: "" }]);
      setNotes("");
      setDocumentType(0);
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

  const getItemSubtotal = (item: DocumentItem): number => {
    if (item.itemType === 0) {
      const h = parseFloat(item.hours || "0") || 0;
      const r = parseFloat(item.hourlyRate || "0") || 0;
      return h * r;
    } else {
      const q = parseFloat(item.quantity || "0") || 0;
      const p = parseFloat(item.unitPrice || "0") || 0;
      return q * p;
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={documentType === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDocumentType(0)}
                  className={documentType === 0 ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <Calculator className="w-4 h-4 mr-1" />
                  Cotización
                </Button>
                <Button
                  type="button"
                  variant={documentType === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDocumentType(1)}
                  className={documentType === 1 ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <Receipt className="w-4 h-4 mr-1" />
                  Factura
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
                <span className="font-medium text-right max-w-[60%]">{request.description}</span>
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

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Detalle de Servicios y Materiales</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => addItem(0)}>
                    <Wrench className="w-4 h-4 mr-1" />
                    Servicio
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addItem(1)}>
                    <Package className="w-4 h-4 mr-1" />
                    Material
                  </Button>
                </div>
              </div>

              {items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">Item {index + 1}</h5>
                      <Select
                        value={item.itemType.toString()}
                        onValueChange={(value) => updateItem(index, "itemType", parseInt(value) as DocumentItemType)}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">
                            <div className="flex items-center gap-2">
                              <Wrench className="w-3 h-3" />
                              Servicio
                            </div>
                          </SelectItem>
                          <SelectItem value="1">
                            <div className="flex items-center gap-2">
                              <Package className="w-3 h-3" />
                              Material
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Descripción del item"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                    />

                    {item.itemType === 0 ? (
                      // Service fields
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Horas"
                          type="number"
                          step="0.5"
                          min="0"
                          value={item.hours}
                          onChange={(e) => updateItem(index, "hours", e.target.value)}
                        />
                        <Input
                          placeholder="Tarifa/hora ($)"
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.hourlyRate}
                          onChange={(e) => updateItem(index, "hourlyRate", e.target.value)}
                        />
                      </div>
                    ) : (
                      // Material fields
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Cantidad"
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        />
                        <Input
                          placeholder="Unidad (kg, m, etc.)"
                          value={item.unit}
                          onChange={(e) => updateItem(index, "unit", e.target.value)}
                        />
                        <Input
                          placeholder="Precio/unidad ($)"
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                        />
                      </div>
                    )}

                    {getItemSubtotal(item) > 0 && (
                      <div className="text-right text-sm font-medium text-green-600">
                        Subtotal: ${getItemSubtotal(item).toFixed(2)}
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
              {loading ? "Enviando..." : `Enviar ${documentType === 0 ? "Cotización" : "Factura"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
