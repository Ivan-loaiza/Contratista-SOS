# 🚀 Guía de Implementación: Subida de Imágenes y Google Maps

Esta guía te ayudará a implementar la subida de imágenes al servidor y el selector de ubicación con Google Maps en tu aplicación Flutter (u otro frontend).

---

## 📋 Tabla de Contenidos

1. [Configuración de Google Maps API](#1-configuración-de-google-maps-api)
2. [Implementación de Subida de Imágenes](#2-implementación-de-subida-de-imágenes)
3. [Implementación de Google Maps](#3-implementación-de-google-maps)
4. [Testing y Debugging](#4-testing-y-debugging)

---

## 1. Configuración de Google Maps API

### Paso 1.1: Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Click en el selector de proyectos (parte superior)
3. Click en "NEW PROJECT"
4. Nombre del proyecto: `contratista-sos-maps` (o el que prefieras)
5. Click en "CREATE"

### Paso 1.2: Habilitar APIs Necesarias

1. En el menú lateral, ve a **"APIs & Services"** → **"Library"**
2. Busca y habilita las siguientes APIs:

#### Maps JavaScript API (para web)
- Busca: "Maps JavaScript API"
- Click en "ENABLE"
- **Uso**: Renderizar el mapa interactivo en el navegador

#### Geocoding API
- Busca: "Geocoding API"
- Click en "ENABLE"
- **Uso**: Convertir coordenadas (lat/lng) a direcciones legibles

#### Maps SDK for Android (si usas Flutter)
- Busca: "Maps SDK for Android"
- Click en "ENABLE"
- **Uso**: Mapa nativo en Android

#### Maps SDK for iOS (si usas Flutter)
- Busca: "Maps SDK for iOS"
- Click en "ENABLE"
- **Uso**: Mapa nativo en iOS

### Paso 1.3: Crear API Key

1. Ve a **"APIs & Services"** → **"Credentials"**
2. Click en **"+ CREATE CREDENTIALS"** → **"API Key"**
3. Se generará una API Key, **cópiala**
4. Click en "EDIT API KEY" para configurar restricciones

### Paso 1.4: Configurar Restricciones (Recomendado para producción)

#### Para desarrollo/testing:
Deja sin restricciones o agrega:
- **Application restrictions**: None
- **API restrictions**: Restrict key
  - Selecciona solo las APIs que habilitaste

#### Para producción:
- **Application restrictions**: HTTP referrers (web sites)
  - Agrega: `localhost:*`, `127.0.0.1:*`, `yourdomain.com/*`
- **API restrictions**: Restrict key
  - Selecciona: Maps JavaScript API, Geocoding API

### Paso 1.5: Guardar API Key

**Para React/Vite:**
```env
VITE_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
```

**Para Flutter:**
```yaml
# android/app/src/main/AndroidManifest.xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="TU_API_KEY_AQUI"/>

# ios/Runner/AppDelegate.swift
GMSServices.provideAPIKey("TU_API_KEY_AQUI")
```

---

## 2. Implementación de Subida de Imágenes

### 2.1 Endpoint del Backend

**URL**: `POST /api/ServiceRequestPhotos/problem`

**Headers**:
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Form Data**:
- `RequestId`: number
- `ClientId`: number
- `Photos`: File[] (uno o múltiples archivos)

**Respuesta exitosa (200)**:
```json
[
  {
    "photoId": 1,
    "requestId": 123,
    "uploadedBy": 456,
    "uploaderName": "Juan Pérez",
    "roleId": 1,
    "roleName": "Cliente",
    "photoUrl": "https://example.com/photos/abc123.jpg",
    "fileName": "problem_photo_1.jpg",
    "photoType": "Problem",
    "uploadedAt": "2025-01-15T10:30:00Z"
  }
]
```

---

### 2.2 Implementación en React/TypeScript

#### Componente de Selector de Fotos

```typescript
// components/PhotoUploader.tsx
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

    // Validar tipo y tamaño de archivo
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
    </div>
  );
};
```

#### Servicio de Subida de Fotos

```typescript
// services/ServiceRequestApi.ts
import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "https://render-deploy-latest.onrender.com"}/api`,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface PhotoResponseDto {
  photoId: number;
  requestId: number;
  uploadedBy: number;
  uploaderName: string;
  roleId: number;
  roleName: string;
  photoUrl: string;
  fileName: string;
  photoType: "Problem" | "Before" | "After";
  uploadedAt: string;
}

export async function uploadProblemPhotos(
  requestId: number,
  clientId: number,
  photos: File[]
): Promise<PhotoResponseDto[]> {
  const formData = new FormData();
  formData.append("RequestId", requestId.toString());
  formData.append("ClientId", clientId.toString());

  photos.forEach((photo) => {
    formData.append("Photos", photo);
  });

  const res = await API.post("/ServiceRequestPhotos/problem", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function getProblemPhotos(requestId: number): Promise<PhotoResponseDto[]> {
  const res = await API.get(`/ServiceRequestPhotos/problem/${requestId}`);
  return res.data;
}
```

#### Hook para Usar en el Formulario

```typescript
// hooks/useServiceRequest.ts
import { useState } from "react";
import { createServiceRequest, uploadProblemPhotos } from "@/services/ServiceRequestApi";
import type { CreateServiceRequestDto } from "@/types/service-request";

export function useServiceRequest() {
  const [loading, setLoading] = useState(false);

  const requestService = async (
    payload: CreateServiceRequestDto,
    problemPhotos?: File[]
  ) => {
    try {
      setLoading(true);

      // 1. Crear la solicitud
      const response = await createServiceRequest(payload);

      // 2. Si hay fotos, subirlas
      if (problemPhotos && problemPhotos.length > 0 && response?.requestId) {
        console.log("📸 Subiendo fotos del problema...");
        try {
          await uploadProblemPhotos(
            response.requestId,
            payload.clientId,
            problemPhotos
          );
          console.log("✅ Fotos subidas exitosamente");
        } catch (photoError) {
          console.error("❌ Error al subir fotos:", photoError);
          // No bloquear la solicitud si fallan las fotos
          alert("La solicitud se creó, pero hubo un error al subir las fotos.");
        }
      }

      return response;
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, requestService };
}
```

#### Uso en el Formulario

```typescript
// components/ServiceRequestForm.tsx
import { useState } from "react";
import { PhotoUploader } from "./PhotoUploader";
import { useServiceRequest } from "@/hooks/useServiceRequest";

export const ServiceRequestForm = () => {
  const { loading, requestService } = useServiceRequest();
  const [problemPhotos, setProblemPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({
    serviceId: 0,
    description: "",
    location: "",
    urgency: "Media",
    budget: "",
  });

  const handleSubmit = async () => {
    const payload = {
      clientId: user.userId,
      serviceId: form.serviceId,
      description: form.description,
      location: form.location,
      urgency: form.urgency,
      budget: form.budget,
      requestDate: new Date().toISOString(),
      serviceDate: null,
      isActive: true,
    };

    await requestService(payload, problemPhotos);
  };

  return (
    <form>
      {/* Otros campos del formulario */}

      <PhotoUploader
        onPhotosChange={setProblemPhotos}
        maxPhotos={5}
        disabled={loading}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Enviando..." : "Solicitar Servicio"}
      </button>
    </form>
  );
};
```

---

### 2.3 Implementación en Flutter

#### Dependencias necesarias

```yaml
# pubspec.yaml
dependencies:
  http: ^1.1.0
  image_picker: ^1.0.7
  dio: ^5.4.0  # Alternativa más completa
```

#### Servicio de Subida de Fotos

```dart
// lib/services/photo_service.dart
import 'dart:io';
import 'package:dio/dio.dart';

class PhotoService {
  final Dio _dio;
  final String baseUrl = 'https://render-deploy-latest.onrender.com/api';

  PhotoService(this._dio);

  Future<List<PhotoResponse>> uploadProblemPhotos({
    required int requestId,
    required int clientId,
    required List<File> photos,
  }) async {
    try {
      final formData = FormData();

      formData.fields.add(MapEntry('RequestId', requestId.toString()));
      formData.fields.add(MapEntry('ClientId', clientId.toString()));

      for (var photo in photos) {
        formData.files.add(MapEntry(
          'Photos',
          await MultipartFile.fromFile(
            photo.path,
            filename: photo.path.split('/').last,
          ),
        ));
      }

      final response = await _dio.post(
        '$baseUrl/ServiceRequestPhotos/problem',
        data: formData,
      );

      return (response.data as List)
          .map((json) => PhotoResponse.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Error al subir fotos: $e');
    }
  }

  Future<List<PhotoResponse>> getProblemPhotos(int requestId) async {
    try {
      final response = await _dio.get(
        '$baseUrl/ServiceRequestPhotos/problem/$requestId',
      );

      return (response.data as List)
          .map((json) => PhotoResponse.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Error al obtener fotos: $e');
    }
  }
}

class PhotoResponse {
  final int photoId;
  final int requestId;
  final int uploadedBy;
  final String uploaderName;
  final int roleId;
  final String roleName;
  final String photoUrl;
  final String fileName;
  final String photoType;
  final String uploadedAt;

  PhotoResponse({
    required this.photoId,
    required this.requestId,
    required this.uploadedBy,
    required this.uploaderName,
    required this.roleId,
    required this.roleName,
    required this.photoUrl,
    required this.fileName,
    required this.photoType,
    required this.uploadedAt,
  });

  factory PhotoResponse.fromJson(Map<String, dynamic> json) {
    return PhotoResponse(
      photoId: json['photoId'],
      requestId: json['requestId'],
      uploadedBy: json['uploadedBy'],
      uploaderName: json['uploaderName'],
      roleId: json['roleId'],
      roleName: json['roleName'],
      photoUrl: json['photoUrl'],
      fileName: json['fileName'],
      photoType: json['photoType'],
      uploadedAt: json['uploadedAt'],
    );
  }
}
```

#### Widget de Selector de Fotos

```dart
// lib/widgets/photo_picker_widget.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class PhotoPickerWidget extends StatefulWidget {
  final Function(List<File>) onPhotosChanged;
  final int maxPhotos;

  const PhotoPickerWidget({
    Key? key,
    required this.onPhotosChanged,
    this.maxPhotos = 5,
  }) : super(key: key);

  @override
  State<PhotoPickerWidget> createState() => _PhotoPickerWidgetState();
}

class _PhotoPickerWidgetState extends State<PhotoPickerWidget> {
  final List<File> _selectedPhotos = [];
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImages() async {
    if (_selectedPhotos.length >= widget.maxPhotos) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Máximo ${widget.maxPhotos} fotos')),
      );
      return;
    }

    final List<XFile> images = await _picker.pickMultiImage();

    if (images.isEmpty) return;

    final remainingSlots = widget.maxPhotos - _selectedPhotos.length;
    final imagesToAdd = images.take(remainingSlots).map((xFile) => File(xFile.path)).toList();

    setState(() {
      _selectedPhotos.addAll(imagesToAdd);
    });

    widget.onPhotosChanged(_selectedPhotos);

    if (images.length > remainingSlots) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Solo se agregaron $remainingSlots fotos')),
      );
    }
  }

  void _removePhoto(int index) {
    setState(() {
      _selectedPhotos.removeAt(index);
    });
    widget.onPhotosChanged(_selectedPhotos);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Fotos del Problema',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            Text(
              '${_selectedPhotos.length}/${widget.maxPhotos}',
              style: const TextStyle(color: Colors.grey),
            ),
          ],
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: _pickImages,
          icon: const Icon(Icons.upload),
          label: Text(
            _selectedPhotos.isEmpty
                ? 'Agregar fotos'
                : 'Agregar más fotos (${widget.maxPhotos - _selectedPhotos.length} restantes)',
          ),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 48),
            side: const BorderSide(style: BorderStyle.solid, width: 2),
          ),
        ),
        const SizedBox(height: 8),
        if (_selectedPhotos.isNotEmpty)
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemCount: _selectedPhotos.length,
            itemBuilder: (context, index) {
              return Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.file(
                      _selectedPhotos[index],
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                    ),
                  ),
                  Positioned(
                    top: -4,
                    right: -4,
                    child: IconButton(
                      icon: const Icon(Icons.cancel, color: Colors.red),
                      onPressed: () => _removePhoto(index),
                    ),
                  ),
                ],
              );
            },
          ),
      ],
    );
  }
}
```

#### Uso en el Formulario

```dart
// lib/screens/service_request_form.dart
import 'dart:io';
import 'package:flutter/material.dart';
import '../widgets/photo_picker_widget.dart';
import '../services/photo_service.dart';
import '../services/service_request_service.dart';

