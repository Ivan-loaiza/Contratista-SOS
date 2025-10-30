import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useContractors } from "@/hooks/useContractors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MapPin, Mail, Phone } from "lucide-react";

export const ContractorsList = () => {
  const [selectedService, setSelectedService] = useState<number>(0);
  const { contractors, loading, error, hasContractors } =
    useContractors(selectedService);

  return (
    <div className="space-y-4">
      {/* 🔹 Filtro por tipo de servicio */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <label className="font-medium text-sm">Filtrar por servicio:</label>
        <select
          className="border rounded-lg px-3 py-2 w-full sm:w-64"
          value={selectedService}
          onChange={(e) => setSelectedService(Number(e.target.value))}
        >
          <option value={0}>Selecciona un servicio...</option>
          <option value={1}>Fontanería</option>
          <option value={2}>Electricidad</option>
          <option value={3}>Pintura</option>
          <option value={4}>Construcción</option>
          <option value={5}>Reparaciones</option>
        </select>
      </div>

      {/* 🔄 Estados de carga */}
      {loading && (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando contratistas...</span>
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {/* ⚠️ No hay contratistas */}
      {!loading && !error && !hasContractors && selectedService > 0 && (
        <p className="text-gray-500">No hay contratistas disponibles para este servicio.</p>
      )}

      {/* ✅ Lista de contratistas */}
      {hasContractors && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contractors.map((c) => (
            <Card
              key={c.userId}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={c.avatarUrl || undefined} />
                  <AvatarFallback>
                    {c.fullName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{c.fullName}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {c.email}
                  </p>
                  {c.phone && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </p>
                  )}
                </div>

                <Badge className="bg-blue-100 text-blue-700">
                  Contratista
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 🔸 Sin servicio seleccionado */}
      {!selectedService && !loading && (
        <p className="text-gray-500 italic">
          Selecciona un servicio para mostrar contratistas disponibles.
        </p>
      )}
    </div>
  );
};
