// src/components/ContractorsList.tsx
import { useEffect, useState } from "react";
import { listContractorApplications } from "@/services/ContractorService";
import type { ContractorApplication } from "@/types/contractor";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ContractorsList = () => {
  const [contractors, setContractors] = useState<ContractorApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await listContractorApplications();
        if (!cancelled) setContractors(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Error al cargar contratistas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Cargando contratistas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!contractors.length) return <p>No hay contratistas registrados.</p>;

  return (
    <div className="space-y-4">
      {contractors.map((c) => (
        <Card key={c.contractorApplicationId}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{c.fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {c.availability} • {c.experienceYears} años de experiencia
                {c.preferredLocation ? ` • ${c.preferredLocation}` : ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {c.description.length > 80
                  ? c.description.substring(0, 80) + "..."
                  : c.description}
              </p>
            </div>

            <Badge
              className={
                c.status === "Accepted"
                  ? "bg-green-100 text-green-700"
                  : c.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : c.status === "Rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }
            >
              {c.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