class ServiceRequestForm extends StatefulWidget {
  @override
  State<ServiceRequestForm> createState() => _ServiceRequestFormState();
}

class _ServiceRequestFormState extends State<ServiceRequestForm> {
  List<File> _problemPhotos = [];
  bool _isLoading = false;

  Future<void> _submitRequest() async {
    setState(() => _isLoading = true);

    try {
      // 1. Crear la solicitud
      final request = await ServiceRequestService().createRequest({
        'clientId': currentUserId,
        'serviceId': selectedServiceId,
        'description': descriptionController.text,
        'location': locationController.text,
        'urgency': selectedUrgency,
        'budget': budgetController.text,
      });

      // 2. Subir fotos si hay
      if (_problemPhotos.isNotEmpty) {
        await PhotoService(dio).uploadProblemPhotos(
          requestId: request.requestId,
          clientId: currentUserId,
          photos: _problemPhotos,
        );
      }

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Solicitud creada exitosamente')),
      );

      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Solicitar Servicio')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Otros campos del formulario...

            PhotoPickerWidget(
              onPhotosChanged: (photos) {
                setState(() => _problemPhotos = photos);
              },
              maxPhotos: 5,
            ),

            const SizedBox(height: 16),

            ElevatedButton(
              onPressed: _isLoading ? null : _submitRequest,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Solicitar Servicio'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 3. Implementación de Google Maps

### 3.1 Implementación en React/TypeScript

#### Instalación de Dependencias

```bash
npm install @react-google-maps/api
```

#### Componente de Mapa

```typescript
// components/MapPickerModal.tsx
import { useEffect, useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";

interface MapPickerModalProps {
  onClose: () => void;
  onSelect: (address: string, lat: number, lng: number) => void;
}

export function MapPickerModal({ onClose, onSelect }: MapPickerModalProps) {
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [center, setCenter] = useState({ lat: 9.934739, lng: -84.087502 }); // San José, Costa Rica
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
    } catch (error) {
      console.error("Error al obtener dirección:", error);
      alert("No se pudo obtener la dirección");
    }
  };

  useEffect(() => {
    // Obtener ubicación actual del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCenter({ lat, lng });
          setMarker({ lat, lng });
          map?.panTo({ lat, lng });
        },
        (error) => console.warn("No se pudo obtener la ubicación:", error)
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

        <p className="text-sm text-gray-600 mt-2">
          Haz clic en el mapa para seleccionar la ubicación
        </p>

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
```

#### Uso en el Formulario

```typescript
// components/ServiceRequestForm.tsx
import { useState } from "react";
import { MapPickerModal } from "./MapPickerModal";
import { MapPin } from "lucide-react";

export const ServiceRequestForm = () => {
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <form>
      <div className="space-y-2">
        <label>Ubicación</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Selecciona en el mapa..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="p-2 border rounded"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showMap && (
        <MapPickerModal
          onClose={() => setShowMap(false)}
          onSelect={(address, lat, lng) => {
            setLocation(address);
            setCoordinates({ lat, lng });
            console.log("Ubicación:", { address, lat, lng });
          }}
        />
      )}
    </form>
  );
};
```

---

### 3.2 Implementación en Flutter

#### Dependencias necesarias

```yaml
# pubspec.yaml
dependencies:
  google_maps_flutter: ^2.5.0
  geolocator: ^10.1.0
  geocoding: ^2.1.1
```

#### Configuración Android

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest>
    <application>
        <!-- Agrega tu API Key -->
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="TU_API_KEY_AQUI"/>
    </application>

    <!-- Permisos de ubicación -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET" />
</manifest>
```

#### Configuración iOS

```swift
// ios/Runner/AppDelegate.swift
import UIKit
import Flutter
import GoogleMaps

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("TU_API_KEY_AQUI")
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

```xml
<!-- ios/Runner/Info.plist -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Necesitamos tu ubicación para mostrarte servicios cercanos</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>Necesitamos tu ubicación para mostrarte servicios cercanos</string>
```

#### Widget de Mapa

```dart
// lib/widgets/map_picker_widget.dart
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

class MapPickerWidget extends StatefulWidget {
  final Function(String address, double lat, double lng) onLocationSelected;

  const MapPickerWidget({
    Key? key,
    required this.onLocationSelected,
  }) : super(key: key);

  @override
  State<MapPickerWidget> createState() => _MapPickerWidgetState();
}

class _MapPickerWidgetState extends State<MapPickerWidget> {
  GoogleMapController? _mapController;
  LatLng _center = const LatLng(9.934739, -84.087502); // San José, Costa Rica
  LatLng _selectedPosition = const LatLng(9.934739, -84.087502);
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    try {
      // Verificar permisos
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        setState(() => _isLoading = false);
        return;
      }

      // Obtener ubicación actual
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _center = LatLng(position.latitude, position.longitude);
        _selectedPosition = _center;
        _isLoading = false;
      });

      _mapController?.animateCamera(CameraUpdate.newLatLng(_center));
    } catch (e) {
      print('Error al obtener ubicación: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _onMapTap(LatLng position) async {
    setState(() {
      _selectedPosition = position;
    });
  }

  Future<void> _confirmLocation() async {
    try {
      // Geocoding reverso: convertir coordenadas a dirección
      List<Placemark> placemarks = await placemarkFromCoordinates(
        _selectedPosition.latitude,
        _selectedPosition.longitude,
      );

      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        final address = [
          place.street,
          place.locality,
          place.country,
        ].where((e) => e != null && e.isNotEmpty).join(', ');

        widget.onLocationSelected(
          address.isNotEmpty ? address : 'Ubicación sin nombre',
          _selectedPosition.latitude,
          _selectedPosition.longitude,
        );

        Navigator.pop(context);
      }
    } catch (e) {
      print('Error al obtener dirección: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error al obtener la dirección')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Selecciona tu ubicación'),
        actions: [
          TextButton(
            onPressed: _confirmLocation,
            child: const Text(
              'Confirmar',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : GoogleMap(
              initialCameraPosition: CameraPosition(
                target: _center,
                zoom: 14,
              ),
              onMapCreated: (controller) {
                _mapController = controller;
              },
              onTap: _onMapTap,
              markers: {
                Marker(
                  markerId: const MarkerId('selected_location'),
                  position: _selectedPosition,
                  draggable: true,
                  onDragEnd: (newPosition) {
                    setState(() {
                      _selectedPosition = newPosition;
                    });
                  },
                ),
              },
              myLocationEnabled: true,
              myLocationButtonEnabled: true,
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _confirmLocation,
        label: const Text('Confirmar ubicación'),
        icon: const Icon(Icons.check),
      ),
    );
  }
}
```

#### Uso en el Formulario

```dart
// lib/screens/service_request_form.dart
import 'package:flutter/material.dart';
import '../widgets/map_picker_widget.dart';

class ServiceRequestForm extends StatefulWidget {
  @override
  State<ServiceRequestForm> createState() => _ServiceRequestFormState();
}

class _ServiceRequestFormState extends State<ServiceRequestForm> {
  final _locationController = TextEditingController();
  double? _latitude;
  double? _longitude;

  void _openMapPicker() async {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => MapPickerWidget(
          onLocationSelected: (address, lat, lng) {
            setState(() {
              _locationController.text = address;
              _latitude = lat;
              _longitude = lng;
            });
            print('Ubicación seleccionada: $address ($lat, $lng)');
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Solicitar Servicio')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Otros campos...

            TextField(
              controller: _locationController,
              decoration: InputDecoration(
                labelText: 'Ubicación',
                hintText: 'Selecciona en el mapa...',
                suffixIcon: IconButton(
                  icon: const Icon(Icons.map),
                  onPressed: _openMapPicker,
                ),
              ),
              readOnly: true,
              onTap: _openMapPicker,
            ),

            const SizedBox(height: 16),

            ElevatedButton(
              onPressed: () {
                // Enviar solicitud con la ubicación
                print('Ubicación: ${_locationController.text}');
                print('Coordenadas: $_latitude, $_longitude');
              },
              child: const Text('Solicitar Servicio'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 4. Testing y Debugging

### 4.1 Testing de Subida de Imágenes

#### Checklist de Pruebas

- [ ] Seleccionar 1 imagen
- [ ] Seleccionar múltiples imágenes (hasta el máximo)
- [ ] Intentar subir más del máximo (debe mostrar error)
- [ ] Intentar subir archivo no-imagen (debe mostrar error)
- [ ] Intentar subir archivo mayor a 10MB (debe mostrar error)
- [ ] Remover una imagen seleccionada
- [ ] Ver preview de imágenes seleccionadas
- [ ] Enviar formulario con imágenes
- [ ] Verificar que las imágenes se suban al servidor
- [ ] Verificar que se reciban las URLs de las imágenes

#### Debugging en Consola del Navegador

```javascript
// Deberías ver:
"📸 Subiendo fotos del problema..."
"✅ Fotos subidas exitosamente"

// Si hay error:
"❌ Error al subir fotos: [detalle del error]"
```

#### Verificar Request en Network Tab

1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Filtra por "Fetch/XHR"
4. Busca el request a `/ServiceRequestPhotos/problem`
5. Verifica:
   - **Method**: POST
   - **Content-Type**: multipart/form-data
   - **Request Payload**: Debe incluir `RequestId`, `ClientId`, y archivos en `Photos`
   - **Response**: Debe ser 200 OK con array de fotos

---

### 4.2 Testing de Google Maps

#### Checklist de Pruebas

- [ ] Abrir selector de mapa
- [ ] Ver mapa cargado correctamente
- [ ] Mapa centrado en ubicación actual del usuario
- [ ] Hacer clic en el mapa para colocar marcador
- [ ] Arrastrar marcador a otra ubicación
- [ ] Confirmar ubicación
- [ ] Verificar que se muestre la dirección en el campo
- [ ] Verificar que se guarden las coordenadas (lat/lng)

#### Errores Comunes de Google Maps

**Error 1: "Google Maps JavaScript API error: RefererNotAllowedMapError"**
- **Causa**: Tu dominio no está autorizado en la API Key
- **Solución**: Ve a Google Cloud Console → Credentials → Edit API Key → Application restrictions → Agrega tu dominio

**Error 2: "Google Maps JavaScript API error: ApiNotActivatedMapError"**
- **Causa**: No has habilitado Maps JavaScript API
- **Solución**: Ve a Google Cloud Console → APIs & Services → Library → Busca "Maps JavaScript API" → Enable

**Error 3: "Geocoding Service: This API project is not authorized to use this API"**
- **Causa**: No has habilitado Geocoding API
- **Solución**: Ve a Google Cloud Console → APIs & Services → Library → Busca "Geocoding API" → Enable

**Error 4: Mapa aparece gris/en blanco**
- **Causa**: API Key inválida o sin permisos
- **Solución**: Verifica que tu API Key esté correcta y tenga las restricciones adecuadas

#### Debugging en Consola del Navegador

```javascript
// Para verificar que la API Key se está cargando:
console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

// Para verificar el geocoding:
fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=9.934739,-84.087502&key=TU_API_KEY`)
  .then(r => r.json())
  .then(d => console.log(d));

// Respuesta esperada:
{
  "results": [
    {
      "formatted_address": "Dirección completa...",
      ...
    }
  ],
  "status": "OK"
}
```

---

### 4.3 Testing en Flutter

#### Android

```bash
# Ejecutar en dispositivo/emulador
flutter run

# Ver logs
flutter logs

# Debugging con permisos
adb logcat | grep -i "location\|permission"
```

#### iOS

```bash
# Ejecutar en simulador
flutter run

# Ver logs
flutter logs
```

#### Errores Comunes en Flutter

**Error 1: "MissingPluginException(No implementation found for method...)"**
- **Causa**: No se registraron los plugins correctamente
- **Solución**:
  ```bash
  flutter clean
  flutter pub get
  cd ios && pod install && cd ..  # Solo iOS
  flutter run
  ```

**Error 2: Google Maps no se muestra en Android**
- **Causa**: API Key no configurada en AndroidManifest.xml
- **Solución**: Verifica que la API Key esté en `android/app/src/main/AndroidManifest.xml`

**Error 3: Permisos de ubicación denegados**
- **Causa**: Usuario negó los permisos
- **Solución**: Solicitar permisos nuevamente o guiar al usuario a Settings

---

## 📝 Resumen de Configuración

### Variables de Entorno Necesarias

**React/Vite (.env)**:
```env
VITE_API_BASE_URL=https://render-deploy-latest.onrender.com
VITE_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
```

**Flutter (config)**:
```dart
// lib/config/app_config.dart
class AppConfig {
  static const String apiBaseUrl = 'https://render-deploy-latest.onrender.com';
  static const String googleMapsApiKey = 'TU_API_KEY_AQUI';
}
```

### APIs de Google Cloud que Necesitas Habilitar

1. ✅ **Maps JavaScript API** (para web)
2. ✅ **Geocoding API** (para convertir coordenadas a direcciones)
3. ✅ **Maps SDK for Android** (para Flutter Android)
4. ✅ **Maps SDK for iOS** (para Flutter iOS)

### Endpoints del Backend

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/api/ServiceRequestPhotos/problem` | POST | Subir fotos del problema |
| `/api/ServiceRequestPhotos/problem/{requestId}` | GET | Obtener fotos de una solicitud |

---

## 🎯 Próximos Pasos

1. **Configurar Google Maps API Key**
   - Crear proyecto en Google Cloud Console
   - Habilitar las 4 APIs necesarias
   - Crear API Key con restricciones

2. **Implementar Subida de Imágenes**
   - Copiar el código del componente PhotoUploader
   - Copiar el servicio de upload
   - Integrar en tu formulario

3. **Implementar Google Maps**
   - Copiar el componente MapPickerModal
   - Configurar API Key en tu proyecto
   - Integrar en tu formulario

4. **Testing**
   - Probar subida de imágenes
   - Probar selector de mapa
   - Verificar en Network tab que las peticiones sean correctas

---

## 🆘 Soporte

### Documentación Oficial

- [Google Maps API Docs](https://developers.google.com/maps/documentation)
- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)
- [Flutter Google Maps](https://pub.dev/packages/google_maps_flutter)
- [Image Picker Flutter](https://pub.dev/packages/image_picker)
- [Dio HTTP Client](https://pub.dev/packages/dio)

### Solución de Problemas

Si encuentras errores:

1. **Verifica la consola del navegador** para errores de JavaScript
2. **Verifica la pestaña Network** para ver las peticiones HTTP
3. **Verifica los logs del backend** para errores del servidor
4. **Verifica Google Cloud Console** para errores de API Key

---

**¡Éxito con tu implementación!** 🚀
