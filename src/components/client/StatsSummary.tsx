import { Card, CardContent } from "@/components/ui/card";

export const StatsSummary = () => (
  <Card>
    <CardContent className="p-4 grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">12</div>
        <p className="text-sm text-muted-foreground">Servicios Completados</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">4.9</div>
        <p className="text-sm text-muted-foreground">Calificación Promedio</p>
      </div>
    </CardContent>
  </Card>
);
