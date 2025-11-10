# 📚 Ejemplos de Uso - Sistema de Calificaciones

Esta guía muestra cómo usar los componentes del sistema de calificaciones en diferentes escenarios.

---

## 1. Componente StarRating

### Ejemplo 1: Mostrar calificación (Modo lectura)

```tsx
import { StarRating } from "@/components/client/StarRating";

// Mostrar calificación de un contratista
<StarRating
  rating={4.5}
  totalRatings={23}
  size="medium"
  showLabel
/>
// Resultado: ⭐⭐⭐⭐⭐ 4.5 (23 reseñas)
```

### Ejemplo 2: Selector interactivo de estrellas

```tsx
import { StarRating } from "@/components/client/StarRating";
import { useState } from "react";

function RatingSelector() {
  const [stars, setStars] = useState(0);

  return (
    <div>
      <StarRating
        rating={stars}
        size="large"
        interactive
        onChange={setStars}
        showLabel={false}
      />
      <p>Has seleccionado: {stars} estrellas</p>
    </div>
  );
}
```

### Ejemplo 3: Estrellas pequeñas sin etiqueta

```tsx
<StarRating
  rating={5}
  size="small"
  showLabel={false}
/>
// Resultado: Solo las 5 estrellas doradas
```

---

## 2. Modal de Calificación (RatingModal)

### Ejemplo 1: Integración básica

```tsx
import { RatingModal } from "@/components/client/RatingModal";
import { useState } from "react";

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Calificar servicio
      </button>

      <RatingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestId={203}
        contractorId={5}
        contractorName="Carlos Martínez"
        contractorAvatarUrl="https://example.com/avatar.jpg"
        serviceName="Plomería"
        serviceDate="2025-10-25T16:00:00Z"
        onSuccess={() => {
          console.log("Calificación exitosa!");
          // Recargar datos, mostrar mensaje, etc.
        }}
      />
    </>
  );
}
```

### Ejemplo 2: Abrir modal después de pagar

```tsx
import { RatingModal } from "@/components/client/RatingModal";
import { checkIfRated } from "@/services/ratingService";
import { useState } from "react";

function PaymentConfirmation({ serviceRequest }) {
  const [ratingModalData, setRatingModalData] = useState(null);

  const handlePaymentSuccess = async () => {
    // 1. Confirmar pago en backend
    await confirmPayment(serviceRequest.id);

    // 2. Verificar si ya calificó
    const { hasRated } = await checkIfRated(serviceRequest.id);

    // 3. Si no ha calificado, abrir modal
    if (!hasRated) {
      setRatingModalData({
        isOpen: true,
        requestId: serviceRequest.id,
        contractorId: serviceRequest.contractorId,
        contractorName: serviceRequest.contractorName,
        contractorAvatarUrl: serviceRequest.contractorAvatarUrl,
        serviceName: serviceRequest.serviceName,
        serviceDate: serviceRequest.serviceDate,
      });
    }
  };

  return (
    <>
      <button onClick={handlePaymentSuccess}>
        Confirmar pago
      </button>

      {ratingModalData && (
        <RatingModal
          {...ratingModalData}
          onClose={() => setRatingModalData(null)}
          onSuccess={() => {
            setRatingModalData(null);
            // Navegar al historial o mostrar mensaje
          }}
        />
      )}
    </>
  );
}
```

---

## 3. Perfil de Contratista (ContractorProfile)

### Ejemplo 1: Ruta en React Router

```tsx
// En clientRoutes.tsx o donde definas tus rutas
import { ContractorProfile } from "@/components/client/ContractorProfile";

export const clientRoutes = [
  {
    path: "/client",
    element: <ClientLayout />,
    children: [
      {
        path: "contractor/:contractorId",
        element: <ContractorProfile />
      }
    ]
  }
];
```

### Ejemplo 2: Navegar al perfil desde una lista

```tsx
import { useNavigate } from "react-router-dom";

function ContractorCard({ contractor }) {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/client/contractor/${contractor.id}`)}>
      <h3>{contractor.fullName}</h3>
      <StarRating rating={contractor.averageRating} totalRatings={contractor.totalRatings} />
    </div>
  );
}
```

---

## 4. Historial de Servicios (HistoryList)

### Uso básico

```tsx
// En tu dashboard de cliente
import { HistoryList } from "@/components/client/HistoryList";

function ClientDashboard() {
  return (
    <div>
      <h1>Mi Dashboard</h1>
      <HistoryList />
    </div>
  );
}

// El componente:
// ✅ Obtiene automáticamente el userId del contexto AuthContext
// ✅ Carga el historial desde la API
// ✅ Muestra botón "Calificar" para servicios sin calificar
// ✅ Muestra estrellas para servicios ya calificados
// ✅ Integra el RatingModal automáticamente
```

---

## 5. Servicios API (ratingService)

### Ejemplo 1: Obtener resumen de calificaciones

```tsx
import { getContractorRatingSummary } from "@/services/ratingService";
import { useEffect, useState } from "react";

