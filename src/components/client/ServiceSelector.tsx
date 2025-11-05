import { useServices } from "@/hooks/useServices";

interface ServiceSelectorProps {
  value: number;
  onChange: (serviceId: number) => void;
  disabled?: boolean;
}

export const ServiceSelector = ({ value, onChange, disabled }: ServiceSelectorProps) => {
  const { services, loading, error } = useServices();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tipo de Servicio</label>
      <select
        className="w-full p-3 border rounded-lg"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled || loading}
      >
        <option value={0}>
          {loading ? "Cargando servicios..." : "Seleccione un servicio..."}
        </option>
        {services.map((service) => (
          <option key={service.serviceId} value={service.serviceId}>
            {service.name}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};
