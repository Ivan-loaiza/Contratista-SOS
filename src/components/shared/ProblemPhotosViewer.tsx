import { useState, useEffect } from "react";
import { ImageIcon, X, ZoomIn } from "lucide-react";
import { getProblemPhotos, type PhotoResponseDto } from "@/services/ServiceRequestApi";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProblemPhotosViewerProps {
  requestId: number;
}

export const ProblemPhotosViewer = ({ requestId }: ProblemPhotosViewerProps) => {
  const [photos, setPhotos] = useState<PhotoResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoResponseDto | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const data = await getProblemPhotos(requestId);
        setPhotos(data);
      } catch (error) {
        console.error("Error al cargar las fotos:", error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [requestId]);

  if (loading) {
    return (
      <div className="space-y-2">
        <h4 className="font-semibold flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Fotos del Problema
        </h4>
        <div className="pl-6">
          <p className="text-sm text-gray-500">Cargando fotos...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return null; // No mostrar nada si no hay fotos
  }

  return (
    <>
      <div className="space-y-2">
        <h4 className="font-semibold flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Fotos del Problema ({photos.length})
        </h4>
        <div className="pl-6">
          <p className="text-xs text-gray-500 mb-3">
            Subidas por {photos[0]?.uploaderName} el{" "}
            {new Date(photos[0]?.uploadedAt).toLocaleDateString()}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div
                key={photo.photoId}
                className="relative group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.photoUrl}
                  alt={photo.fileName}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200
                    hover:border-blue-500 transition-all duration-200"
                />
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                  transition-opacity rounded-lg flex items-center justify-center"
                >
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para ver foto en grande */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Foto del Problema</h3>
                  <p className="text-sm text-gray-500">
                    Subida por {selectedPhoto.uploaderName} el{" "}
                    {new Date(selectedPhoto.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.fileName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{selectedPhoto.fileName}</span>
                <a
                  href={selectedPhoto.photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Abrir en nueva pestaña
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
