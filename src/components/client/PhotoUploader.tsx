import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";

interface PhotoUploaderProps {
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export const PhotoUploader = ({
  onPhotosChange,
  maxPhotos = 5,
  disabled = false,
}: PhotoUploaderProps) => {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validar número máximo de fotos
    const totalPhotos = selectedPhotos.length + files.length;
    if (totalPhotos > maxPhotos) {
      alert(`Solo puedes subir hasta ${maxPhotos} fotos`);
      return;
    }

    // Validar tipo de archivo
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10 MB

      if (!isImage) {
        alert(`${file.name} no es una imagen válida`);
        return false;
      }
      if (!isValidSize) {
        alert(`${file.name} excede el tamaño máximo de 10 MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Crear previews
    const newPreviews: string[] = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Actualizar estado
    const updatedPhotos = [...selectedPhotos, ...validFiles];
    setSelectedPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = selectedPhotos.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    setSelectedPhotos(updatedPhotos);
    setPreviews(updatedPreviews);
    onPhotosChange(updatedPhotos);

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Fotos del Problema (Opcional)
        </label>
        <span className="text-xs text-gray-500">
          {selectedPhotos.length}/{maxPhotos} fotos
        </span>
      </div>

      {/* Botón para seleccionar fotos */}
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || selectedPhotos.length >= maxPhotos}
        className="w-full border-dashed border-2"
      >
        <Upload className="w-4 h-4 mr-2" />
        {selectedPhotos.length === 0
          ? "Agregar fotos del problema"
          : `Agregar más fotos (${maxPhotos - selectedPhotos.length} restantes)`}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Preview de fotos seleccionadas */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1
                  opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                <ImageIcon className="w-3 h-3 inline mr-1" />
                {(selectedPhotos[index].size / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <p className="text-xs text-gray-500">
          Estas fotos ayudarán al contratista a entender mejor tu problema
        </p>
      )}
    </div>
  );
};
