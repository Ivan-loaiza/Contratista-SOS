# 📄 Guía Completa: Visualización y Pago de Documentos del Cliente

## Para Implementación en Flutter

Esta guía te proporciona TODO lo necesario para implementar la visualización y pago de documentos (Cotizaciones/Facturas) en Flutter, exactamente como se ve en el dashboard del cliente en React.

---

## 📋 Tabla de Contenidos

1. [Vista General del Módulo](#vista-general-del-módulo)
2. [Diseño de la UI](#diseño-de-la-ui)
3. [Estructura de Datos](#estructura-de-datos)
4. [Flujo Completo de Pago](#flujo-completo-de-pago)
5. [Visualización de PDF](#visualización-de-pdf)
6. [Implementación en Flutter](#implementación-en-flutter)
7. [Widgets Completos](#widgets-completos)
8. [Validaciones y Estados](#validaciones-y-estados)

---

## 1. Vista General del Módulo

### 🎯 ¿Qué Muestra Esta Pantalla?

La pestaña "Documentos" muestra **todas las cotizaciones y facturas** que los contratistas han enviado al cliente.

### 📸 Diseño Real (Basado en tu Screenshot)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Cotizaciones y Facturas                                                │
│  Gestiona todos los documentos enviados por los contratistas            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📄  Cotización                      $5000.00    [Pendiente]    │   │
│  │      De: tito mendez                                            │   │
│  │      26 de noviembre de 2025, 16:07                             │   │
│  │                                                                  │   │
│  │                    [👁️ Ver] [📥 Descargar] [💳 Pagar]           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📄  Cotización                      $14400.00   [Pendiente]    │   │
│  │      De: tito mendez                                            │   │
│  │      21 de noviembre de 2025, 21:13                             │   │
│  │                                                                  │   │
│  │                    [👁️ Ver] [📥 Descargar] [💳 Pagar]           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📄  Cotización                      $16000.00   [Pendiente]    │   │
│  │      De: tito mendez                                            │   │
│  │      21 de noviembre de 2025, 21:05                             │   │
│  │                                                                  │   │
│  │                    [👁️ Ver] [📥 Descargar] [💳 Pagar]           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Diseño de la UI

### 2.1 Estructura de una Tarjeta de Documento

Cada documento se muestra en una **tarjeta horizontal** con los siguientes elementos:

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│  [📄]  Cotización                           $5000.00  Pendiente  │
│        De: tito mendez                                           │
│        26 de noviembre de 2025, 16:07                            │
│                                                                   │
│                    [👁️ Ver]  [📥 Descargar]  [💳 Pagar]          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 2.2 Elementos de la Tarjeta

| Elemento | Posición | Descripción |
|----------|----------|-------------|
| **Icono de Documento** | Izquierda | Icono azul de documento en cuadrado redondeado |
| **Tipo de Documento** | Superior izquierda | "Cotización" o "Factura" (bold) |
| **Nombre del Contratista** | Centro izquierda | "De: {nombre}" (gris) |
| **Fecha** | Inferior izquierda | Formato: "26 de noviembre de 2025, 16:07" |
| **Monto** | Superior derecha | "$5000.00" (grande, bold) |
| **Estado** | Inferior derecha | Badge "Pendiente" o "Pagado" |
| **Botones de Acción** | Parte inferior | Ver, Descargar, Pagar |

### 2.3 Colores y Estilos

#### Icono de Documento
```css
Background: #DBEAFE (azul claro)
Icon color: #2563EB (azul)
Border radius: 8px
Size: 48x48px
```

#### Badge de Estado "Pendiente"
```css
Background: #FEF3C7 (amarillo claro)
Text color: #B45309 (amarillo oscuro)
Padding: 4px 8px
Border radius: 4px
Font size: 12px
```

#### Badge de Estado "Pagado"
```css
Background: #D1FAE5 (verde claro)
Text color: #047857 (verde oscuro)
Padding: 4px 8px
Border radius: 4px
Font size: 12px
```

#### Botones
```css
Ver (outline):
  Border: 1px solid #E5E7EB
  Text color: #374151
  Padding: 8px 16px

Descargar (outline):
  Border: 1px solid #E5E7EB
  Text color: #374151
  Padding: 8px 16px

Pagar (filled):
  Background: #2563EB (azul)
  Text color: #FFFFFF (blanco)
  Padding: 8px 16px
  Icon: $ (dólar)
```

### 2.4 Espaciado y Márgenes

```
Card padding: 16px
Space between cards: 16px vertical
Icon → Text: 16px horizontal
Text lines: 4px vertical
Buttons: 8px horizontal gap
```

---

## 3. Estructura de Datos

### 3.1 Modelo de Documento (ClientDocumentDto)

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
  final String date; // ISO 8601 format
  final String status; // "Pendiente", "Pagada", "Enviada", "Revision"
  final String? pdfUrl; // Puede ser null si no hay PDF

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

  // Helpers
  String get documentTypeLabel => kind == 'Cotizacion' ? 'Cotización' : 'Factura';
  String get statusLabel => status == 'Pendiente' ? 'Pendiente' : 'Pagado';
  bool get isPending => status == 'Pendiente';
  bool get hasPdf => pdfUrl != null && pdfUrl!.isNotEmpty;
}
```

### 3.2 Endpoint para Obtener Documentos

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
    "contractorAddress": null,
    "contractorAvatarUrl": null,
    "kind": "Cotizacion",
    "amount": 5000.00,
    "date": "2025-11-26T16:07:00Z",
    "status": "Pendiente",
    "pdfUrl": "/uploads/documents/cotizacion_1.pdf"
  }
]
```

---

## 4. Flujo Completo de Pago

### 4.1 Diagrama de Flujo Visual

```
┌─────────────────────────────────────────────────────────┐
│ Cliente ve documento con estado "Pendiente"            │
│ Botón "Pagar" está visible y habilitado                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Cliente hace clic en botón "Pagar"                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Se abre modal de pago (fullscreen en móvil)            │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │  💳 Registrar Pago                                  │ │
│ │  Pagar Cotización #1                                │ │
│ │                                                      │ │
│ │  ┌────────────────────────────────────────────┐    │ │
│ │  │ Tipo: Cotización                            │    │ │
│ │  │ Contratista: tito mendez                    │    │ │
│ │  │ Monto: $5000.00                             │    │ │
│ │  │ Fecha: 26/11/2025                           │    │ │
│ │  └────────────────────────────────────────────┘    │ │
│ │                                                      │ │
│ │  Método de Pago:                                    │ │
│ │  ○ Efectivo                                         │ │
│ │  ○ Transferencia / Tarjeta                          │ │
│ │                                                      │ │
│ │  [Cancelar]  [Registrar Pago]                       │ │
│ └────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ├───── EFECTIVO ─────┐
                   │                     │
                   └── TRANSFERENCIA ───┤
                                        │
                                        ▼
                     ┌─────────────────────────────────────┐
                     │ Si es TRANSFERENCIA:                │
                     │ - Se muestra campo de comprobante   │
                     │ - Cliente sube imagen/PDF           │
                     │ - Campo de notas opcional           │
                     └──────────────┬──────────────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────────────┐
                     │ Cliente hace clic en "Registrar     │
                     │ Pago"                                │
                     └──────────────┬──────────────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────────────┐
                     │ Validaciones:                       │
                     │ - Si Transferencia → comprobante    │
                     │   requerido                         │
                     │ - Tamaño máximo: 5MB                │
                     │ - Formatos: JPG, PNG, PDF           │
                     └──────────────┬──────────────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────────────┐
                     │ POST /api/Documents/{id}/pay        │
                     │ {                                   │
                     │   clientId: 789,                    │
                     │   paymentMethod: "Efectivo",        │
                     │   paymentProofUrl: "...",           │
                     │   notes: "..."                      │
                     │ }                                   │
                     └──────────────┬──────────────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────────────┐
                     │ Backend actualiza documento:        │
                     │ - status: "Pagado"                  │
                     │ - paidDate: fecha actual            │
                     │ - Notifica al contratista           │
                     └──────────────┬──────────────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────────────┐
                     │ UI muestra mensaje de éxito:        │
                     │ ✅ "Pago registrado"                │
                     │                                     │
                     │ Documento: Cotización               │
                     │ Monto: $5000.00                     │
                     │ Método: Efectivo                    │
                     │ El contratista ha sido notificado   │
                     └──────────────┬──────────────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────────────┐
                     │ Modal se cierra                     │
                     │ Lista de documentos se recarga      │
                     │ Badge cambia a "Pagado" (verde)     │
                     │ Botón "Pagar" desaparece            │
                     └─────────────────────────────────────┘
```

### 4.2 Estados del Modal de Pago

| Estado | Descripción | UI |
|--------|-------------|-----|
| **Idle** | Modal cerrado, esperando acción | - |
| **Open** | Modal abierto, formulario limpio | Muestra formulario |
| **Uploading File** | Subiendo comprobante (si aplica) | Botón deshabilitado + spinner |
| **Submitting** | Enviando pago al backend | Botón "Registrando..." + spinner |
| **Success** | Pago registrado exitosamente | Alert de éxito + cierra modal |
| **Error** | Error en el proceso | Alert rojo con mensaje |

---

## 5. Visualización de PDF

### 5.1 ¿Cómo Funciona la Visualización?

Cuando el cliente hace clic en **"Ver"** o **"Descargar"**, se procesan las URLs del PDF:

#### Función: Construir URL Completa

```typescript
// Si pdfUrl = "/uploads/documents/cotizacion_1.pdf"
// Base URL = "https://render-deploy-latest.onrender.com"
// → Full URL = "https://render-deploy-latest.onrender.com/uploads/documents/cotizacion_1.pdf"

const buildFullPdfUrl = (pdfUrl: string): string => {
  // Si ya es URL completa, retornarla
  if (pdfUrl.startsWith("http://") || pdfUrl.startsWith("https://")) {
    return pdfUrl;
  }

  // Construir URL completa
  const baseUrl = "https://render-deploy-latest.onrender.com";
  const cleanPath = pdfUrl.startsWith("/") ? pdfUrl : `/${pdfUrl}`;
  return `${baseUrl}${cleanPath}`;
};
```

### 5.2 Botón "Ver"

**Comportamiento:**
- Abre el PDF en una **nueva pestaña** del navegador
- El navegador muestra el visor de PDF nativo
- El usuario puede ver, descargar o imprimir desde ahí

**Implementación:**
```typescript
const handleView = () => {
  if (!document.pdfUrl) {
    alert("Este documento no tiene archivo adjunto");
    return;
  }

  const fullUrl = buildFullPdfUrl(document.pdfUrl);
  window.open(fullUrl, "_blank", "noopener,noreferrer");
};
```

### 5.3 Botón "Descargar"

**Comportamiento:**
- Descarga el PDF directamente al dispositivo
- El archivo se guarda con nombre descriptivo

**Implementación:**
```typescript
const handleDownload = async () => {
  if (!document.pdfUrl) {
    alert("Este documento no tiene archivo adjunto");
    return;
  }

  const fullUrl = buildFullPdfUrl(document.pdfUrl);
  const link = document.createElement("a");
  link.href = fullUrl;

  // Nombre del archivo: cotizacion_titomendez_2025-11-26.pdf
  const filename = `${document.kind.toLowerCase()}_${document.contractorName.replace(/\s/g, '')}_${new Date(document.date).toISOString().split('T')[0]}.pdf`;
  link.download = filename;

  link.click();
};
```

---

## 6. Implementación en Flutter

### 6.1 Dependencias Necesarias

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP y networking
  dio: ^5.4.0

  # State management
  provider: ^6.1.1

  # UI
  intl: ^0.19.0  # Para formateo de fechas

  # PDF
  flutter_pdfview: ^1.3.2  # Ver PDFs
  path_provider: ^2.1.2     # Descargar PDFs

  # File picker
  file_picker: ^6.1.1       # Seleccionar comprobantes

  # Permisos
  permission_handler: ^11.1.0
```

### 6.2 Servicio de Documentos

```dart
// lib/services/document_service.dart
import 'package:dio/dio.dart';
import 'dart:io';
import '../models/client_document_dto.dart';

class DocumentService {
  final Dio _dio;
  final String baseUrl = 'https://render-deploy-latest.onrender.com/api';

  DocumentService(this._dio);

  /// Obtener documentos del cliente
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

  /// Construir URL completa del PDF
  String buildFullPdfUrl(String pdfUrl) {
    if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
      return pdfUrl;
    }

    final cleanPath = pdfUrl.startsWith('/') ? pdfUrl : '/$pdfUrl';
    return 'https://render-deploy-latest.onrender.com$cleanPath';
  }

  /// Descargar PDF
  Future<String> downloadPdf(String pdfUrl, String fileName) async {
    try {
      final fullUrl = buildFullPdfUrl(pdfUrl);
      final directory = await getApplicationDocumentsDirectory();
      final filePath = '${directory.path}/$fileName';

      await _dio.download(fullUrl, filePath);
      return filePath;
    } catch (e) {
      throw Exception('Error al descargar PDF: $e');
    }
  }

  /// Registrar pago de documento
  Future<Map<String, dynamic>> registerPayment(
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
}
```

### 6.3 Modelo de DTO de Pago

```dart
// lib/models/register_document_payment_dto.dart
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

## 7. Widgets Completos

### 7.1 Widget: Lista de Documentos

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
          return const Center(
            child: CircularProgressIndicator(),
          );
        }

        if (provider.error != null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red,
                ),
                const SizedBox(height: 16),
                Text(
                  provider.error!,
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => provider.fetchDocuments(),
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          );
        }

        if (provider.documents.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.description_outlined,
                  size: 64,
                  color: Colors.grey.shade400,
                ),
                const SizedBox(height: 16),
                Text(
                  'Aún no tienes documentos',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Cuando el contratista envíe uno, aparecerá aquí.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade500,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => provider.fetchDocuments(),
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: provider.documents.length,
            separatorBuilder: (context, index) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final document = provider.documents[index];
              return DocumentCard(
                document: document,
                onPay: () => _showPaymentModal(context, document),
                onView: () => _viewPdf(context, document),
                onDownload: () => _downloadPdf(context, document),
              );
            },
          ),
        );
      },
    );
  }

  void _showPaymentModal(BuildContext context, ClientDocumentDto document) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DocumentPaymentModal(document: document),
    );
  }

  void _viewPdf(BuildContext context, ClientDocumentDto document) {
    if (!document.hasPdf) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Este documento no tiene PDF')),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PdfViewerScreen(
          pdfUrl: document.pdfUrl!,
          title: document.documentTypeLabel,
        ),
      ),
    );
  }

  Future<void> _downloadPdf(BuildContext context, ClientDocumentDto document) async {
    if (!document.hasPdf) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Este documento no tiene PDF')),
      );
      return;
    }

    try {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Descargando PDF...')),
      );

      final provider = context.read<DocumentProvider>();
      final fileName = _generateFileName(document);
      await provider.downloadPdf(document.pdfUrl!, fileName);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('PDF descargado correctamente'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al descargar: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  String _generateFileName(ClientDocumentDto document) {
    final date = DateTime.parse(document.date);
    final formattedDate = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    final contractor = document.contractorName.replaceAll(RegExp(r'[^a-z0-9]', caseSensitive: false), '_').toLowerCase();
    final kind = document.kind.toLowerCase();

    return '${kind}_${contractor}_$formattedDate.pdf';
  }
}
```

### 7.2 Widget: Tarjeta de Documento

```dart
// lib/widgets/document_card.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/client_document_dto.dart';

