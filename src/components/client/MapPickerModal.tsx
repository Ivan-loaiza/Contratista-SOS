import { useEffect, useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

interface MapPickerModalProps {
  onClose: () => void;
  onSelect: (address: string, lat: number, lng: number) => void;
}

export function MapPickerModal({ onClose, onSelect }: MapPickerModalProps) {
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [center, setCenter] = useState({ lat: 9.934739, lng: -84.087502 }); // 🇨🇷 San José por defecto
  const [marker, setMarker] = useState(center);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_API_KEY,
  });

  const handleClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarker({ lat, lng });
    }
  }, []);

  const handleConfirm = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${marker.lat},${marker.lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      const address =
        data.results?.[0]?.formatted_address || "Ubicación sin nombre";

      onSelect(address, marker.lat, marker.lng);
      onClose();

      Swal.fire({
        icon: "success",
        title: "Ubicación seleccionada",
        text: address,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al obtener dirección",
        text: "No se pudo obtener la dirección desde Google Maps.",
      });
    }
  };

  useEffect(() => {
    // Centrar mapa en la ubicación actual del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCenter({ lat, lng });
          setMarker({ lat, lng });
          map?.panTo({ lat, lng });
        },
        () => console.warn("No se pudo acceder a la ubicación del usuario")
      );
    }
  }, [map]);

  if (!isLoaded) return <p className="p-4">Cargando mapa...</p>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-4 w-[90%] max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">Selecciona tu ubicación</h2>

        <div className="h-[400px] w-full rounded-lg overflow-hidden">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={14}
            onLoad={setMap}
            onClick={handleClick}
          >
            <Marker position={marker} />
          </GoogleMap>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
            Confirmar ubicación
          </Button>
        </div>
      </div>
    </div>
  );
}
