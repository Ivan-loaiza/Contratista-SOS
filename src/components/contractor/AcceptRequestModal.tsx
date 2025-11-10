// src/components/contractor/AcceptRequestModal.tsx
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
import { Calendar, Clock, FileText, User } from "lucide-react";
import type { PendingRequest } from "./PendingRequestsList";

interface AcceptRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PendingRequest | null;
  contractorId: number;
  contractorName: string;
  onAccept: (data: {
    contractorId: number;
    contractorName: string;
    scheduledVisitDate: string;
    scheduledVisitTime: string;
    visitNotes: string;
  }) => Promise<void>;
}

export function AcceptRequestModal({
  isOpen,
  onClose,
  request,
  contractorId,
  contractorName,
  onAccept,
}: AcceptRequestModalProps) {
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!request) return;

    // Validar que la fecha y hora estén llenas
    if (!visitDate || !visitTime) {
      alert("Por favor ingresa la fecha y hora de la visita");
      return;
    }

    try {
      setLoading(true);

      // Convertir la fecha a formato ISO
      const isoDate = new Date(`${visitDate}T${visitTime}`).toISOString();

      await onAccept({
        contractorId,
        contractorName,
        scheduledVisitDate: isoDate,
        scheduledVisitTime: visitTime,
        visitNotes: visitNotes.trim(),
      });

      // Limpiar formulario y cerrar - el onAccept ya manejó todo
      setVisitDate("");
      setVisitTime("");
      setVisitNotes("");
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Error accepting request:", error);
      setLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Aceptar Solicitud y Programar Visita
            </DialogTitle>
            <DialogDescription>
              {request.serviceName} • {request.clientName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Información de la solicitud */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <h4 className="font-semibold">Detalles de la Solicitud</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium ml-2">{request.clientName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className="font-medium ml-2">{request.serviceName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ubicación:</span>
                  <span className="font-medium ml-2">{request.location}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Urgencia:</span>
                  <span className="font-medium ml-2">{request.urgency}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Presupuesto:</span>
                  <span className="font-medium ml-2">{request.budget}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duración:</span>
                  <span className="font-medium ml-2">{request.estimatedDuration}</span>
                </div>
              </div>
              {request.description && (
                <div className="pt-2">
                  <span className="text-muted-foreground">Descripción:</span>
                  <p className="text-sm mt-1">{request.description}</p>
                </div>
              )}
            </div>

            {/* Información del contratista */}
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Contratista:</span>
                <span>{contractorName}</span>
              </div>
            </div>

            {/* Fecha de visita */}
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

            {/* Hora de visita */}
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

            {/* Notas de visita */}
            <div className="space-y-2">
              <Label htmlFor="visitNotes" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notas para el Cliente
              </Label>
              <Textarea
                id="visitNotes"
                placeholder="Ej: Traer herramientas específicas, acceso por entrada lateral, etc."
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {visitNotes.length}/500 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !visitDate || !visitTime}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Aceptando..." : "Aceptar y Programar Visita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
