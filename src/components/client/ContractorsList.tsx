import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContractorsWithRating } from "@/hooks/useContractorsWithRating";
import { useServices } from "@/hooks/useServices";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Mail, Phone, Briefcase, Calendar } from "lucide-react";
import { StarRating } from "./StarRating";

export const ContractorsList = () => {
  const [selectedService, setSelectedService] = useState<number>(0);
  const { contractors, loading, error, hasContractors } =
    useContractorsWithRating(selectedService);
  const { services, loading: servicesLoading, error: servicesError } =
    useServices();

  return (
    <div className="space-y-4">
      {/* 🔹 Filtro por tipo de servicio */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <label className="font-medium text-sm">Filtrar por servicio:</label>
        <select
          className="border rounded-lg px-3 py-2 w-full sm:w-64"
          value={selectedService}
          onChange={(e) => setSelectedService(Number(e.target.value))}
          disabled={servicesLoading}
        >
          <option value={0}>
            {servicesLoading ? "Cargando servicios..." : "Selecciona un servicio..."}
          </option>
          <option value={-1}>Todos los servicios</option>
          {services.map((service) => (
            <option key={service.serviceId} value={service.serviceId}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* ⚠️ Error al cargar servicios */}
      {servicesError && (
        <p className="text-red-500 text-sm">{servicesError}</p>
      )}

      {/* 🔄 Estados de carga */}
      {loading && (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando contratistas...</span>
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {/* ⚠️ No hay contratistas */}
      {!loading && !error && !hasContractors && selectedService !== 0 && (
        <p className="text-gray-500">No hay contratistas disponibles para este servicio.</p>
      )}

      {/* ✅ Lista de contratistas */}
      {hasContractors && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contractors.map((c) => (
            <Card
              key={c.contractorId}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={c.avatarUrl || undefined} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {c.fullName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1">{c.fullName}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </p>
                    {c.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 flex-shrink-0" /> {c.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Calificación */}
                <div className="mb-3">
                  <StarRating
                    rating={c.averageRating}
                    totalRatings={c.totalRatings}
                    size="small"
                    showLabel
                  />
                </div>

                {/* Estadísticas */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {c.completedServicesOfThisType} {c.completedServicesOfThisType === 1 ? 'servicio' : 'servicios'}
                  </span>
                  {c.lastServiceDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Último: {new Date(c.lastServiceDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Badge de contratista */}
                <Badge className="bg-blue-100 text-blue-700 w-full justify-center">
                  {c.serviceName}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 🔸 Sin servicio seleccionado */}
      {selectedService === 0 && !loading && (
        <p className="text-gray-500 italic">
          Selecciona un servicio para mostrar contratistas disponibles.
        </p>
      )}
    </div>
  );
};
