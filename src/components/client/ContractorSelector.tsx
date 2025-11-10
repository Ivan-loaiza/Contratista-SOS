import { useContractors } from "@/hooks/useContractors";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface ContractorSelectorProps {
  serviceId: number;
  selectedContractorId: number | null;
  onSelectContractor: (contractorId: number) => void;
}

export const ContractorSelector = ({
  serviceId,
  selectedContractorId,
  onSelectContractor,
}: ContractorSelectorProps) => {
  const { contractors, loading, error } = useContractors(serviceId);
  const isReadOnly = selectedContractorId === null && onSelectContractor.toString() === '(() => {})';

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-blue-600 mt-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Cargando contratistas disponibles...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>;
  }

  if (serviceId > 0 && contractors.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No hay contratistas disponibles para este servicio.
      </p>
    );
  }

  if (contractors.length === 0) {
    return null;
  }

  return (
    <div className={isReadOnly ? "" : "mt-3"}>
      {!isReadOnly && (
        <p className="text-sm font-medium text-gray-600 mb-2">
          Contratistas disponibles:
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {contractors.map((contractor) => (
          <Card
            key={contractor.userId}
            onClick={isReadOnly ? undefined : () => onSelectContractor(contractor.userId)}
            className={`${isReadOnly ? '' : 'cursor-pointer'} border-2 transition ${
              !isReadOnly && selectedContractorId === contractor.userId
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            } ${!isReadOnly ? 'hover:bg-gray-50' : ''}`}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={contractor.avatarUrl || undefined} />
                <AvatarFallback>
                  {contractor.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left">
                <h4 className="font-semibold text-sm">{contractor.fullName}</h4>
                <p className="text-xs text-gray-500">
                  {contractor.email || "Sin correo"}
                </p>
              </div>

              <Badge variant="secondary">Disponible</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
