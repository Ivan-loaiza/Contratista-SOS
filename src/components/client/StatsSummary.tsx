import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFavoriteContractors } from "@/hooks/useFavoriteContractors";

export const StatsSummary = () => {
  const { user } = useAuth();
  const {
    favorites,
    mostRequested,
    loading,
    error,
    hasFavorites,
    addToFavorites,
    removeFromFavorites,
    loadMostRequested,
  } = useFavoriteContractors(user?.userId);

  // Cargar los más solicitados al montar el componente
  useEffect(() => {
    if (user?.userId) {
      loadMostRequested(2); // Top 2 para mostrar en el resumen
    }
  }, [user?.userId, loadMostRequested]);

  const handleToggleFavorite = async (contractorId: number, isFavorite: boolean) => {
    if (!user?.userId) return;

    try {
      if (isFavorite) {
        // Buscar el ID del favorito para removerlo
        const favorite = favorites.find((fav) => fav.contractorId === contractorId);
        if (favorite) {
          await removeFromFavorites(favorite.id, contractorId);
        }
      } else {
        // Agregar a favoritos
        await addToFavorites({
          clientId: user.userId,
          contractorId,
        });
      }
    } catch (err) {
      console.error("Error al toggle favorito:", err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {favorites.reduce((sum, fav) => sum + fav.totalServicesCompleted, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Servicios Completados</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {hasFavorites
                  ? (
                      favorites.reduce((sum, fav) => sum + (fav.averageRating || 0), 0) /
                      favorites.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <div className="text-sm text-muted-foreground">Calificación Promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contratistas Favoritos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Cargando...</span>
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : mostRequested.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no tienes contratistas favoritos. Solicita servicios para ver sugerencias.
            </p>
          ) : (
            <div className="space-y-3">
              {mostRequested.map((contractor) => (
                <div
                  key={contractor.contractorId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={contractor.contractorAvatarUrl || undefined} />
                    <AvatarFallback>
                      {contractor.contractorName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{contractor.contractorName}</div>
                    <div className="text-xs text-muted-foreground">
                      {contractor.totalRequests} servicio{contractor.totalRequests !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{(contractor.averageRating || 0).toFixed(1)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleToggleFavorite(contractor.contractorId, contractor.isFavorite)
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          contractor.isFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </Button>
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
