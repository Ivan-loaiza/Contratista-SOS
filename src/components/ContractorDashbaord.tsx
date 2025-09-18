import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
// import { Separator } from './ui/separator';
import { 
  Bell, 
  Star, 
  Clock, 
  DollarSign, 
  FileText, 
  Send, 
  Plus,
  LogOut,
  Wrench,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Calculator,
  Receipt,
  FileCheck
} from 'lucide-react';
import { getServiceRequests } from '../services/ContractorService';

interface ContractorDashboardProps {
  onLogout: () => void;
}

interface ServiceRequest {
  requestId: number;
  clientName: string;
  serviceName: string;
  description: string;
  location: string;
  urgency: string;
  estimatedDuration: string;
  budget: string;
  requestTime: string;
}

export function ContractorDashboard({ onLogout }: ContractorDashboardProps) {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [documentType, setDocumentType] = useState<'cotizacion' | 'factura' | 'proforma'>('cotizacion');
  const [serviceItems, setServiceItems] = useState([{ description: '', hours: '', rate: '' }]);

  useEffect(() => {
  const fetchRequests = async () => {
    try {
      const data = await getServiceRequests();
      console.log('📦 Datos recibidos:', data); // 👈 esto ayuda
      setRequests(data);
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
    }
  };

  fetchRequests();
}, []);

  const addServiceItem = () => {
    setServiceItems([...serviceItems, { description: '', hours: '', rate: '' }]);
  };

  const removeServiceItem = (index: number) => {
    setServiceItems(serviceItems.filter((_, i) => i !== index));
  };

  const updateServiceItem = (index: number, field: string, value: string) => {
    const updated = [...serviceItems];
    updated[index] = { ...updated[index], [field]: value };
    setServiceItems(updated);
  };

  const calculateTotal = () => {
    return serviceItems.reduce((total, item) => {
      const hours = parseFloat(item.hours) || 0;
      const rate = parseFloat(item.rate) || 0;
      return total + (hours * rate);
    }, 0);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Panel Contratista</h1>
              <p className="text-sm text-muted-foreground">SOS Service-on demand</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-fit mb-6">
            <TabsTrigger value="requests"><Bell className="w-4 h-4 mr-2" /> Solicitudes</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="w-4 h-4 mr-2" /> Documentos</TabsTrigger>
            <TabsTrigger value="dashboard"><Star className="w-4 h-4 mr-2" /> Mi Panel</TabsTrigger>
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" /> Perfil</TabsTrigger>
          </TabsList>

          {/* Tab: Solicitudes */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle><Bell className="w-5 h-5 text-green-600" /> Solicitudes Pendientes</CardTitle>
                <CardDescription>Revisa y responde a las solicitudes de servicio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.requestId} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="/api/placeholder/40/40" />
                              <AvatarFallback>
                                {request.clientName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{request.clientName}</h3>
                              <p className="text-sm text-muted-foreground">{request.requestTime}</p>
                            </div>
                          </div>
                          <Badge variant={request.urgency === 'Alta' ? 'destructive' : 'secondary'}>
                            Urgencia {request.urgency}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium mb-2">{request.serviceName}</h4>
                            <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{request.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{request.estimatedDuration}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span>{request.budget}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1">
                            <XCircle className="w-4 h-4 mr-2" />
                            Declinar
                          </Button>
                          <Button className="flex-1 bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aceptar Solicitud
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Documentos */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Crear Documento</CardTitle>
                <CardDescription>Genera cotizaciones, facturas o proformas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {['cotizacion', 'factura', 'proforma'].map((type) => (
                    <Button
                      key={type}
                      variant={documentType === type ? 'default' : 'outline'}
                      className={documentType === type ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => setDocumentType(type as any)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>

                <div>
                  <Label>Cliente</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>Seleccionar cliente...</option>
                    {requests.map((request) => (
                      <option key={request.requestId} value={request.requestId}>
                        {request.clientName}
                      </option>
                    ))}
                  </select>
                </div>

                <Label>Descripción del Proyecto</Label>
                <Textarea placeholder="Describe el trabajo..." />

                <div className="flex justify-between items-center">
                  <Label>Servicios</Label>
                  <Button onClick={addServiceItem} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Agregar
                  </Button>
                </div>

                {serviceItems.map((item, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-lg space-y-2">
                    <Input
                      placeholder="Descripción"
                      value={item.description}
                      onChange={(e) => updateServiceItem(index, 'description', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Horas"
                        value={item.hours}
                        onChange={(e) => updateServiceItem(index, 'hours', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Tarifa"
                        value={item.rate}
                        onChange={(e) => updateServiceItem(index, 'rate', e.target.value)}
                      />
                    </div>
                    <div className="text-right text-sm font-medium">
                      Subtotal: ${(parseFloat(item.hours) * parseFloat(item.rate)).toFixed(2)}
                    </div>
                    {serviceItems.length > 1 && (
                      <Button variant="ghost" onClick={() => removeServiceItem(index)}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="text-right text-lg font-bold text-green-700">
                  Total: ${calculateTotal().toFixed(2)}
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar {documentType.charAt(0).toUpperCase() + documentType.slice(1)}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Crear Documento
                  </CardTitle>
                  <CardDescription>
                    Genera cotizaciones, facturas y proformas para tus clientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Documento</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={documentType === 'cotizacion' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDocumentType('cotizacion')}
                        className={documentType === 'cotizacion' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        <Calculator className="w-4 h-4 mr-1" />
                        Cotización
                      </Button>
                      <Button
                        variant={documentType === 'factura' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDocumentType('factura')}
                        className={documentType === 'factura' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        <Receipt className="w-4 h-4 mr-1" />
                        Factura
                      </Button>
                      <Button
                        variant={documentType === 'proforma' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDocumentType('proforma')}
                        className={documentType === 'proforma' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        <FileCheck className="w-4 h-4 mr-1" />
                        Proforma
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <select id="client" className="w-full p-2 border rounded-lg">
                      <option>Seleccionar cliente...</option>
                      {requests.map((client: any) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">Descripción del Proyecto</Label>
                    <Textarea 
                      id="project"
                      placeholder="Describe el trabajo realizado o a realizar..."
                      className="h-20"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Servicios y Mano de Obra</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addServiceItem}>
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar Item
                      </Button>
                    </div>

                    {serviceItems.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium">Item {index + 1}</h5>
                          {serviceItems.length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeServiceItem(index)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Input
                            placeholder="Descripción del servicio"
                            value={item.description}
                            onChange={(e) => updateServiceItem(index, 'description', e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Horas"
                              type="number"
                              value={item.hours}
                              onChange={(e) => updateServiceItem(index, 'hours', e.target.value)}
                            />
                            <Input
                              placeholder="Tarifa/hora ($)"
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateServiceItem(index, 'rate', e.target.value)}
                            />
                          </div>
                          {item.hours && item.rate && (
                            <div className="text-right text-sm font-medium">
                              Subtotal: ${(parseFloat(item.hours) * parseFloat(item.rate)).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total:</span>
                        <span className="text-xl font-bold text-green-600">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Textarea 
                      id="notes"
                      placeholder="Términos y condiciones, garantías, etc."
                      className="h-16"
                    />
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar {documentType.charAt(0).toUpperCase() + documentType.slice(1)}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentos Enviados</CardTitle>
                  <CardDescription>
                    Historial de cotizaciones, facturas y proformas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: 'Cotización', client: 'Ana Martínez', amount: '$450', date: '2024-01-15', status: 'Pendiente' },
                      { type: 'Factura', client: 'Pedro López', amount: '$320', date: '2024-01-14', status: 'Pagada' },
                      { type: 'Proforma', client: 'María García', amount: '$680', date: '2024-01-13', status: 'Enviada' }
                    ].map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">{doc.type}</div>
                            <div className="text-sm text-muted-foreground">{doc.client}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{doc.amount}</div>
                          <Badge 
                            variant={doc.status === 'Pagada' ? 'default' : 'secondary'}
                            className={doc.status === 'Pagada' ? 'bg-green-100 text-green-700' : ''}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas del Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">18</div>
                      <div className="text-sm text-muted-foreground">Trabajos Completados</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">$2,450</div>
                      <div className="text-sm text-muted-foreground">Ingresos del Mes</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">4.8</div>
                      <div className="text-sm text-muted-foreground">Calificación Promedio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trabajos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Reparación fontanería</div>
                          <div className="text-xs text-muted-foreground">Ana Martínez</div>
                        </div>
                        <div className="text-sm font-medium">$280</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Citas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Instalación eléctrica</div>
                          <div className="text-xs text-muted-foreground">Mañana 10:00 AM</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil Profesional</CardTitle>
                <CardDescription>
                  Administra tu información y especialidades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" defaultValue="Carlos Rodríguez" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" defaultValue="+1234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="carlos@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Años de Experiencia</Label>
                    <Input id="experience" type="number" defaultValue="8" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Especialidades</Label>
                  <Input id="specialties" defaultValue="Fontanería, Electricidad, Reparaciones" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Descripción Profesional</Label>
                  <Textarea 
                    id="bio"
                    defaultValue="Especialista en fontanería y electricidad con más de 8 años de experiencia. Trabajo rápido y eficiente, garantía en todos mis servicios."
                    className="h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Tarifa por Hora ($)</Label>
                  <Input id="hourlyRate" type="number" defaultValue="25" />
                </div>

                <Button className="bg-green-600 hover:bg-green-700">
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}