// src/components/client/RegisterPaymentModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Upload, Loader2, AlertCircle } from "lucide-react";
import type { ServiceRequestHistory } from "@/types/service-request";
import { registerPayment } from "@/services/ServiceRequestApi";
import { toast } from "sonner";

interface RegisterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequestHistory;
  clientId: number;
  onSuccess: () => void;
}

export const RegisterPaymentModal = ({
  isOpen,
  onClose,
  request,
  clientId,
  onSuccess,
}: RegisterPaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Transferencia">("Efectivo");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("El archivo no puede superar los 5MB");
        return;
      }

      // Validar tipo
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        setError("Solo se permiten archivos JPG, PNG o PDF");
        return;
      }

      setProofFile(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    // Validación
    if (paymentMethod === "Transferencia" && !proofFile && !proofUrl) {
      setError("Debes adjuntar un comprobante de pago para transferencia");
      return;
    }

    try {
      setIsSubmitting(true);

      let finalProofUrl = proofUrl;

      // Si hay archivo, subirlo primero
      if (proofFile) {
        // TODO: Implementar subida de archivo al servidor
        // Por ahora, usar una URL temporal o simular
        // En producción, esto debería llamar a un endpoint de upload
        finalProofUrl = URL.createObjectURL(proofFile);

        // Ejemplo de cómo sería con un endpoint real:
        // const formData = new FormData();
        // formData.append("file", proofFile);
        // const uploadResponse = await uploadFile(formData);
        // finalProofUrl = uploadResponse.url;
      }

      // Registrar el pago
      await registerPayment(request.requestId, {
        clientId,
        paymentMethod,
        paymentProofUrl: paymentMethod === "Transferencia" ? finalProofUrl : undefined,
      });

      toast.success("Pago registrado exitosamente");
      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error("Error al registrar pago:", err);
      setError(err.response?.data?.message || "No se pudo registrar el pago");
      toast.error("Error al registrar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPaymentMethod("Efectivo");
    setProofFile(null);
    setProofUrl("");
    setError(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Registrar Pago
          </DialogTitle>
          <DialogDescription>
            Registra el pago del servicio: {request.serviceName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información del servicio */}
          <div className="p-3 bg-gray-50 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium">{request.serviceName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Contratista:</span>
              <span className="font-medium">{request.contractorName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monto:</span>
              <span className="font-semibold text-blue-600">{request.budget}</span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as "Efectivo" | "Transferencia")}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="Efectivo" id="efectivo" />
                <Label htmlFor="efectivo" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Efectivo</p>
                    <p className="text-xs text-gray-500">
                      Pago realizado en efectivo al contratista
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="Transferencia" id="transferencia" />
                <Label htmlFor="transferencia" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Transferencia / Tarjeta</p>
                    <p className="text-xs text-gray-500">
                      Pago electrónico con comprobante
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Comprobante de pago (solo para transferencia) */}
          {paymentMethod === "Transferencia" && (
            <div className="space-y-2">
              <Label htmlFor="proof">Comprobante de Pago *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Input
                  id="proof"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label
                  htmlFor="proof"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div>
                    {proofFile ? (
                      <>
                        <p className="text-sm font-medium text-green-600">
                          {proofFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(proofFile.size / 1024).toFixed(2)} KB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700">
                          Haz clic para seleccionar archivo
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, PNG o PDF (máx. 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </Label>
              </div>
              {proofFile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProofFile(null)}
                  className="w-full"
                >
                  Cambiar archivo
                </Button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              "Registrar Pago"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
