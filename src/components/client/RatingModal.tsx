// src/components/client/RatingModal.tsx
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { StarRating } from "./StarRating";
import { createRating, checkIfRated } from "@/services/ratingService";
import type { CreateRatingDto } from "@/types/rating";

interface RatingModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Callback para cerrar el modal */
  onClose: () => void;
  /** ID de la solicitud de servicio */
  requestId: number;
  /** ID del contratista */
  contractorId: number;
  /** Nombre del contratista */
  contractorName: string;
  /** Avatar del contratista */
  contractorAvatarUrl: string | null;
  /** Nombre del servicio */
  serviceName: string;
  /** Fecha del servicio */
  serviceDate: string;
  /** Callback cuando se califica exitosamente */
  onSuccess?: () => void;
}

export const RatingModal = ({
  isOpen,
  onClose,
  requestId,
  contractorId,
  contractorName,
  contractorAvatarUrl,
  serviceName,
  serviceDate,
  onSuccess,
}: RatingModalProps) => {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  // Verificar si ya calificó cuando se abre el modal
  useEffect(() => {
    if (isOpen && requestId) {
      checkAlreadyRated();
    }
  }, [isOpen, requestId]);

  const checkAlreadyRated = async () => {
    try {
      setIsChecking(true);
      const { hasRated } = await checkIfRated(requestId);
      setAlreadyRated(hasRated);

      if (hasRated) {
        toast.info("Ya has calificado este servicio");
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error al verificar calificación:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (stars < 1 || stars > 5) {
      toast.error("Debes seleccionar una calificación entre 1 y 5 estrellas");
      return;
    }

    if (comment.length > 1000) {
      toast.error("El comentario no puede exceder los 1000 caracteres");
      return;
    }

    try {
      setIsSubmitting(true);

      const ratingData: CreateRatingDto = {
        requestId,
        contractorId,
        stars,
        comment: comment.trim() || undefined,
      };

      await createRating(ratingData);

      toast.success("¡Calificación enviada exitosamente!");

      // Limpiar formulario
      setStars(0);
      setComment("");

      // Cerrar modal y ejecutar callback
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error al crear calificación:", error);

      // Manejo de errores específicos
      if (error.response?.status === 409) {
        toast.info("Ya has calificado este servicio previamente");
        onClose();
      } else if (error.response?.status === 404) {
        toast.error("El servicio no existe o ha sido eliminado");
      } else if (error.response?.status === 401) {
        toast.error("Debes iniciar sesión para calificar");
      } else {
        toast.error("Error al enviar la calificación. Intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const remainingChars = 1000 - comment.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Calificar servicio</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia con este servicio
          </DialogDescription>
        </DialogHeader>

        {isChecking ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : alreadyRated ? (
          <div className="py-6 text-center">
            <p className="text-gray-600">Ya has calificado este servicio</p>
          </div>
        ) : (
          <>
            {/* Información del contratista y servicio */}
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={contractorAvatarUrl || undefined} />
                  <AvatarFallback>
                    {contractorName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{contractorName}</h4>
                  <p className="text-xs text-gray-600">{serviceName}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(serviceDate)}
                  </p>
                </div>
              </div>

              {/* Selección de estrellas */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  ¿Cómo calificarías este servicio?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex justify-center py-2">
                  <StarRating
                    rating={stars}
                    size="large"
                    interactive
                    onChange={setStars}
                    showLabel={false}
                  />
                </div>
                {stars > 0 && (
                  <p className="text-center text-sm text-gray-600">
                    {stars === 5 && "¡Excelente!"}
                    {stars === 4 && "Muy bueno"}
                    {stars === 3 && "Bueno"}
                    {stars === 2 && "Regular"}
                    {stars === 1 && "Necesita mejorar"}
                  </p>
                )}
              </div>

              {/* Comentario opcional */}
              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">
                  Comentario (opcional)
                </label>
                <Textarea
                  id="comment"
                  placeholder="Cuéntanos más sobre tu experiencia..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="resize-none"
                />
                <p
                  className={`text-xs text-right ${
                    remainingChars < 100 ? "text-orange-500" : "text-gray-500"
                  }`}
                >
                  {remainingChars} caracteres restantes
                </p>
              </div>
            </div>

            {/* Botones */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Más tarde
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={stars === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar calificación"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
