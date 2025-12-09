# 📱 Documentación API - Módulo Cliente
## Guía completa para migración a Flutter

---

## 📋 Tabla de Contenidos

1. [Configuración Base](#configuración-base)
2. [Autenticación](#autenticación)
3. [Solicitudes de Servicio](#solicitudes-de-servicio)
4. [Gestión de Documentos](#gestión-de-documentos)
5. [Contratistas y Servicios](#contratistas-y-servicios)
6. [Favoritos](#favoritos)
7. [Calificaciones](#calificaciones)
8. [Fotos](#fotos)
9. [Modelos de Datos](#modelos-de-datos)
10. [Flujos Principales](#flujos-principales)

---

## 🔧 Configuración Base

### Base URL
```
https://render-deploy-latest.onrender.com/api
```

### Headers Requeridos
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

### Autenticación
- Todos los endpoints (excepto login y register) requieren token JWT
- El token se obtiene al hacer login y debe incluirse en el header `Authorization`
- Formato: `Bearer {token}`
- El token se almacena localmente tras login exitoso

---

## 🔐 Autenticación

### 1. Registro de Usuario
**Endpoint:** `POST /User/register`

**Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "client"
}
```

**Respuesta:**
```json
{
  "token": "string",
  "fullName": "string",
  "email": "string",
  "roles": ["client"]
}
```

**Notas:**
- Email se normaliza a lowercase
- Role puede ser "client" o "contractor"
- Algunos backends pueden retornar void, validar respuesta

---

### 2. Login de Usuario
**Endpoint:** `POST /User/login`

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Respuesta:**
```json
{
  "token": "string",
  "fullName": "string",
  "email": "string",
  "roles": ["client"]
}
```

**Notas:**
- Guardar el token localmente para futuras peticiones
- El rol determina si el usuario es cliente o contratista

---

## 📋 Solicitudes de Servicio

### 3. Crear Solicitud de Servicio
**Endpoint:** `POST /ServiceRequest`

**Body:**
```json
{
  "clientId": 0,
  "serviceId": 0,
  "contractorId": null,
  "description": "string",
  "location": "string",
  "urgency": "Alta",
  "estimatedDuration": "2 horas",
  "budget": "$150",
  "requestDate": "2025-01-15T10:00:00Z",
  "serviceDate": null,
  "isActive": true
}
```

**Respuesta:**
```json
{
  "requestId": 0,
  "clientId": 0,
  "clientName": "string",
  "serviceName": "string",
  "description": "string",
  "location": "string",
  "urgency": "Alta",
  "estimatedDuration": "2 horas",
  "budget": "$150",
  "requestTime": "2025-01-15T10:00:00Z"
}
```

**Valores de urgencia:** `"Alta"`, `"Media"`, `"Baja"`

---

### 4. Obtener Todas las Solicitudes
**Endpoint:** `GET /ServiceRequest`

**Respuesta:** Array de solicitudes (mismo formato que crear)

---

### 5. Obtener Solicitudes del Contratista
**Endpoint:** `GET /ServiceRequest/by-contractor/{contractorId}`

**Respuesta:**
```json
[
  {
    "requestId": 0,
    "clientId": 0,
    "clientName": "string",
    "contractorId": 0,
    "contractorName": "string",
    "contractorAvatarUrl": "string",
    "serviceId": 0,
    "serviceName": "string",
    "description": "string",
    "location": "string",
    "urgency": "Alta",
    "additionalDetails": "string",
    "budget": "$150",
    "requestDate": "2025-01-15T10:00:00Z",
    "serviceDate": null,
    "isActive": true,
    "status": "Pendiente",
    "scheduledVisitDate": null,
    "scheduledVisitTime": null,
    "visitNotes": null,
    "hasRating": false,
    "ratingStars": null,
    "proformaDocumentUrl": null,
    "completedDate": null,
    "paymentStatus": "Pendiente",
    "paymentProofUrl": null,
    "acceptedDate": null,
    "proformaUploadedDate": null,
    "paidDate": null,
    "paymentMethod": null
  }
]
```

**Estados posibles:** `"Pendiente"`, `"Aceptada"`, `"Finalizada"`, `"Cancelada"`

---

### 6. Aceptar Solicitud (Contratista)
**Endpoint:** `POST /ServiceRequest/{requestId}/accept`

**Body:**
```json
{
  "contractorId": 0,
  "contractorName": "string",
  "scheduledVisitDate": "2025-01-20",
  "scheduledVisitTime": "10:00",
  "visitNotes": "string"
}
```

**Respuesta:**
```json
{
  "ok": true,
  "requestId": 0,
  "clientId": 0,
  "contractorId": 0,
  "contractorName": "string"
}
```

---

### 7. Cancelar Solicitud (Cliente)
**Endpoint:** `POST /ServiceRequest/{requestId}/cancel`

**Body:**
```json
{
  "clientId": 0
}
```

**Respuesta:**
```json
{
  "message": "string"
}
```

---

### 8. Marcar como Completada (Contratista)
**Endpoint:** `POST /ServiceRequest/{requestId}/mark-completed`

**Body:**
```json
{
  "contractorId": 0
}
```

**Respuesta:**
```json
{
  "message": "string"
}
```

---

### 9. Registrar Pago (Cliente)
**Endpoint:** `POST /ServiceRequest/{requestId}/register-payment`

**Body:**
```json
{
  "clientId": 0,
  "paymentMethod": "Efectivo",
  "paymentProofUrl": "string"
}
```

**Métodos de pago:** `"Efectivo"`, `"Transferencia"`

**Respuesta:**
```json
{
  "message": "string"
}
```

---

### 10. Programar Visita (Contratista)
**Endpoint:** `POST /ServiceRequest/{requestId}/schedule-visit`

**Body:**
```json
{
  "contractorId": 0,
  "visitDate": "2025-01-20",
  "visitTime": "10:00",
  "notes": "string"
}
```

**Respuesta:**
```json
{
  "message": "string"
}
```

---

### 11. Historial de Solicitudes del Cliente
**Endpoint:** `GET /ServiceRequest/by-client/{clientId}`

**Respuesta:** Array de `ServiceRequestHistory` (ver sección de modelos)

---

## 📄 Gestión de Documentos

### 12. Obtener Documentos del Cliente
**Endpoint:** `GET /Documents/mine?clientId={clientId}`

**Respuesta:**
```json
[
  {
    "id": 0,
    "requestId": 0,
    "contractorId": 0,
    "contractorName": "string",
    "contractorEmail": "string",
    "contractorPhone": "string",
    "contractorAddress": "string",
    "contractorAvatarUrl": "string",
    "kind": "Cotizacion",
    "amount": 0,
    "date": "2025-01-15T10:00:00Z",
    "status": "Pendiente",
    "pdfUrl": "string"
  }
]
```

**Tipos de documento:** `"Cotizacion"`, `"Factura"`, `"Proforma"`
**Estados:** `"Pendiente"`, `"Pagada"`, `"Enviada"`, `"Revision"`

---

### 13. Obtener Documentos del Contratista
**Endpoint:** `GET /Documents/contractor/{contractorId}`

**Respuesta:** Array de documentos completos

---

### 14. Obtener Documento por ID
**Endpoint:** `GET /Documents/{documentId}`

**Respuesta:** Documento completo con items

---

### 15. Crear Documento
**Endpoint:** `POST /Documents?contractorId={contractorId}`

**Body:**
```json
{
  "requestId": 0,
  "clientId": 0,
  "contractorId": 0,
  "kind": 0,
  "total": 0,
  "items": [
    {
      "itemType": 0,
      "description": "string",
      "hours": 0,
      "hourlyRate": 0,
      "quantity": 0,
      "unit": "string",
      "unitPrice": 0
    }
  ],
  "notes": "string"
}
```

**Valores de kind:** `0 = Cotizacion`, `1 = Factura`
**Valores de itemType:** `0 = Service`, `1 = Material`

**Respuesta:** Documento creado

---

### 16. Obtener Documentos por Solicitud
**Endpoint:** `GET /Documents/by-request/{requestId}`

**Respuesta:** Array de documentos de la solicitud

---

### 17. Actualizar Estado de Documento
**Endpoint:** `PUT /Documents/{documentId}/status`

**Body:**
```json
{
  "status": "Pagada"
}
```

**Respuesta:** Documento actualizado

---

### 18. Registrar Pago de Documento
**Endpoint:** `POST /Documents/{documentId}/pay`

**Body:**
```json
{
  "clientId": 0,
  "paymentMethod": "Efectivo",
  "paymentProofUrl": "string",
  "notes": "string"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "string",
  "documentId": 0,
  "requestId": 0,
  "paymentStatus": "string",
  "paymentMethod": "string",
  "paidDate": "2025-01-15T10:00:00Z"
}
```

---

### 19. Eliminar Documento
**Endpoint:** `DELETE /Documents/{documentId}`

**Respuesta:** `204 No Content`

---

## 👷 Contratistas y Servicios

### 20. Obtener Todos los Contratistas
**Endpoint:** `GET /Contractor`

**Respuesta:**
```json
[
  {
    "contractorId": 0,
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "avatarUrl": "string",
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "services": [
      {
        "serviceId": 0,
        "serviceName": "string"
      }
    ],
    "averageRating": 0,
    "totalRatings": 0,
    "completedServices": 0
  }
]
```

---

### 21. Obtener Contratista por ID
**Endpoint:** `GET /Contractor/{contractorId}`

**Respuesta:** Mismo formato que el endpoint anterior (objeto único)

---

### 22. Listar Todos los Servicios
**Endpoint:** `GET /Service`

**Respuesta:**
```json
[
  {
    "serviceId": 0,
    "name": "string",
    "description": "string"
  }
]
```

---

### 23. Obtener Contratistas por Servicio
**Endpoint:** `GET /ContractorService/service/{serviceId}`

**Respuesta:**
```json
{
  "isSuccess": true,
  "data": [
    "string"
  ]
}
```

**Nota:** Retorna array de nombres de contratistas como strings

---

### 24. Listar Servicios de un Contratista
**Endpoint:** `GET /ContractorService/{contractorId}`

**Respuesta:**
```json
[
  {
    "contractorId": 0,
    "contractor": {
      "userId": 0,
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "address": "string",
      "avatarUrl": "string",
      "userRoles": [
        {
          "name": "string"
        }
      ]
    },
    "serviceId": 0,
    "service": {
      "serviceId": 0,
      "name": "string",
      "description": "string"
    }
  }
]
```

---

### 25. Listar Relaciones Contratista-Servicio
**Endpoint:** `GET /ContractorService`

**Respuesta:** Array del formato anterior

---

### 26. Asignar Servicio a Contratista
**Endpoint:** `POST /ContractorService`

**Body:**
```json
{
  "contractorId": 0,
  "serviceId": 0
}
```

**Respuesta:** Relación creada

---

### 27. Eliminar Servicio Asignado
**Endpoint:** `DELETE /ContractorService/{id}`

**Respuesta:** `204 No Content`

---

## ⭐ Favoritos

### 28. Obtener Favoritos del Cliente
**Endpoint:** `GET /FavoriteContractor/client/{clientId}`

**Respuesta:**
```json
[
  {
    "id": 0,
    "clientId": 0,
    "clientName": "string",
    "contractorId": 0,
    "contractorName": "string",
    "contractorEmail": "string",
    "contractorPhone": "string",
    "contractorAvatarUrl": "string",
    "createdAt": "2025-01-15T10:00:00Z",
    "notes": "string",
    "isActive": true,
    "totalServicesCompleted": 0,
    "averageRating": 0
  }
]
```

---

### 29. Obtener Más Solicitados
**Endpoint:** `GET /FavoriteContractor/client/{clientId}/most-requested?topN=10`

**Query Params:**
- `topN`: Número de resultados (default: 10)

**Respuesta:**
```json
[
  {
    "contractorId": 0,
    "contractorName": "string",
    "contractorEmail": "string",
    "contractorPhone": "string",
    "contractorAvatarUrl": "string",
    "totalRequests": 0,
    "lastRequestDate": "2025-01-15T10:00:00Z",
    "averageRating": 0,
    "isFavorite": true
  }
]
```

---

### 30. Agregar a Favoritos
**Endpoint:** `POST /FavoriteContractor`

**Body:**
```json
{
  "clientId": 0,
  "contractorId": 0,
  "notes": "string"
}
```

**Respuesta:** Favorito creado (formato de endpoint 28)

---

### 31. Remover de Favoritos
**Endpoint:** `DELETE /FavoriteContractor/{id}`

**Respuesta:** `204 No Content`

**Nota:** Es soft delete, solo marca como inactivo

---

### 32. Actualizar Notas de Favorito
**Endpoint:** `PATCH /FavoriteContractor/{id}/notes`

**Body:**
```json
{
  "notes": "string"
}
```

**Respuesta:** Favorito actualizado

---

### 33. Verificar si es Favorito
**Endpoint:** `GET /FavoriteContractor/client/{clientId}/contractor/{contractorId}/is-favorite`

**Respuesta:**
```json
{
  "isFavorite": true
}
```

---

## ⭐ Calificaciones

### 34. Obtener Resumen de Calificaciones
**Endpoint:** `GET /Rating/contractor/{contractorId}`

**Respuesta:**
```json
{
  "contractorId": 0,
  "contractorName": "string",
  "contractorEmail": "string",
  "contractorPhone": "string",
  "contractorAvatarUrl": "string",
  "averageRating": 0,
  "totalRatings": 0,
  "totalServicesCompleted": 0,
  "fiveStars": 0,
  "fourStars": 0,
  "threeStars": 0,
  "twoStars": 0,
  "oneStar": 0,
  "recentReviews": [
    {
      "ratingId": 0,
      "contractorId": 0,
      "contractorName": "string",
      "contractorAvatarUrl": "string",
      "clientId": 0,
      "clientName": "string",
      "requestId": 0,
      "serviceName": "string",
      "stars": 0,
      "comment": "string",
      "date": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### 35. Obtener Todas las Calificaciones
**Endpoint:** `GET /Rating/contractor/{contractorId}/all?limit=10`

**Query Params:**
- `limit`: Número máximo de resultados (opcional)

**Respuesta:** Array de calificaciones (formato `ContractorRating`)

---

### 36. Crear Calificación
**Endpoint:** `POST /Rating`

**Body:**
```json
{
  "requestId": 0,
  "contractorId": 0,
  "stars": 5,
  "comment": "string"
}
```

**Validaciones:**
- `stars` debe estar entre 1 y 5
- `requestId` debe existir y estar completado

**Respuesta:** Calificación creada

---

### 37. Verificar si ya Calificó
**Endpoint:** `GET /Rating/check/{requestId}`

**Respuesta:**
```json
{
  "hasRated": true
}
```

---

## 📸 Fotos

### 38. Subir Fotos del Problema
**Endpoint:** `POST /ServiceRequestPhotos/problem`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `RequestId`: number
- `ClientId`: number
- `Photos`: File[] (múltiples archivos)

**Respuesta:**
```json
[
  {
    "photoId": 0,
    "requestId": 0,
    "uploadedBy": 0,
    "uploaderName": "string",
    "roleId": 0,
    "roleName": "string",
    "photoUrl": "string",
    "fileName": "string",
    "photoType": "Problem",
    "uploadedAt": "2025-01-15T10:00:00Z"
  }
]
```

**Tipos de foto:** `"Problem"`, `"Before"`, `"After"`

---

### 39. Obtener Fotos del Problema
**Endpoint:** `GET /ServiceRequestPhotos/problem/{requestId}`

**Respuesta:** Array de fotos (mismo formato que endpoint 38)

---

## 📦 Modelos de Datos

### CreateServiceRequestDto
```dart
class CreateServiceRequestDto {
  final int clientId;
  final int serviceId;
  final int? contractorId;
  final String description;
  final String location;
  final String urgency; // "Alta", "Media", "Baja"
  final String estimatedDuration;
  final String budget;
  final String requestDate; // ISO 8601
  final String? serviceDate;
  final bool isActive;
}
```

---

### ServiceRequestHistory
```dart
class ServiceRequestHistory {
  final int requestId;
  final int clientId;
  final String clientName;
  final int? contractorId;
  final String? contractorName;
  final String? contractorAvatarUrl;
  final int serviceId;
  final String serviceName;
  final String description;
  final String location;
  final String urgency;
  final String estimatedDuration;
  final String budget;
  final String requestDate;
  final String? serviceDate;
  final bool isActive;
  final bool hasRating;
  final int? ratingStars;
  final String status; // "Pendiente", "Aceptada", "Finalizada", "Cancelada"
  final String? acceptedDate;
  final String? scheduledVisitDate;
  final String? scheduledVisitTime;
  final String? visitNotes;
  final String? completedDate;
  final String? proformaDocumentUrl;
  final String? proformaUploadedDate;
  final String paymentStatus; // "Pendiente", "Pagado"
  final String paymentMethod; // "Efectivo", "Transferencia"
  final String? paymentProofUrl;
  final String? paidDate;
}
```

---

### ClientDocumentDto
```dart
class ClientDocumentDto {
  final int id;
  final int requestId;
  final int contractorId;
  final String contractorName;
  final String? contractorEmail;
  final String? contractorPhone;
  final String? contractorAddress;
  final String? contractorAvatarUrl;
  final String kind; // "Cotizacion", "Factura", "Proforma"
  final double amount;
  final String date;
  final String status; // "Pendiente", "Pagada", "Enviada", "Revision"
  final String? pdfUrl;
}
```

---

### CreateDocumentDto
```dart
class CreateDocumentDto {
  final int requestId;
  final int clientId;
  final int contractorId;
  final int kind; // 0 = Cotizacion, 1 = Factura
  final double? total;
  final List<CreateDocumentItemDto> items;
  final String? notes;
}

class CreateDocumentItemDto {
  final int itemType; // 0 = Service, 1 = Material
  final String description;
  final double? hours;
  final double? hourlyRate;
  final double? quantity;
  final String? unit;
  final double? unitPrice;
}
```

---

### FavoriteContractorDto
```dart
class FavoriteContractorDto {
  final int id;
  final int clientId;
  final String clientName;
  final int contractorId;
  final String contractorName;
  final String? contractorEmail;
  final String? contractorPhone;
  final String? contractorAvatarUrl;
  final String createdAt;
  final String? notes;
  final bool isActive;
  final int totalServicesCompleted;
  final double averageRating;
}
```

---

### ContractorRatingSummary
```dart
class ContractorRatingSummary {
  final int contractorId;
  final String contractorName;
  final String contractorEmail;
  final String contractorPhone;
  final String? contractorAvatarUrl;
  final double averageRating;
  final int totalRatings;
  final int totalServicesCompleted;
  final int fiveStars;
  final int fourStars;
  final int threeStars;
  final int twoStars;
  final int oneStar;
  final List<ContractorRating> recentReviews;
}

class ContractorRating {
  final int ratingId;
  final int contractorId;
  final String contractorName;
  final String? contractorAvatarUrl;
  final int clientId;
  final String clientName;
  final int requestId;
  final String serviceName;
  final int stars;
  final String? comment;
  final String date;
}
```

---

### CreateRatingDto
```dart
class CreateRatingDto {
  final int requestId;
  final int contractorId;
  final int stars; // 1-5
  final String? comment;
}
```

---

### ContractorWithRating
```dart
class ContractorWithRating {
  final int contractorId;
  final String fullName;
  final String email;
  final String phone;
  final String address;
  final String? avatarUrl;
  final bool isActive;
  final String createdAt;
  final List<ServiceInfo> services;
  final double averageRating;
  final int totalRatings;
  final int completedServices;
}

class ServiceInfo {
  final int serviceId;
  final String serviceName;
}
```

---

### Service
```dart
class Service {
  final int serviceId;
  final String name;
  final String? description;
}
```

---

### PhotoResponseDto
```dart
class PhotoResponseDto {
  final int photoId;
  final int requestId;
  final int uploadedBy;
  final String uploaderName;
  final int roleId;
  final String roleName;
  final String photoUrl;
  final String fileName;
  final String photoType; // "Problem", "Before", "After"
  final String uploadedAt;
}
```

---

## 🔄 Flujos Principales

### Flujo 1: Crear Solicitud de Servicio Completa

1. **Login del cliente** (`POST /User/login`)
2. **Obtener servicios disponibles** (`GET /Service`)
3. **Buscar contratistas por servicio** (`GET /ContractorService/service/{serviceId}`)
4. **Ver perfil del contratista** (`GET /Contractor/{contractorId}`)
5. **Ver calificaciones** (`GET /Rating/contractor/{contractorId}`)
6. **Crear solicitud** (`POST /ServiceRequest`)
7. **Subir fotos del problema** (`POST /ServiceRequestPhotos/problem`)

---

### Flujo 2: Gestión de Documento y Pago

1. **Contratista acepta solicitud** (`POST /ServiceRequest/{requestId}/accept`)
2. **Contratista crea documento (cotización)** (`POST /Documents`)
3. **Cliente visualiza documento** (`GET /Documents/mine?clientId={clientId}`)
4. **Cliente registra pago** (`POST /Documents/{documentId}/pay`)
5. **Cliente califica servicio** (`POST /Rating`)

---

### Flujo 3: Gestión de Favoritos

1. **Ver contratistas más solicitados** (`GET /FavoriteContractor/client/{clientId}/most-requested`)
2. **Verificar si es favorito** (`GET /FavoriteContractor/client/{clientId}/contractor/{contractorId}/is-favorite`)
3. **Agregar a favoritos** (`POST /FavoriteContractor`)
4. **Actualizar notas** (`PATCH /FavoriteContractor/{id}/notes`)
5. **Obtener todos los favoritos** (`GET /FavoriteContractor/client/{clientId}`)

---

### Flujo 4: Ver Historial del Cliente

1. **Obtener historial de solicitudes** (`GET /ServiceRequest/by-client/{clientId}`)
2. **Ver documentos** (`GET /Documents/mine?clientId={clientId}`)
3. **Ver fotos de solicitud específica** (`GET /ServiceRequestPhotos/problem/{requestId}`)

---

## 🔍 Consideraciones para Flutter

### Manejo de Fechas
- Todas las fechas están en formato ISO 8601
- Usar `DateTime.parse()` para convertir strings a DateTime
- Usar `toIso8601String()` para enviar al backend

```dart
DateTime requestDate = DateTime.parse("2025-01-15T10:00:00Z");
String isoDate = DateTime.now().toIso8601String();
```

---

### Manejo de Imágenes
- Para subir fotos usar `multipart/form-data`
- Paquetes recomendados: `http`, `dio`, `image_picker`

```dart
import 'package:http/http.dart' as http;
import 'dart:io';

Future<void> uploadPhotos(int requestId, int clientId, List<File> photos) async {
  var uri = Uri.parse('$baseUrl/ServiceRequestPhotos/problem');
  var request = http.MultipartRequest('POST', uri);

  request.fields['RequestId'] = requestId.toString();
  request.fields['ClientId'] = clientId.toString();

  for (var photo in photos) {
    request.files.add(await http.MultipartFile.fromPath('Photos', photo.path));
  }

  request.headers['Authorization'] = 'Bearer $token';

  var response = await request.send();
}
```

---

### Manejo de Autenticación
- Usar `shared_preferences` o `flutter_secure_storage` para guardar token
- Implementar interceptor para agregar token automáticamente

```dart
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String _tokenKey = 'auth_token';

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }
}
```

---

### Cliente HTTP Recomendado
Usar `dio` para mejor manejo de interceptores:

```dart
import 'package:dio/dio.dart';

class ApiClient {
  late Dio _dio;
  static const String baseUrl = 'https://render-deploy-latest.onrender.com/api';

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      headers: {'Content-Type': 'application/json'},
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await AuthService().getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        // Manejo de errores
        if (error.response?.statusCode == 401) {
          // Token expirado, redirigir a login
        }
        return handler.next(error);
      },
    ));
  }

  Dio get dio => _dio;
}
```

---

### Estados de la UI
Usar `Provider`, `Riverpod`, `Bloc` o `GetX` para manejar estado:

```dart
// Ejemplo con Provider
class ServiceRequestProvider with ChangeNotifier {
  List<ServiceRequestHistory> _requests = [];
  bool _isLoading = false;
  String? _error;

  List<ServiceRequestHistory> get requests => _requests;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchRequests(int clientId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiClient().dio.get('/ServiceRequest/by-client/$clientId');
      _requests = (response.data as List)
          .map((json) => ServiceRequestHistory.fromJson(json))
          .toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

---

## 🎨 Estructura de Carpetas Recomendada

```
lib/
├── main.dart
├── models/
│   ├── service_request.dart
│   ├── document.dart
│   ├── contractor.dart
│   ├── rating.dart
│   ├── favorite.dart
│   └── service.dart
├── services/
│   ├── api_client.dart
│   ├── auth_service.dart
│   ├── service_request_service.dart
│   ├── document_service.dart
│   ├── contractor_service.dart
│   ├── rating_service.dart
│   └── favorite_service.dart
├── providers/
│   ├── auth_provider.dart
│   ├── service_request_provider.dart
│   ├── document_provider.dart
│   └── contractor_provider.dart
├── screens/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── register_screen.dart
│   ├── home/
│   │   └── home_screen.dart
│   ├── service_requests/
│   │   ├── create_request_screen.dart
│   │   ├── request_list_screen.dart
│   │   └── request_detail_screen.dart
│   ├── contractors/
│   │   ├── contractor_list_screen.dart
│   │   └── contractor_profile_screen.dart
│   ├── documents/
│   │   ├── document_list_screen.dart
│   │   └── document_detail_screen.dart
│   └── favorites/
│       └── favorites_screen.dart
└── widgets/
    ├── rating_widget.dart
    ├── photo_uploader.dart
    └── service_card.dart
```

---

## 🚀 Pasos para Implementación

### Fase 1: Configuración Inicial (1-2 días)
1. Crear proyecto Flutter
2. Configurar dependencias (`dio`, `provider`, `shared_preferences`)
3. Implementar `ApiClient` con interceptores
4. Implementar `AuthService`
5. Crear modelos de datos básicos

### Fase 2: Autenticación (1-2 días)
1. Pantallas de login y registro
2. Manejo de tokens
3. Navegación condicional (autenticado/no autenticado)
4. Persistencia de sesión

### Fase 3: Servicios y Contratistas (2-3 días)
1. Listar servicios disponibles
2. Buscar contratistas por servicio
3. Ver perfil del contratista
4. Ver calificaciones del contratista

### Fase 4: Solicitudes de Servicio (3-4 días)
1. Crear solicitud de servicio
2. Subir fotos del problema
3. Ver historial de solicitudes
4. Ver detalles de solicitud
5. Cancelar solicitud
6. Registrar pago

### Fase 5: Documentos (2-3 días)
1. Listar documentos del cliente
2. Ver detalles de documento
3. Descargar PDF
4. Registrar pago de documento

### Fase 6: Favoritos y Calificaciones (2-3 días)
1. Agregar/remover favoritos
2. Ver contratistas favoritos
3. Calificar servicios completados
4. Ver historial de calificaciones

### Fase 7: Pulido y Testing (2-3 días)
1. Manejo de errores
2. Loading states
3. Validaciones
4. Testing
5. Optimización

**Tiempo Total Estimado: 13-20 días**

---

## 📌 Notas Importantes

1. **Validación de Tokens**: Implementar refresh token si el backend lo soporta
2. **Manejo de Errores**: Todos los endpoints pueden retornar errores 401, 403, 404, 500
3. **Caché**: Considerar cachear servicios y contratistas para mejorar performance
4. **Offline Mode**: Implementar modo offline para ver datos previamente cargados
5. **Notificaciones**: El backend tiene soporte para WebSocket/SignalR (investigar implementación en Flutter)
6. **Imágenes**: Comprimir fotos antes de subir para ahorrar ancho de banda
7. **Paginación**: Algunos endpoints pueden necesitar paginación en el futuro
8. **Internacionalización**: Considerar i18n desde el inicio

---

## 🔧 Paquetes Flutter Recomendados

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP
  dio: ^5.4.0

  # State Management
  provider: ^6.1.1
  # O riverpod: ^2.4.9
  # O flutter_bloc: ^8.1.3

  # Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0

  # Images
  image_picker: ^1.0.7
  cached_network_image: ^3.3.1

  # PDF
  flutter_pdfview: ^1.3.2
  path_provider: ^2.1.2

  # UI
  flutter_rating_bar: ^4.0.1
  intl: ^0.19.0

  # Utils
  logger: ^2.0.2+1
  equatable: ^2.0.5
```

---

## 📞 Contacto y Soporte

Para dudas sobre la API, contactar al equipo de backend.
Para issues del proyecto, usar el repositorio de GitHub.

---

**Última actualización:** 2025-01-15
**Versión:** 1.0.0