function ContractorStats({ contractorId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await getContractorRatingSummary(contractorId);
        setSummary(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [contractorId]);

  if (loading) return <p>Cargando...</p>;
  if (!summary) return <p>Error</p>;

  return (
    <div>
      <h3>{summary.contractorName}</h3>
      <StarRating
        rating={summary.averageRating}
        totalRatings={summary.totalRatings}
      />
      <p>Servicios completados: {summary.totalServicesCompleted}</p>

      <h4>Distribución de calificaciones:</h4>
      <ul>
        <li>5 estrellas: {summary.fiveStars}</li>
        <li>4 estrellas: {summary.fourStars}</li>
        <li>3 estrellas: {summary.threeStars}</li>
        <li>2 estrellas: {summary.twoStars}</li>
        <li>1 estrella: {summary.oneStar}</li>
      </ul>
    </div>
  );
}
```

### Ejemplo 2: Crear una calificación

```tsx
import { createRating } from "@/services/ratingService";
import { toast } from "sonner";

async function submitRating(requestId, contractorId, stars, comment) {
  try {
    const rating = await createRating({
      requestId,
      contractorId,
      stars,
      comment: comment || undefined
    });

    toast.success("¡Calificación enviada exitosamente!");
    return rating;

  } catch (error) {
    if (error.response?.status === 409) {
      toast.info("Ya has calificado este servicio");
    } else if (error.response?.status === 404) {
      toast.error("El servicio no existe");
    } else if (error.response?.status === 401) {
      toast.error("Debes iniciar sesión");
    } else {
      toast.error("Error al enviar la calificación");
    }
    throw error;
  }
}
```

### Ejemplo 3: Verificar si ya calificó

```tsx
import { checkIfRated } from "@/services/ratingService";

async function canRateService(requestId) {
  try {
    const { hasRated } = await checkIfRated(requestId);
    return !hasRated;
  } catch (error) {
    console.error("Error al verificar:", error);
    return false;
  }
}

// Uso:
const canRate = await canRateService(203);
if (canRate) {
  // Mostrar botón "Calificar"
} else {
  // Mostrar mensaje "Ya calificaste"
}
```

### Ejemplo 4: Obtener historial del cliente

```tsx
import { getServiceRequestHistory } from "@/services/ratingService";
import { useAuth } from "@/context/AuthContext";

function MyHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function loadHistory() {
      if (!user?.userId) return;

      const data = await getServiceRequestHistory(user.userId);
      setHistory(data);
    }

    loadHistory();
  }, [user?.userId]);

  return (
    <div>
      {history.map((service) => (
        <div key={service.requestId}>
          <h3>{service.serviceName}</h3>
          <p>Contratista: {service.contractorName}</p>

          {service.hasRating ? (
            <div>
              <StarRating rating={service.ratingStars} showLabel={false} />
              <span>Ya calificaste este servicio</span>
            </div>
          ) : (
            <button>Calificar servicio</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 6. Hook Personalizado para Calificaciones

### Crear un hook reutilizable

```tsx
// src/hooks/useRating.ts
import { useState, useEffect } from "react";
import { getContractorRatingSummary } from "@/services/ratingService";
import type { ContractorRatingSummary } from "@/types/rating";

export function useRating(contractorId: number | null) {
  const [summary, setSummary] = useState<ContractorRatingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contractorId) {
      setSummary(null);
      return;
    }

    let isMounted = true;

    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);
        const data = await getContractorRatingSummary(contractorId);
        if (isMounted) setSummary(data);
      } catch (err) {
        console.error("Error al cargar calificaciones:", err);
        if (isMounted) setError("No se pudieron cargar las calificaciones");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [contractorId]);

  return { summary, loading, error };
}

// Uso:
function ContractorCard({ contractorId }) {
  const { summary, loading, error } = useRating(contractorId);

  if (loading) return <p>Cargando calificaciones...</p>;
  if (error) return <p>{error}</p>;
  if (!summary) return null;

  return (
    <div>
      <h3>{summary.contractorName}</h3>
      <StarRating
        rating={summary.averageRating}
        totalRatings={summary.totalRatings}
      />
    </div>
  );
}
```

---

## 7. Gráfico de Distribución de Estrellas

### Crear componente personalizado

```tsx
// src/components/client/RatingDistribution.tsx
import { Star } from "lucide-react";

interface RatingDistributionProps {
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
  totalRatings: number;
}

export function RatingDistribution({
  fiveStars,
  fourStars,
  threeStars,
  twoStars,
  oneStar,
  totalRatings,
}: RatingDistributionProps) {
  const distribution = [
    { stars: 5, count: fiveStars },
    { stars: 4, count: fourStars },
    { stars: 3, count: threeStars },
    { stars: 2, count: twoStars },
    { stars: 1, count: oneStar },
  ];

  return (
    <div className="space-y-2">
      {distribution.map(({ stars, count }) => {
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

        return (
          <div key={stars} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-16">
              <span className="text-sm font-medium">{stars}</span>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>

            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <span className="text-sm text-gray-600 w-12 text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Uso:
<RatingDistribution
  fiveStars={15}
  fourStars={6}
  threeStars={2}
  twoStars={0}
  oneStar={0}
  totalRatings={23}
/>
```

---

## 8. Formato de Fechas Relativas

### Función reutilizable

```tsx
// src/utils/dateFormatter.ts
export function formatRelativeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

// Uso:
<p>{formatRelativeDate("2025-10-25T16:00:00Z")}</p>
// Resultado: "Hace 10 días"
```

---

## 9. Componente de Reseña Individual

### Crear tarjeta de reseña reutilizable

```tsx
// src/components/client/ReviewCard.tsx
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeDate } from "@/utils/dateFormatter";

interface ReviewCardProps {
  clientName: string;
  stars: number;
  comment: string | null;
  date: string;
  serviceName: string;
  clientAvatarUrl?: string | null;
}

export function ReviewCard({
  clientName,
  stars,
  comment,
  date,
  serviceName,
  clientAvatarUrl,
}: ReviewCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={clientAvatarUrl || undefined} />
          <AvatarFallback>
            {clientName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{clientName}</h4>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">
              {formatRelativeDate(date)}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={stars} size="small" showLabel={false} />
            <Badge variant="outline" className="text-xs">
              {serviceName}
            </Badge>
          </div>

          {comment && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Uso:
<ReviewCard
  clientName="Juan Pérez"
  stars={5}
  comment="Excelente trabajo, muy profesional"
  date="2025-10-25T16:00:00Z"
  serviceName="Plomería"
/>
```

---

## 10. Manejo de Errores Centralizado

### Crear función helper

```tsx
// src/utils/errorHandler.ts
import { toast } from "sonner";
import { AxiosError } from "axios";

export function handleRatingError(error: unknown, context: string) {
  console.error(`Error en ${context}:`, error);

  if (error instanceof AxiosError) {
    switch (error.response?.status) {
      case 400:
        toast.error("Datos de calificación inválidos");
        break;
      case 401:
        toast.error("Debes iniciar sesión para calificar");
        break;
      case 404:
        toast.error("El servicio no existe o ha sido eliminado");
        break;
      case 409:
        toast.info("Ya has calificado este servicio previamente");
        break;
      default:
        toast.error(`Error al ${context}`);
    }
  } else {
    toast.error("Error inesperado. Intenta nuevamente.");
  }
}

// Uso:
try {
  await createRating(ratingData);
  toast.success("¡Calificación enviada!");
} catch (error) {
  handleRatingError(error, "enviar la calificación");
}
```

---

## 🎯 Consejos y Mejores Prácticas

### 1. Siempre verificar autenticación

```tsx
import { useAuth } from "@/context/AuthContext";

function RatingButton() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Debes iniciar sesión para calificar</p>;
  }

  return <button>Calificar servicio</button>;
}
```

### 2. Manejar estados de carga

```tsx
{loading && <Loader2 className="animate-spin" />}
{error && <p className="text-red-500">{error}</p>}
{!loading && !error && data && <YourComponent data={data} />}
```

### 3. Validar antes de enviar

```tsx
function validateRating(stars: number, comment: string): boolean {
  if (stars < 1 || stars > 5) {
    toast.error("Selecciona entre 1 y 5 estrellas");
    return false;
  }

  if (comment.length > 1000) {
    toast.error("El comentario no puede exceder 1000 caracteres");
    return false;
  }

  return true;
}
```

### 4. Usar claves únicas en listas

```tsx
{reviews.map((review) => (
  <ReviewCard key={review.ratingId} {...review} />
))}
```

### 5. Cleanup en useEffect

```tsx
useEffect(() => {
  let isMounted = true;

  async function fetchData() {
    const data = await loadData();
    if (isMounted) setData(data);
  }

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);
```

---

## 🚀 Próximos Pasos

Ahora que tienes todos los componentes implementados, puedes:

1. **Integrar el RatingModal** después del flujo de pago
2. **Agregar la ruta** para ContractorProfile
3. **Probar el flujo completo** de calificación
4. **Personalizar estilos** según tu diseño
5. **Agregar más características** como filtros y ordenamiento

¡El sistema está listo para usar! 🎉