class DocumentCard extends StatelessWidget {
  final ClientDocumentDto document;
  final VoidCallback? onPay;
  final VoidCallback? onView;
  final VoidCallback? onDownload;

  const DocumentCard({
    Key? key,
    required this.document,
    this.onPay,
    this.onView,
    this.onDownload,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: Icono, título, monto y estado
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icono
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
                        document.documentTypeLabel,
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
                    _buildStatusBadge(),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Botones de acción
            Row(
              children: [
                if (document.hasPdf) ...[
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: onView,
                      icon: const Icon(Icons.visibility, size: 18),
                      label: const Text('Ver'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: onDownload,
                      icon: const Icon(Icons.download, size: 18),
                      label: const Text('Descargar'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
                if (document.isPending && onPay != null) ...[
                  if (document.hasPdf) const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: onPay,
                      icon: const Icon(Icons.attach_money, size: 18),
                      label: const Text('Pagar'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue.shade600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge() {
    Color bgColor;
    Color textColor;

    switch (document.status) {
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
        document.statusLabel,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    final formatter = DateFormat('d \'de\' MMMM \'de\' y, HH:mm', 'es_ES');
    return formatter.format(date);
  }
}
```

### 7.3 Widget: Modal de Pago

```dart
// lib/widgets/document_payment_modal.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import '../models/client_document_dto.dart';
import '../providers/document_provider.dart';

class DocumentPaymentModal extends StatefulWidget {
  final ClientDocumentDto document;

  const DocumentPaymentModal({
    Key? key,
    required this.document,
  }) : super(key: key);

  @override
  State<DocumentPaymentModal> createState() => _DocumentPaymentModalState();
}

class _DocumentPaymentModalState extends State<DocumentPaymentModal> {
  String _paymentMethod = 'Efectivo';
  File? _proofFile;
  final _notesController = TextEditingController();
  bool _isSubmitting = false;
  String? _error;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              children: [
                Icon(Icons.credit_card, color: Colors.blue.shade600),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Registrar Pago',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Pagar ${widget.document.documentTypeLabel} #${widget.document.id}',
              style: TextStyle(color: Colors.grey.shade600),
            ),
            const SizedBox(height: 24),

            // Información del documento
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  _buildInfoRow('Tipo:', widget.document.documentTypeLabel),
                  _buildInfoRow('Contratista:', widget.document.contractorName),
                  _buildInfoRow('Monto:', '\$${widget.document.amount.toStringAsFixed(2)}', isBold: true),
                  _buildInfoRow('Fecha:', _formatDate(widget.document.date)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Método de pago
            const Text(
              'Método de Pago',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 12),
            _buildPaymentMethodOption(
              'Efectivo',
              'Pago realizado en efectivo al contratista',
            ),
            const SizedBox(height: 8),
            _buildPaymentMethodOption(
              'Transferencia',
              'Pago electrónico con comprobante',
            ),
            const SizedBox(height: 24),

            // Comprobante (solo si es transferencia)
            if (_paymentMethod == 'Transferencia') ...[
              const Text(
                'Comprobante de Pago *',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 12),
              _buildFileUploader(),
              const SizedBox(height: 24),
            ],

            // Notas
            const Text(
              'Notas (Opcional)',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _notesController,
              maxLines: 3,
              maxLength: 200,
              decoration: InputDecoration(
                hintText: 'Añade información adicional sobre el pago...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Error
            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline, color: Colors.red.shade700),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _error!,
                        style: TextStyle(color: Colors.red.shade700),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Botones
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _isSubmitting ? null : () => Navigator.pop(context),
                    child: const Text('Cancelar'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue.shade600,
                      foregroundColor: Colors.white,
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Registrar Pago'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(color: Colors.grey.shade600),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: isBold ? Colors.blue.shade600 : Colors.black,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodOption(String method, String description) {
    final isSelected = _paymentMethod == method;

    return InkWell(
      onTap: () => setState(() => _paymentMethod = method),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? Colors.blue.shade600 : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Radio<String>(
              value: method,
              groupValue: _paymentMethod,
              onChanged: (value) => setState(() => _paymentMethod = value!),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    method,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  Text(
                    description,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFileUploader() {
    return InkWell(
      onTap: _pickFile,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: Colors.grey.shade300,
            width: 2,
            style: BorderStyle.solid,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Icon(
              Icons.upload_file,
              size: 48,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 8),
            if (_proofFile != null) ...[
              Text(
                _proofFile!.path.split('/').last,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: Colors.green,
                ),
              ),
              Text(
                '${(_proofFile!.lengthSync() / 1024).toStringAsFixed(2)} KB',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                ),
              ),
            ] else ...[
              const Text(
                'Haz clic para seleccionar archivo',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              Text(
                'JPG, PNG o PDF (máx. 5MB)',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
    );

    if (result != null) {
      final file = File(result.files.single.path!);

      // Validar tamaño
      if (file.lengthSync() > 5 * 1024 * 1024) {
        setState(() {
          _error = 'El archivo no puede superar los 5MB';
        });
        return;
      }

      setState(() {
        _proofFile = file;
        _error = null;
      });
    }
  }

  Future<void> _handleSubmit() async {
    setState(() => _error = null);

    // Validar
    if (_paymentMethod == 'Transferencia' && _proofFile == null) {
      setState(() {
        _error = 'Debes adjuntar un comprobante de pago para transferencia';
      });
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final provider = context.read<DocumentProvider>();

      // TODO: Subir comprobante si existe
      String? proofUrl;
      if (_proofFile != null) {
        // Aquí deberías implementar la subida del archivo
        // proofUrl = await uploadFile(_proofFile!);
        proofUrl = 'temp_url'; // Por ahora
      }

      await provider.payDocument(
        widget.document.id,
        paymentMethod: _paymentMethod,
        paymentProofUrl: proofUrl,
        notes: _notesController.text.trim(),
      );

      Navigator.pop(context);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pago registrado exitosamente'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      setState(() {
        _error = 'No se pudo registrar el pago';
        _isSubmitting = false;
      });
    }
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    return '${date.day}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}
```

---

## 8. Validaciones y Estados

### 8.1 Tabla de Validaciones

| Campo | Validación | Mensaje de Error |
|-------|-----------|------------------|
| **Método de pago** | Requerido | - |
| **Comprobante (Transferencia)** | Requerido si método = "Transferencia" | "Debes adjuntar un comprobante de pago para transferencia" |
| **Tamaño de archivo** | Máximo 5MB | "El archivo no puede superar los 5MB" |
| **Tipo de archivo** | JPG, PNG, PDF | "Solo se permiten archivos JPG, PNG o PDF" |
| **Notas** | Opcional, máximo 200 caracteres | - |

### 8.2 Estados de los Botones

| Botón | Condición para Mostrar | Acción |
|-------|----------------------|--------|
| **Ver** | `document.pdfUrl != null` | Abrir PDF en visor |
| **Descargar** | `document.pdfUrl != null` | Descargar PDF |
| **Pagar** | `document.status == "Pendiente"` | Abrir modal de pago |

### 8.3 Colores por Estado

```dart
class DocumentColors {
  static Color getStatusBackgroundColor(String status) {
    switch (status) {
      case 'Pagada':
        return const Color(0xFFD1FAE5); // Verde claro
      case 'Pendiente':
      default:
        return const Color(0xFFFEF3C7); // Amarillo claro
    }
  }

  static Color getStatusTextColor(String status) {
    switch (status) {
      case 'Pagada':
        return const Color(0xFF047857); // Verde oscuro
      case 'Pendiente':
      default:
        return const Color(0xFFB45309); // Amarillo oscuro
    }
  }
}
```

---

## 9. Resumen de Implementación

### Checklist Completo

#### UI Components
- [ ] Widget `DocumentsList`
- [ ] Widget `DocumentCard` con diseño exacto
- [ ] Widget `DocumentPaymentModal`
- [ ] Iconos y colores correctos
- [ ] Badges de estado con colores correctos
- [ ] Botones con íconos y estilos correctos

#### Funcionalidad
- [ ] Cargar documentos del cliente
- [ ] Mostrar información del documento
- [ ] Ver PDF (abrir en visor)
- [ ] Descargar PDF
- [ ] Seleccionar método de pago
- [ ] Subir comprobante (solo transferencia)
- [ ] Validar tamaño y tipo de archivo
- [ ] Registrar pago
- [ ] Mostrar mensajes de éxito/error
- [ ] Actualizar lista después del pago

#### Estado
- [ ] Provider con loading, error, data
- [ ] Refresh indicator
- [ ] Loading spinners
- [ ] Error handling

---

## 10. Notas Finales

### Diferencias Clave entre Web y Móvil

| Aspecto | Web (React) | Móvil (Flutter) |
|---------|-------------|----------------|
| **Modal** | Dialog flotante | BottomSheet full-height |
| **Ver PDF** | `window.open()` nueva pestaña | Navigator push a PdfViewerScreen |
| **Descargar** | `<a download>` | `dio.download()` + path_provider |
| **Comprobante** | `<input type="file">` | `FilePicker.platform.pickFiles()` |

### Paquetes Recomendados

```yaml
flutter_pdfview: ^1.3.2    # Ver PDFs nativamente
path_provider: ^2.1.2      # Directorios del sistema
file_picker: ^6.1.1        # Selector de archivos
permission_handler: ^11.1.0 # Permisos de almacenamiento
```

---

**¡Todo listo para implementar en Flutter!** 🚀

Este documento contiene TODO lo necesario para replicar exactamente la funcionalidad del dashboard del cliente en Flutter.
