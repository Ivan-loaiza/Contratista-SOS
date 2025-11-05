// src/components/contractor/VisitSchedulerModal.tsx
import { useState } from "react";
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
import { Calendar, Clock, FileText } from "lucide-react";
import type { ContractorServiceRequest } from "@/services/ServiceRequestApi";
import Swal from "sweetalert2";

interface VisitSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ContractorServiceRequest | null;
  onSchedule: (data: {
    requestId: number;
    visitDate: string;
    visitTime: string;
    notes: string;
  }) => Promise<void>;
}

export function VisitSchedulerModal({
  isOpen,
  onClose,
  request,
  onSchedule,
}: VisitSchedulerModalProps) {
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!request) return;

    if (!visitDate || !visitTime) {
      await Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Por favor selecciona fecha y hora de visita",
      });
      return;
    }

    try {
      setLoading(true);
      await onSchedule({
        requestId: request.requestId,
        visitDate,
        visitTime,
        notes: notes.trim(),
      });

      await Swal.fire({
        icon: "success",
        title: "Visita programada",
        html: `
          <div style="text-align:left">
            <p><b>Cliente:</b> ${request.clientName}</p>
            <p><b>Fecha:</b> ${new Date(visitDate).toLocaleDateString()}</p>
            <p><b>Hora:</b> ${visitTime}</p>
          </div>
        `,
      });

      // Reset form
      setVisitDate("");
      setVisitTime("");
      setNotes("");
      onClose();
    } catch (error: any) {
      console.error("Error scheduling visit:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "No se pudo programar la visita",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Programar Visita
            </DialogTitle>
            <DialogDescription>
              {request.serviceName} para {request.clientName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Service Info Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servicio:</span>
                <span className="font-medium">{request.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ubicación:</span>
                <span className="font-medium">{request.location}</span>
              </div>
              {request.additionalDetails && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Detalles adicionales:</span>
                  <span className="font-medium">{request.additionalDetails}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Presupuesto:</span>
                <span className="font-medium">{request.budget}</span>
              </div>
            </div>

            {/* Visit Date */}
            <div className="space-y-2">
              <Label htmlFor="visitDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Visita *
              </Label>
              <Input
                id="visitDate"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* Visit Time */}
            <div className="space-y-2">
              <Label htmlFor="visitTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hora de Visita *
              </Label>
              <Input
                id="visitTime"
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notas para el Cliente
              </Label>
              <Textarea
                id="notes"
                placeholder="Ej: Traer herramientas específicas, acceso por entrada lateral, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/500 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Programando..." : "Programar Visita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
