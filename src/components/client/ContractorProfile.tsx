// src/components/client/ContractorProfile.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Mail,
  Phone,
  Briefcase,
  ArrowLeft,
  Star,
} from "lucide-react";
import { StarRating } from "./StarRating";
import { getContractorRatingSummary } from "@/services/ratingService";
import type { ContractorRatingSummary } from "@/types/rating";

export const ContractorProfile = () => {
  const { contractorId } = useParams<{ contractorId: string }>();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState<ContractorRatingSummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contractorId) {
      loadContractorProfile(Number(contractorId));
    }
  }, [contractorId]);

  const loadContractorProfile = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContractorRatingSummary(id);
      setContractor(data);
    } catch (err) {
      console.error("Error al cargar perfil del contratista:", err);
      setError("No se pudo cargar el perfil del contratista.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Hoy";
      if (diffDays === 1) return "Ayer";
      if (diffDays < 7) return `Hace ${diffDays} días`;
      if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
      if (diffDays < 365)
        return `Hace ${Math.floor(diffDays / 30)} meses`;

      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getRatingDistribution = () => {
    if (!contractor) return [];

    const total = contractor.totalRatings || 1; // Evitar división por cero

    return [
      {
        stars: 5,
        count: contractor.fiveStars,
        percentage: (contractor.fiveStars / total) * 100,
      },
      {
        stars: 4,
        count: contractor.fourStars,
        percentage: (contractor.fourStars / total) * 100,
      },
      {
        stars: 3,
        count: contractor.threeStars,
        percentage: (contractor.threeStars / total) * 100,
      },
      {
        stars: 2,
        count: contractor.twoStars,
        percentage: (contractor.twoStars / total) * 100,
      },
      {
        stars: 1,
        count: contractor.oneStar,
        percentage: (contractor.oneStar / total) * 100,
      },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando perfil...</span>
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-4">{error || "Contratista no encontrado"}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  const distribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Botón volver */}
      <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>

      {/* Header del perfil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={contractor.contractorAvatarUrl || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl font-semibold">
                {contractor.contractorName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {contractor.contractorName}
              </h1>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {contractor.contractorEmail}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {contractor.contractorPhone}
                </p>
              </div>

              {/* Estadísticas principales */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={contractor.averageRating}
                    totalRatings={contractor.totalRatings}
                    size="medium"
                    showLabel
                  />
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-semibold">
                    {contractor.totalServicesCompleted}
                  </span>
                  <span>servicios completados</span>
                </div>
              </div>

              {/* Botón de acción */}
              <Button className="mt-4">Solicitar servicio</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribución de calificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de calificaciones</CardTitle>
          <CardDescription>
            Basado en {contractor.totalRatings}{" "}
            {contractor.totalRatings === 1 ? "reseña" : "reseñas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{item.stars}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>

                {/* Barra de progreso */}
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <span className="text-sm text-gray-600 w-12 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reseñas recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Reseñas recientes</CardTitle>
          <CardDescription>
            {contractor.recentReviews.length > 0
              ? `Mostrando las ${contractor.recentReviews.length} reseñas más recientes`
              : "No hay reseñas aún"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contractor.recentReviews.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Este contratista aún no tiene reseñas</p>
            </div>
          ) : (
            <div className="space-y-6">
              {contractor.recentReviews.map((review) => (
                <div key={review.ratingId} className="border-b last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">
                          {review.clientName}
                        </h4>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <StarRating
                          rating={review.stars}
                          size="small"
                          showLabel={false}
                        />
                        <Badge variant="outline" className="text-xs">
                          {review.serviceName}
                        </Badge>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
