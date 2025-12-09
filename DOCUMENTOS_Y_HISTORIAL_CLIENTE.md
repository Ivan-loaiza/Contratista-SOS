# 📄 Documentación Completa: Documentos e Historial del Cliente

## Guía de Implementación para Flutter

Esta documentación proporciona toda la información necesaria para implementar los módulos de **Documentos (Cotizaciones/Facturas)** e **Historial de Solicitudes** en Flutter.

---

## 📋 Tabla de Contenidos

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Módulo de Documentos](#módulo-de-documentos)
3. [Módulo de Historial](#módulo-de-historial)
4. [Endpoints de la API](#endpoints-de-la-api)
5. [Modelos de Datos](#modelos-de-datos)
6. [Flujos de Negocio](#flujos-de-negocio)
7. [Implementación en Flutter](#implementación-en-flutter)
8. [Estados y Validaciones](#estados-y-validaciones)

---

## 1. Resumen del Sistema

### 🎯 Propósito

El sistema permite a los **clientes**:
- Ver cotizaciones y facturas enviadas por los contratistas
- Pagar documentos (registrar pagos)
- Ver el historial completo de todas sus solicitudes de servicio
- Ver detalles de cada solicitud (estado, contratista, fechas, pagos, etc.)
- Cancelar solicitudes pendientes o aceptadas
- Registrar pagos de servicios finalizados
- Calificar servicios completados

### 🔄 Relación entre Documentos e Historial

1. **Cliente crea una solicitud de servicio** → Aparece en el Historial con estado "Pendiente"
2. **Contratista acepta la solicitud** → Estado cambia a "Aceptada"
3. **Contratista finaliza el servicio** → Estado cambia a "Finalizada"
4. **Contratista crea un documento** (Cotización/Factura) → Aparece en la pestaña de Documentos
5. **Cliente paga el documento** → Estado del documento cambia a "Pagado"
6. **Cliente califica el servicio** → Se guarda la calificación y aparece en el historial

---

## 2. Módulo de Documentos

### 2.1 ¿Qué son los Documentos?

Los documentos son **Cotizaciones** y **Facturas** que el contratista envía al cliente después de aceptar una solicitud de servicio.

### 2.2 Tipos de Documentos

| Tipo | Código Backend | Descripción |
|------|---------------|-------------|
| **Cotización** | `"Cotizacion"` | Presupuesto del trabajo antes de realizarlo |
| **Factura** | `"Factura"` | Cobro final después de completar el trabajo |
| **Proforma** | `"Proforma"` | Documento provisional (menos común) |

### 2.3 Estados de Documentos

| Estado | Código Backend | Descripción | Badge Color |
|--------|---------------|-------------|-------------|
| **Pendiente** | `"Pendiente"` | Documento sin pagar | 🟡 Amarillo |
| **Pagado** | `"Pagada"` | Documento pagado por el cliente | 🟢 Verde |
| **Enviada** | `"Enviada"` | Documento enviado (menos usado) | 🔵 Azul |
| **Revisión** | `"Revision"` | En revisión (menos usado) | 🟠 Naranja |

### 2.4 Información que Muestra un Documento

Según las capturas de pantalla, cada documento muestra:

```
┌─────────────────────────────────────────────────────┐
│ 📄 Cotización                    $5000.00  Pendiente│
│ De: tito mendez                                     │
│ 26 de noviembre de 2025, 16:07                      │
│                                                      │
│ [👁️ Ver] [📥 Descargar] [💳 Pagar]                  │
└─────────────────────────────────────────────────────┘
```

**Campos visibles:**
- ✅ Tipo de documento (Cotización/Factura)
- ✅ Nombre del contratista
- ✅ Monto total
- ✅ Estado (Pendiente/Pagado)
- ✅ Fecha de creación
- ✅ Botones: Ver PDF, Descargar PDF, Pagar (solo si está pendiente)

---

## 3. Módulo de Historial

### 3.1 ¿Qué es el Historial?

El historial muestra **todas las solicitudes de servicio** que el cliente ha creado, incluyendo:
- Solicitudes pendientes (esperando contratista)
- Solicitudes aceptadas (contratista asignado)
- Solicitudes finalizadas (trabajo completado)
- Solicitudes canceladas

### 3.2 Estados de Solicitudes

| Estado | Código Backend | Descripción | Badge Color |
|--------|---------------|-------------|-------------|
| **Pendiente** | `"Pendiente"` | Esperando que un contratista la acepte | 🟡 Amarillo |
| **Aceptada** | `"Aceptada"` | Contratista asignado, visita programada | 🔵 Azul |
| **Finalizada** | `"Finalizada"` | Servicio completado | 🟣 Púrpura |
| **Pagado** | - | Finalizada Y pagada | 🟢 Verde |
| **Cancelada** | `"Cancelada"` | Cliente o sistema canceló la solicitud | 🔴 Rojo |

### 3.3 Información que Muestra el Historial

Según la captura de pantalla, cada solicitud muestra:

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 T  Fontanería                             [Aceptada]     │
│       Contratista: tito mendez                              │
│                                                              │
│ 🔔 ¡Tu solicitud fue aceptada por tito mendez!              │
│    📅 Visita programada: 27 nov 2025 a las 15:00           │
│    📝 Notas del contratista: carro blanco                   │
│                                                              │
│ llave de fuga quebrado                                      │
│                                                              │
│ 📅 Visita: 27 nov 2025  📍 4GXX+XM8, Av. 17...  💵 15000   │
│ 🚨 Urgencia: alta                                           │
│                                                              │
│ 📄 Proforma disponible                                      │
│                                                              │
│                        [👁️ Ver detalles] [❌ Cancelar]      │
└─────────────────────────────────────────────────────────────┘
```

**Campos visibles:**
- ✅ Avatar/inicial del contratista
- ✅ Nombre del servicio (Fontanería, Electricidad, etc.)
- ✅ Estado con badge de color
- ✅ Nombre del contratista (si está asignado)
- ✅ **Notificación de aceptación** (fondo azul) cuando el estado es "Aceptada"
  - Fecha y hora de visita programada
  - Notas del contratista
- ✅ Descripción del problema
- ✅ Fecha de visita o solicitud
- ✅ Ubicación
- ✅ Presupuesto
- ✅ Nivel de urgencia
- ✅ Indicador si hay proforma disponible
- ✅ Botones de acción según el estado

### 3.4 Acciones Disponibles en el Historial

| Estado Solicitud | Acciones Disponibles |
|-----------------|---------------------|
| **Pendiente** | Ver detalles, Cancelar |
| **Aceptada** | Ver detalles, Cancelar |
| **Finalizada (Sin Pagar)** | Ver detalles, Pagar, Calificar (después de pagar) |
| **Finalizada (Pagada)** | Ver detalles, Calificar (si no ha calificado) |
| **Cancelada** | Ver detalles |

---

## 4. Endpoints de la API

### 4.1 Endpoints de Documentos

#### A) Obtener Documentos del Cliente

```http
GET /api/Documents/mine?clientId={clientId}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "requestId": 123,
    "contractorId": 456,
    "contractorName": "tito mendez",
    "contractorEmail": "tito@example.com",
    "contractorPhone": "+506 8888-9999",
    "contractorAddress": "San José, Costa Rica",
    "contractorAvatarUrl": "https://example.com/avatar.jpg",
    "kind": "Cotizacion",
    "amount": 5000.00,
    "date": "2025-11-26T16:07:00Z",
    "status": "Pendiente",
    "pdfUrl": "https://example.com/documents/cotizacion_1.pdf"
  },
  {
    "id": 2,
    "requestId": 124,
    "contractorId": 456,
    "contractorName": "tito mendez",
    "kind": "Factura",
    "amount": 14400.00,
    "date": "2025-11-21T21:13:00Z",
    "status": "Pendiente",
    "pdfUrl": "https://example.com/documents/factura_2.pdf"
  }
]
```

**Notas:**
- `kind` puede ser: `"Cotizacion"`, `"Factura"`, o `"Proforma"`
- `status` puede ser: `"Pendiente"`, `"Pagada"`, `"Enviada"`, `"Revision"`
- `pdfUrl` puede ser `null` si no hay PDF generado aún
- `amount` es el monto total del documento

---

#### B) Registrar Pago de Documento

```http
POST /api/Documents/{documentId}/pay
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "clientId": 123,
  "paymentMethod": "Efectivo",
  "paymentProofUrl": "https://example.com/proof.jpg",
  "notes": "Pago realizado en efectivo"
}
```

**Valores válidos para `paymentMethod`:**
- `"Efectivo"`
- `"Transferencia"`

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Pago registrado correctamente",
  "documentId": 1,
  "requestId": 123,
  "paymentStatus": "Pagado",
  "paymentMethod": "Efectivo",
  "paidDate": "2025-11-27T10:30:00Z"
}
```

**Notas:**
- `paymentProofUrl` es **opcional**, pero recomendado para transferencias
- `notes` es **opcional**
- Después de registrar el pago, el documento cambia a estado `"Pagada"`
- El backend envía notificación al contratista

---

#### C) Obtener Documentos por Solicitud

```http
GET /api/Documents/by-request/{requestId}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta (200 OK):**
```json
[
  {
    "documentId": 1,
    "requestId": 123,
    "clientId": 789,
    "contractorId": 456,
    "kind": 0,
    "status": 0,
    "total": 5000.00,
    "notes": "Cotización para reparación de fontanería",
    "createdAt": "2025-11-26T16:07:00Z",
    "pdfUrl": "https://example.com/documents/cotizacion_1.pdf",
    "items": [
      {
        "itemId": 1,
        "documentId": 1,
        "itemType": 0,
        "description": "Mano de obra - Reparación de tubería",
        "hours": 4,
        "hourlyRate": 1000,
        "quantity": null,
        "unit": null,
        "unitPrice": null
      },
      {
        "itemId": 2,
        "documentId": 1,
        "itemType": 1,
        "description": "Tubería PVC 1/2 pulgada",
        "hours": null,
        "hourlyRate": null,
        "quantity": 5,
        "unit": "metros",
        "unitPrice": 200
      }
    ]
  }
]
```

**Notas:**
- `kind` (número): 0 = Cotización, 1 = Factura
- `status` (número): 0 = Pendiente, 1 = Pagado
- `itemType` (número): 0 = Servicio (horas × tarifa), 1 = Material (cantidad × precio)
- Este endpoint retorna el documento con todos sus items desglosados

---

### 4.2 Endpoints de Historial de Solicitudes

#### A) Obtener Historial del Cliente

```http
GET /api/ServiceRequest/by-client/{clientId}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta (200 OK):**
```json
[
  {
    "requestId": 123,
    "clientId": 789,
    "clientName": "Juan Pérez",
    "contractorId": 456,
    "contractorName": "tito mendez",
    "contractorAvatarUrl": "https://example.com/avatar.jpg",
    "serviceId": 1,
    "serviceName": "Fontanería",
    "description": "llave de fuga quebrado",
    "location": "4GXX+XM8, Av. 17, Provincia de Guanacaste, Nicoya, Los Angeles, Costa Rica",
    "urgency": "Alta",
    "estimatedDuration": "2 horas",
    "budget": "15000",
    "requestDate": "2025-11-25T10:00:00Z",
    "serviceDate": null,
    "isActive": true,
    "hasRating": false,
    "ratingStars": null,

    "status": "Aceptada",
    "acceptedDate": "2025-11-26T09:00:00Z",
    "scheduledVisitDate": "2025-11-27",
    "scheduledVisitTime": "15:00",
    "visitNotes": "carro blanco",
    "completedDate": null,

    "proformaDocumentUrl": "https://example.com/documents/proforma_123.pdf",
    "proformaUploadedDate": "2025-11-26T10:00:00Z",

    "paymentStatus": "Pendiente",
    "paymentMethod": null,
    "paymentProofUrl": null,
    "paidDate": null
  },
  {
    "requestId": 124,
    "clientId": 789,
    "clientName": "Juan Pérez",
    "contractorId": null,
    "contractorName": null,
    "contractorAvatarUrl": null,
    "serviceId": 2,
    "serviceName": "Electricidad",
    "description": "Instalación de lámpara nueva",
    "location": "San José, Costa Rica",
    "urgency": "Media",
    "estimatedDuration": "1 hora",
    "budget": "8000",
    "requestDate": "2025-11-20T14:00:00Z",
    "serviceDate": null,
    "isActive": true,
    "hasRating": false,
    "ratingStars": null,

    "status": "Pendiente",
    "acceptedDate": null,
    "scheduledVisitDate": null,
    "scheduledVisitTime": null,
    "visitNotes": null,
    "completedDate": null,

    "proformaDocumentUrl": null,
    "proformaUploadedDate": null,

    "paymentStatus": "Pendiente",
    "paymentMethod": null,
    "paymentProofUrl": null,
    "paidDate": null
  }
]
```

**Campos importantes:**
- `status`: "Pendiente", "Aceptada", "Finalizada", "Cancelada"
- `scheduledVisitDate` y `scheduledVisitTime`: Fecha y hora de visita programada (solo si está aceptada)
- `visitNotes`: Notas del contratista sobre la visita
- `paymentStatus`: "Pendiente" o "Pagado"
- `hasRating`: Si el cliente ya calificó el servicio
- `ratingStars`: Número de estrellas (1-5) si ya calificó

---

#### B) Cancelar Solicitud (Cliente)

```http
POST /api/ServiceRequest/{requestId}/cancel
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "clientId": 789
}
```

**Respuesta (200 OK):**
```json
{
  "message": "Solicitud cancelada exitosamente"
}
```

**Validaciones en el Backend:**
- Solo se puede cancelar si el estado es "Pendiente" o "Aceptada"
- No se puede cancelar si ya está "Finalizada" o "Cancelada"
- No se puede cancelar si ya fue pagada

---

#### C) Registrar Pago de Solicitud

```http
POST /api/ServiceRequest/{requestId}/register-payment
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "clientId": 789,
  "paymentMethod": "Efectivo",
  "paymentProofUrl": "https://example.com/proof.jpg"
}
```

**Respuesta (200 OK):**
```json
{
  "message": "Pago registrado exitosamente"
}
```

**Notas:**
- Solo disponible para solicitudes en estado "Finalizada"
- `paymentMethod`: "Efectivo" o "Transferencia"
- `paymentProofUrl` es opcional

---

#### D) Obtener Fotos del Problema

```http
GET /api/ServiceRequestPhotos/problem/{requestId}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta (200 OK):**
```json
[
  {
    "photoId": 1,
    "requestId": 123,
    "uploadedBy": 789,
    "uploaderName": "Juan Pérez",
    "roleId": 1,
    "roleName": "Cliente",
    "photoUrl": "https://example.com/photos/photo1.jpg",
    "fileName": "problem_photo_1.jpg",
    "photoType": "Problem",
    "uploadedAt": "2025-11-25T10:05:00Z"
  },
  {
    "photoId": 2,
    "requestId": 123,
    "uploadedBy": 789,
    "uploaderName": "Juan Pérez",
    "roleId": 1,
    "roleName": "Cliente",
    "photoUrl": "https://example.com/photos/photo2.jpg",
    "fileName": "problem_photo_2.jpg",
    "photoType": "Problem",
    "uploadedAt": "2025-11-25T10:05:00Z"
  }
]
```

**Tipos de foto:**
- `"Problem"`: Fotos del problema (subidas por el cliente)
- `"Before"`: Fotos antes del trabajo (subidas por el contratista)
- `"After"`: Fotos después del trabajo (subidas por el contratista)

---

## 5. Modelos de Datos

### 5.1 Modelo de Documento (ClientDocumentDto)

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
  final String date; // ISO 8601
  final String status; // "Pendiente", "Pagada", "Enviada", "Revision"
  final String? pdfUrl;

  ClientDocumentDto({
    required this.id,
    required this.requestId,
    required this.contractorId,
    required this.contractorName,
    this.contractorEmail,
    this.contractorPhone,
    this.contractorAddress,
    this.contractorAvatarUrl,
    required this.kind,
    required this.amount,
    required this.date,
    required this.status,
    this.pdfUrl,
  });

  factory ClientDocumentDto.fromJson(Map<String, dynamic> json) {
    return ClientDocumentDto(
      id: json['id'],
      requestId: json['requestId'],
      contractorId: json['contractorId'],
      contractorName: json['contractorName'],
      contractorEmail: json['contractorEmail'],
      contractorPhone: json['contractorPhone'],
      contractorAddress: json['contractorAddress'],
      contractorAvatarUrl: json['contractorAvatarUrl'],
      kind: json['kind'],
      amount: (json['amount'] as num).toDouble(),
      date: json['date'],
      status: json['status'],
      pdfUrl: json['pdfUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'requestId': requestId,
      'contractorId': contractorId,
      'contractorName': contractorName,
      'contractorEmail': contractorEmail,
      'contractorPhone': contractorPhone,
      'contractorAddress': contractorAddress,
      'contractorAvatarUrl': contractorAvatarUrl,
      'kind': kind,
      'amount': amount,
      'date': date,
      'status': status,
      'pdfUrl': pdfUrl,
    };
  }
}
```

---

### 5.2 Modelo de Historial (ServiceRequestHistory)

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
  final String urgency; // "Alta", "Media", "Baja"
  final String estimatedDuration;
  final String budget;
  final String requestDate;
  final String? serviceDate;
  final bool isActive;
  final bool hasRating;
  final int? ratingStars;

  // Estados del flujo
  final String status; // "Pendiente", "Aceptada", "Finalizada", "Cancelada"
  final String? acceptedDate;
  final String? scheduledVisitDate;
  final String? scheduledVisitTime;
  final String? visitNotes;
  final String? completedDate;

  // Documento de proforma/cotización
  final String? proformaDocumentUrl;
  final String? proformaUploadedDate;

  // Información de pago
  final String paymentStatus; // "Pendiente", "Pagado"
  final String? paymentMethod; // "Efectivo", "Transferencia"
  final String? paymentProofUrl;
  final String? paidDate;

  ServiceRequestHistory({
    required this.requestId,
    required this.clientId,
    required this.clientName,
    this.contractorId,
    this.contractorName,
    this.contractorAvatarUrl,
    required this.serviceId,
    required this.serviceName,
    required this.description,
    required this.location,
    required this.urgency,
    required this.estimatedDuration,
    required this.budget,
    required this.requestDate,
    this.serviceDate,
    required this.isActive,
    required this.hasRating,
    this.ratingStars,
    required this.status,
    this.acceptedDate,
    this.scheduledVisitDate,
    this.scheduledVisitTime,
    this.visitNotes,
    this.completedDate,
    this.proformaDocumentUrl,
    this.proformaUploadedDate,
    required this.paymentStatus,
    this.paymentMethod,
    this.paymentProofUrl,
    this.paidDate,
  });

  factory ServiceRequestHistory.fromJson(Map<String, dynamic> json) {
    return ServiceRequestHistory(
      requestId: json['requestId'],
      clientId: json['clientId'],
      clientName: json['clientName'],
      contractorId: json['contractorId'],
      contractorName: json['contractorName'],
      contractorAvatarUrl: json['contractorAvatarUrl'],
      serviceId: json['serviceId'],
      serviceName: json['serviceName'],
      description: json['description'],
      location: json['location'],
      urgency: json['urgency'],
      estimatedDuration: json['estimatedDuration'],
      budget: json['budget'],
      requestDate: json['requestDate'],
      serviceDate: json['serviceDate'],
      isActive: json['isActive'],
      hasRating: json['hasRating'],
      ratingStars: json['ratingStars'],
      status: json['status'],
      acceptedDate: json['acceptedDate'],
      scheduledVisitDate: json['scheduledVisitDate'],
      scheduledVisitTime: json['scheduledVisitTime'],
      visitNotes: json['visitNotes'],
      completedDate: json['completedDate'],
      proformaDocumentUrl: json['proformaDocumentUrl'],
      proformaUploadedDate: json['proformaUploadedDate'],
      paymentStatus: json['paymentStatus'],
      paymentMethod: json['paymentMethod'],
      paymentProofUrl: json['paymentProofUrl'],
      paidDate: json['paidDate'],
    );
  }
}
```

---

### 5.3 Modelo de DTO para Registrar Pago de Documento

```dart
class RegisterDocumentPaymentDto {
  final int clientId;
  final String paymentMethod; // "Efectivo" o "Transferencia"
  final String? paymentProofUrl;
  final String? notes;

  RegisterDocumentPaymentDto({
    required this.clientId,
    required this.paymentMethod,
    this.paymentProofUrl,
    this.notes,
  });

  Map<String, dynamic> toJson() {
    return {
      'clientId': clientId,
      'paymentMethod': paymentMethod,
      if (paymentProofUrl != null) 'paymentProofUrl': paymentProofUrl,
      if (notes != null) 'notes': notes,
    };
  }
}
```

---

### 5.4 Modelo de DTO para Registrar Pago de Solicitud

```dart
class RegisterPaymentDto {
  final int clientId;
  final String paymentMethod; // "Efectivo" o "Transferencia"
  final String? paymentProofUrl;

  RegisterPaymentDto({
    required this.clientId,
    required this.paymentMethod,
    this.paymentProofUrl,
  });

  Map<String, dynamic> toJson() {
    return {
      'clientId': clientId,
      'paymentMethod': paymentMethod,
      if (paymentProofUrl != null) 'paymentProofUrl': paymentProofUrl,
    };
  }
}
```

---

### 5.5 Modelo de Foto

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

  PhotoResponseDto({
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

  factory PhotoResponseDto.fromJson(Map<String, dynamic> json) {
    return PhotoResponseDto(
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

---

## 6. Flujos de Negocio

### 6.1 Flujo Completo: Desde Solicitud hasta Calificación

```
1. Cliente crea solicitud de servicio
   ↓
   Estado: "Pendiente"
   Aparece en Historial

2. Contratista acepta la solicitud
   ↓
   Estado: "Aceptada"
   Se programa fecha de visita
   Cliente ve notificación azul con detalles de visita

3. Contratista realiza el trabajo
   ↓
   Contratista marca como "Finalizada"
   Estado: "Finalizada"

4. Contratista crea documento (Cotización/Factura)
   ↓
   Documento aparece en pestaña "Documentos"
   Estado documento: "Pendiente"

5. Cliente paga el documento
   ↓
   Cliente hace clic en "Pagar"
   Selecciona método de pago
   Si es transferencia, sube comprobante
   Estado documento: "Pagado"

6. Cliente califica el servicio
   ↓
   Cliente hace clic en "Calificar servicio"
   Da estrellas (1-5) y comentario
   hasRating: true
   ratingStars: 5
```

---

### 6.2 Flujo de Pago de Documento

```
┌─────────────────────────────────────────┐
│  Cliente ve documento en estado        │
│  "Pendiente"                            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Cliente hace clic en botón "Pagar"    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Se abre modal de pago                  │
│  - Muestra información del documento    │
│  - Selecciona método de pago            │
└──────────────┬──────────────────────────┘
               │
               ├─── Efectivo ───┐
               │                 │
               └─ Transferencia ─┤
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ Si es Transferencia:         │
                  │ - Sube comprobante (imagen)  │
                  │ - Opcional: agrega notas     │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
               ┌─────────────────────────────────────┐
               │ POST /api/Documents/{id}/pay        │
               │ Body: {                             │
               │   clientId,                         │
               │   paymentMethod,                    │
               │   paymentProofUrl,                  │
               │   notes                             │
               │ }                                   │
               └──────────────┬──────────────────────┘
                              │
                              ▼
               ┌─────────────────────────────────────┐
               │ Backend actualiza documento         │
               │ - status: "Pagado"                  │
               │ - paymentMethod: "Efectivo"         │
               │ - paidDate: fecha actual            │
               │ - Notifica al contratista           │
               └──────────────┬──────────────────────┘
                              │
                              ▼
               ┌─────────────────────────────────────┐
               │ UI actualiza:                       │
               │ - Badge cambia a Verde "Pagado"     │
               │ - Botón "Pagar" desaparece          │
               │ - Muestra mensaje de éxito          │
               └─────────────────────────────────────┘
```

---

### 6.3 Flujo de Cancelación de Solicitud

```
┌─────────────────────────────────────────┐
│  Cliente ve solicitud en estado        │
│  "Pendiente" o "Aceptada"               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Cliente hace clic en "Cancelar"        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Confirmación:                          │
│  "¿Estás seguro de cancelar?"           │
└──────────────┬──────────────────────────┘
               │
               ├─── No ────► Cierra modal
               │
               └─── Sí ────┐
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ POST /api/ServiceRequest/{id}/cancel │
        │ Body: { clientId }                   │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Backend actualiza solicitud:         │
        │ - status: "Cancelada"                │
        │ - isActive: false                    │
        │ - Notifica al contratista            │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ UI actualiza:                        │
        │ - Badge cambia a Rojo "Cancelada"    │
        │ - Botón "Cancelar" desaparece        │
        │ - Muestra mensaje de éxito           │
        └──────────────────────────────────────┘
```

---

### 6.4 Validaciones Importantes

#### Validaciones para Pagar Documento

```dart
bool canPayDocument(ClientDocumentDto document) {
  return document.status == "Pendiente";
}
```

#### Validaciones para Cancelar Solicitud

```dart
bool canCancelRequest(ServiceRequestHistory request) {
  return request.isActive &&
         (request.status == "Pendiente" || request.status == "Aceptada") &&
         request.paymentStatus != "Pagado";
}
```

#### Validaciones para Calificar Servicio

```dart
bool canRateService(ServiceRequestHistory request) {
  return request.status == "Finalizada" &&
         request.paymentStatus == "Pagado" &&
         !request.hasRating;
}
```

#### Validaciones para Pagar Servicio

```dart
bool canPayService(ServiceRequestHistory request) {
  return request.status == "Finalizada" &&
         request.paymentStatus == "Pendiente";
}
```

---

## 7. Implementación en Flutter

### 7.1 Servicio de Documentos

```dart
// lib/services/document_service.dart
import 'package:dio/dio.dart';
import '../models/client_document_dto.dart';
import '../models/register_document_payment_dto.dart';

class DocumentService {
  final Dio _dio;
  final String baseUrl = 'https://render-deploy-latest.onrender.com/api';

  DocumentService(this._dio);

  /// Obtener todos los documentos del cliente
  Future<List<ClientDocumentDto>> getClientDocuments(int clientId) async {
    try {
      final response = await _dio.get(
        '$baseUrl/Documents/mine',
        queryParameters: {'clientId': clientId},
      );

      return (response.data as List)
          .map((json) => ClientDocumentDto.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Error al obtener documentos: $e');
    }
  }

  /// Registrar pago de un documento
  Future<Map<String, dynamic>> registerDocumentPayment(
    int documentId,
    RegisterDocumentPaymentDto paymentDto,
  ) async {
    try {
      final response = await _dio.post(
        '$baseUrl/Documents/$documentId/pay',
        data: paymentDto.toJson(),
      );

      return response.data;
    } catch (e) {
      throw Exception('Error al registrar pago: $e');
    }
  }

  /// Descargar PDF del documento
  Future<void> downloadDocumentPdf(String pdfUrl, String fileName) async {
    try {
      final response = await _dio.get(
        pdfUrl,
        options: Options(responseType: ResponseType.bytes),
      );

      // Guardar archivo localmente
      // Implementar lógica de guardado según plataforma
      // ...
    } catch (e) {
      throw Exception('Error al descargar PDF: $e');
    }
  }
}
```

---

### 7.2 Servicio de Historial

```dart
// lib/services/history_service.dart
import 'package:dio/dio.dart';
import '../models/service_request_history.dart';
import '../models/register_payment_dto.dart';

class HistoryService {
  final Dio _dio;
  final String baseUrl = 'https://render-deploy-latest.onrender.com/api';

  HistoryService(this._dio);

  /// Obtener historial de solicitudes del cliente
  Future<List<ServiceRequestHistory>> getClientHistory(int clientId) async {
    try {
      final response = await _dio.get(
        '$baseUrl/ServiceRequest/by-client/$clientId',
      );

      return (response.data as List)
          .map((json) => ServiceRequestHistory.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Error al obtener historial: $e');
    }
  }

  /// Cancelar solicitud
  Future<void> cancelRequest(int requestId, int clientId) async {
    try {
      await _dio.post(
        '$baseUrl/ServiceRequest/$requestId/cancel',
        data: {'clientId': clientId},
      );
    } catch (e) {
      throw Exception('Error al cancelar solicitud: $e');
    }
  }

  /// Registrar pago de servicio
  Future<void> registerPayment(
    int requestId,
    RegisterPaymentDto paymentDto,
  ) async {
    try {
      await _dio.post(
        '$baseUrl/ServiceRequest/$requestId/register-payment',
        data: paymentDto.toJson(),
      );
    } catch (e) {
      throw Exception('Error al registrar pago: $e');
    }
  }

  /// Obtener fotos del problema
  Future<List<PhotoResponseDto>> getProblemPhotos(int requestId) async {
    try {
      final response = await _dio.get(
        '$baseUrl/ServiceRequestPhotos/problem/$requestId',
      );

      return (response.data as List)
          .map((json) => PhotoResponseDto.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Error al obtener fotos: $e');
    }
  }
}
```

---

### 7.3 Widget de Lista de Documentos

```dart
// lib/widgets/documents_list.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/document_provider.dart';
import 'document_card.dart';

class DocumentsList extends StatefulWidget {
  @override
  State<DocumentsList> createState() => _DocumentsListState();
}

class _DocumentsListState extends State<DocumentsList> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<DocumentProvider>().fetchDocuments();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<DocumentProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (provider.error != null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  provider.error!,
                  style: const TextStyle(color: Colors.red),
                ),
                ElevatedButton(
                  onPressed: () => provider.fetchDocuments(),
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          );
        }

        if (provider.documents.isEmpty) {
          return const Center(
            child: Text(
              'Aún no tienes documentos.\nCuando el contratista envíe uno, aparecerá aquí.',
              textAlign: TextAlign.center,
            ),
          );
        }

        return ListView.builder(
          itemCount: provider.documents.length,
          itemBuilder: (context, index) {
            final document = provider.documents[index];
            return DocumentCard(
              document: document,
              onPay: () => _showPaymentModal(context, document),
            );
          },
        );
      },
    );
  }

  void _showPaymentModal(BuildContext context, ClientDocumentDto document) {
    // Mostrar modal de pago
    showDialog(
      context: context,
      builder: (context) => DocumentPaymentModal(document: document),
    );
  }
}
```

---

### 7.4 Widget de Tarjeta de Documento

```dart
// lib/widgets/document_card.dart
import 'package:flutter/material.dart';
import '../models/client_document_dto.dart';
import 'package:url_launcher/url_launcher.dart';

class DocumentCard extends StatelessWidget {
  final ClientDocumentDto document;
  final VoidCallback? onPay;

  const DocumentCard({
    Key? key,
    required this.document,
    this.onPay,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isPending = document.status == 'Pendiente';

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Icono de documento
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.blue.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.description,
                color: Colors.blue,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),

            // Información del documento
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _getDocumentTypeLabel(document.kind),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'De: ${document.contractorName}',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatDate(document.date),
                    style: TextStyle(
                      color: Colors.grey.shade500,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),

            // Monto y estado
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '\$${document.amount.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                _buildStatusBadge(document.status),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    Color textColor;

    switch (status) {
      case 'Pagada':
        bgColor = Colors.green.shade100;
        textColor = Colors.green.shade700;
        break;
      case 'Pendiente':
      default:
        bgColor = Colors.yellow.shade100;
        textColor = Colors.yellow.shade700;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _getDocumentTypeLabel(String kind) {
    return kind == 'Cotizacion' ? 'Cotización' : 'Factura';
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    return '${date.day} de ${_getMonthName(date.month)} de ${date.year}, ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }

  String _getMonthName(int month) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months[month - 1];
  }
}
```

---

### 7.5 Provider de Documentos

```dart
// lib/providers/document_provider.dart
import 'package:flutter/foundation.dart';
import '../models/client_document_dto.dart';
import '../services/document_service.dart';

class DocumentProvider with ChangeNotifier {
  final DocumentService _service;
  final int clientId;

  List<ClientDocumentDto> _documents = [];
  bool _isLoading = false;
  String? _error;

  DocumentProvider(this._service, this.clientId);

  List<ClientDocumentDto> get documents => _documents;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchDocuments() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _documents = await _service.getClientDocuments(clientId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> payDocument(
    int documentId,
    RegisterDocumentPaymentDto paymentDto,
  ) async {
    try {
      await _service.registerDocumentPayment(documentId, paymentDto);
      await fetchDocuments(); // Recargar lista
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }
}
```

---

## 8. Estados y Validaciones

### 8.1 Tabla de Estados y Acciones

| Módulo | Estado | Acciones Disponibles | Validaciones |
|--------|--------|---------------------|--------------|
| **Documento** | Pendiente | Ver PDF, Descargar, Pagar | `status == "Pendiente"` |
| **Documento** | Pagado | Ver PDF, Descargar | Solo visualización |
| **Historial** | Pendiente | Ver detalles, Cancelar | `isActive && status == "Pendiente" && paymentStatus != "Pagado"` |
| **Historial** | Aceptada | Ver detalles, Cancelar | `isActive && status == "Aceptada" && paymentStatus != "Pagado"` |
| **Historial** | Finalizada (Sin Pagar) | Ver detalles, Pagar | `status == "Finalizada" && paymentStatus == "Pendiente"` |
| **Historial** | Finalizada (Pagada, Sin Calificar) | Ver detalles, Calificar | `status == "Finalizada" && paymentStatus == "Pagado" && !hasRating` |
| **Historial** | Finalizada (Pagada, Calificada) | Ver detalles | Solo visualización |
| **Historial** | Cancelada | Ver detalles | Solo visualización |

---

### 8.2 Helpers para Colores de Badges

```dart
// lib/utils/badge_helper.dart

class BadgeHelper {
  static Color getDocumentStatusColor(String status) {
    switch (status) {
      case 'Pagada':
        return Colors.green.shade700;
      case 'Pendiente':
        return Colors.yellow.shade700;
      case 'Enviada':
        return Colors.blue.shade700;
      case 'Revision':
        return Colors.orange.shade700;
      default:
        return Colors.grey.shade700;
    }
  }

  static Color getDocumentStatusBgColor(String status) {
    switch (status) {
      case 'Pagada':
        return Colors.green.shade100;
      case 'Pendiente':
        return Colors.yellow.shade100;
      case 'Enviada':
        return Colors.blue.shade100;
      case 'Revision':
        return Colors.orange.shade100;
      default:
        return Colors.grey.shade100;
    }
  }

  static Color getRequestStatusColor(String status) {
    switch (status) {
      case 'Cancelada':
        return Colors.red.shade700;
      case 'Finalizada':
        return Colors.purple.shade700;
      case 'Aceptada':
        return Colors.blue.shade700;
      case 'Pendiente':
      default:
        return Colors.yellow.shade700;
    }
  }

  static Color getRequestStatusBgColor(String status) {
    switch (status) {
      case 'Cancelada':
        return Colors.red.shade100;
      case 'Finalizada':
        return Colors.purple.shade100;
      case 'Aceptada':
        return Colors.blue.shade100;
      case 'Pendiente':
      default:
        return Colors.yellow.shade100;
    }
  }

  static Color getUrgencyColor(String urgency) {
    switch (urgency) {
      case 'Alta':
        return Colors.red.shade600;
      case 'Media':
        return Colors.yellow.shade600;
      case 'Baja':
        return Colors.green.shade600;
      default:
        return Colors.grey.shade600;
    }
  }
}
```

---

## 9. Características Especiales del Historial

### 9.1 Notificación de Aceptación

Cuando una solicitud está en estado **"Aceptada"**, se muestra una notificación especial con fondo azul:

```dart
// lib/widgets/acceptance_notification.dart
import 'package:flutter/material.dart';
import '../models/service_request_history.dart';

class AcceptanceNotification extends StatelessWidget {
  final ServiceRequestHistory request;

  const AcceptanceNotification({Key? key, required this.request}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (request.status != 'Aceptada' || request.contractorName == null) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        border: Border.all(color: Colors.blue.shade200),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.notifications, color: Colors.blue.shade600, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '¡Tu solicitud fue aceptada por ${request.contractorName}!',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Colors.blue.shade900,
                    fontSize: 14,
                  ),
                ),
                if (request.scheduledVisitDate != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.calendar_today, size: 14, color: Colors.blue.shade700),
                      const SizedBox(width: 4),
                      Text(
                        'Visita programada: ${_formatDate(request.scheduledVisitDate!)}${request.scheduledVisitTime != null ? ' a las ${request.scheduledVisitTime}' : ''}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.blue.shade700,
                        ),
                      ),
                    ],
                  ),
                ],
                if (request.visitNotes != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.note, size: 14, color: Colors.blue.shade700),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          'Notas del contratista: ${request.visitNotes}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.blue.shade700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    return '${date.day} de ${_getMonthName(date.month)} de ${date.year}';
  }

  String _getMonthName(int month) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months[month - 1];
  }
}
```

---

## 10. Resumen de Implementación

### Checklist para Flutter

#### Documentos
- [ ] Modelo `ClientDocumentDto`
- [ ] Servicio `DocumentService` con métodos:
  - [ ] `getClientDocuments(clientId)`
  - [ ] `registerDocumentPayment(documentId, paymentDto)`
  - [ ] `downloadDocumentPdf(pdfUrl, fileName)`
- [ ] Provider `DocumentProvider`
- [ ] Widget `DocumentsList`
- [ ] Widget `DocumentCard`
- [ ] Modal `DocumentPaymentModal`
- [ ] Helper de colores para badges

#### Historial
- [ ] Modelo `ServiceRequestHistory`
- [ ] Servicio `HistoryService` con métodos:
  - [ ] `getClientHistory(clientId)`
  - [ ] `cancelRequest(requestId, clientId)`
  - [ ] `registerPayment(requestId, paymentDto)`
  - [ ] `getProblemPhotos(requestId)`
- [ ] Provider `HistoryProvider`
- [ ] Widget `HistoryList`
- [ ] Widget `HistoryCard`
- [ ] Widget `AcceptanceNotification`
- [ ] Modal `ServiceRequestDetailModal`
- [ ] Modal `RegisterPaymentModal`
- [ ] Modal `RatingModal` (para calificar)

#### Funcionalidades Comunes
- [ ] Validaciones de estados
- [ ] Helpers de formato de fechas
- [ ] Helpers de colores de badges
- [ ] Manejo de errores
- [ ] Loading states
- [ ] Pull to refresh

---

## 11. Notas Finales

### Diferencias entre Pago de Documento y Pago de Solicitud

| Aspecto | Pago de Documento | Pago de Solicitud |
|---------|------------------|-------------------|
| **Endpoint** | `POST /api/Documents/{id}/pay` | `POST /api/ServiceRequest/{id}/register-payment` |
| **Cuándo** | Después de que el contratista crea una factura/cotización | Después de que el servicio está finalizado |
| **Efecto** | Cambia estado del documento a "Pagado" | Cambia `paymentStatus` de la solicitud a "Pagado" |
| **Ubicación** | Pestaña "Documentos" | Pestaña "Historial" |

### URLs del Sistema

- **Base URL API**: `https://render-deploy-latest.onrender.com/api`
- **Documentos**: `/api/Documents/*`
- **Historial**: `/api/ServiceRequest/*`
- **Fotos**: `/api/ServiceRequestPhotos/*`
- **Calificaciones**: `/api/Rating/*`

---

**¡Éxito con la implementación en Flutter!** 🚀

Si tienes dudas sobre algún endpoint o flujo, revisa la sección correspondiente en este documento.
