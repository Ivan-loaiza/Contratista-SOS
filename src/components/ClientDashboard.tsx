// src/components/ClientDashboard.tsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import {
  Search,
  MapPin,
  Star,
  Clock,
  DollarSign,
  FileText,
  Phone,
  MessageCircle,
  LogOut,
  Wrench,
  Users,
  Navigation,
  CheckCircle,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { createServiceRequest, type CreateServiceRequestDto } from '@/services/ServiceRequestApi';

interface ClientDashboardProps {
  onLogout: () => void;
}

export default function ClientDashboard({ onLogout }: ClientDashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
  const [serviceRequest, setServiceRequest] = useState<'idle' | 'searching' | 'found' | 'in-progress'>('idle');
  const [searchProgress, setSearchProgress] = useState(0);

  // 🧭 campos controlados del formulario
  const [serviceId, setServiceId] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState<'Alta' | 'Media' | 'Baja'>('Alta');
  const [estimatedDuration, setEstimatedDuration] = useState('2 horas');
  const [budget, setBudget] = useState('$150');
  const [loading, setLoading] = useState(false);

  // redirección si no hay sesión
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  const handleRequestService = async () => {
    if (!user?.userId) {
      navigate('/login');
      return;
    }
    if (!description.trim() || !location.trim()) {
      alert('Por favor completa la descripción y la ubicación.');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateServiceRequestDto = {
        clientId: user.userId,
        serviceId,
        contractorId: null, // aún no asignado
        description: description.trim(),
        location: location.trim(),
        urgency,
        estimatedDuration,
        budget,
        requestDate: new Date().toISOString(),
        serviceDate: null,
        isActive: true,
      };

      await createServiceRequest(payload);

      // feedback visual como tenías antes
      setServiceRequest('searching');
      setSearchProgress(0);
      const interval = setInterval(() => {
        setSearchProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setServiceRequest('found');
            return 100;
          }
          return prev + 12;
        });
      }, 250);
    } catch (err) {
      console.error('Error creando la solicitud', err);
      alert('No pudimos crear la solicitud. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptContractor = () => {
    setServiceRequest('in-progress');
  };

  const mockContractors = [
    {
      id: 1,
      name: 'Carlos Rodríguez',
      specialties: ['Fontanería', 'Electricidad'],
      rating: 4.8,
      completedJobs: 245,
      distance: '2.3 km',
      hourlyRate: '$25-35',
      available: true,
      avatar: '/api/placeholder/40/40',
    },
    {
      id: 2,
      name: 'María González',
      specialties: ['Pintura', 'Reparaciones'],
      rating: 4.9,
      completedJobs: 189,
      distance: '1.8 km',
      hourlyRate: '$20-30',
      available: true,
      avatar: '/api/placeholder/40/40',
    },
    {
      id: 3,
      name: 'Luis Méndez',
      specialties: ['Construcción', 'Albañilería'],
      rating: 4.7,
      completedJobs: 312,
      distance: '3.1 km',
      hourlyRate: '$30-45',
      available: false,
      avatar: '/api/placeholder/40/40',
    },
  ];

  const mockDocuments = [
    {
      id: 1,
      type: 'Cotización',
      contractor: 'Carlos Rodríguez',
      amount: '$450',
      date: '2024-01-15',
      status: 'Pendiente',
    },
    {
      id: 2,
      type: 'Factura',
      contractor: 'María González',
      amount: '$280',
      date: '2024-01-10',
      status: 'Pagada',
    },
    {
      id: 3,
      type: 'Proforma',
      contractor: 'Luis Méndez',
      amount: '$650',
      date: '2024-01-08',
      status: 'Revisión',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Panel Cliente</h1>
              <p className="text-sm text-muted-foreground">SOS Service-on demand</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-fit mb-6">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Inicio
            </TabsTrigger>
            <TabsTrigger value="contractors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contratistas
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Home Tab - Service Request */}
          <TabsContent value="home">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-600" />
                    Solicitar Servicio
                  </CardTitle>
                  <CardDescription>
                    Describe tu proyecto y encuentra el contratista perfecto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {serviceRequest === 'idle' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo de Servicio</label>
                        <select
                          className="w-full p-3 border rounded-lg"
                          value={serviceId}
                          onChange={(e) => setServiceId(Number(e.target.value))}
                        >
                          <option value={1}>Fontanería</option>
                          <option value={2}>Electricidad</option>
                          <option value={3}>Pintura</option>
                          <option value={4}>Construcción</option>
                          <option value={5}>Reparaciones</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción del Proyecto</label>
                        <textarea
                          className="w-full p-3 border rounded-lg h-24 resize-none"
                          placeholder="Describe detalladamente lo que necesitas..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Urgencia</label>
                          <select
                            className="w-full p-3 border rounded-lg"
                            value={urgency}
                            onChange={(e) => setUrgency(e.target.value as 'Alta' | 'Media' | 'Baja')}
                          >
                            <option value="Alta">Alta</option>
                            <option value="Media">Media</option>
                            <option value="Baja">Baja</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Duración estimada</label>
                          <Input
                            placeholder="Ej: 2 horas"
                            value={estimatedDuration}
                            onChange={(e) => setEstimatedDuration(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Presupuesto</label>
                          <Input
                            placeholder="Ej: $150"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Ubicación</label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Dirección o código postal"
                              className="flex-1"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                            />
                            <Button type="button" variant="outline" size="icon">
                              <MapPin className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleRequestService}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? 'Enviando...' : (<><Search className="w-4 h-4 mr-2" /> Buscar Contratista</>)}
                      </Button>
                    </>
                  )}

                  {serviceRequest === 'searching' && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-blue-600 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Buscando contratistas...</h3>
                      <p className="text-muted-foreground mb-4">
                        Estamos encontrando los mejores profesionales para ti
                      </p>
                      <Progress value={searchProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground mt-2">{searchProgress}% completado</p>
                    </div>
                  )}

                  {serviceRequest === 'found' && (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">¡Contratista encontrado!</h3>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="/api/placeholder/40/40" />
                            <AvatarFallback>CR</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-left">
                            <h4 className="font-semibold">Carlos Rodríguez</h4>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              4.8 • Fontanería, Electricidad
                            </div>
                          </div>
                          <Badge variant="secondary">2.3 km</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setServiceRequest('idle')}>
                          Buscar Otro
                        </Button>
                        <Button onClick={handleAcceptContractor} className="flex-1 bg-blue-600 hover:bg-blue-700">
                          Aceptar
                        </Button>
                      </div>
                    </div>
                  )}

                  {serviceRequest === 'in-progress' && (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Navigation className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Contratista en camino</h3>
                      <p className="text-muted-foreground mb-4">
                        Carlos llegará en aproximadamente 15 minutos
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Tiempo estimado:</span>
                          <span className="text-sm">15 min</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Costo estimado:</span>
                          <span className="text-sm">$25-35/hora</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Phone className="w-4 h-4 mr-2" />
                          Llamar
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Mensaje
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de Actividad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-sm text-muted-foreground">Servicios Completados</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">4.9</div>
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
                    <div className="space-y-3">
                      {mockContractors.slice(0, 2).map((contractor) => (
                        <div key={contractor.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={contractor.avatar} />
                            <AvatarFallback>
                              {contractor.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{contractor.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {contractor.specialties.join(', ')}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{contractor.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Contractors Tab */}
          <TabsContent value="contractors">
            <Card>
              <CardHeader>
                <CardTitle>Contratistas Disponibles</CardTitle>
                <CardDescription>Explora y contacta contratistas cerca de ti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4 mb-6">
                    <Input placeholder="Buscar por especialidad o nombre..." className="flex-1" />
                    <select className="px-3 py-2 border rounded-lg">
                      <option>Todas las especialidades</option>
                      <option>Fontanería</option>
                      <option>Electricidad</option>
                      <option>Pintura</option>
                      <option>Construcción</option>
                    </select>
                  </div>

                  <div className="grid gap-4">
                    {mockContractors.map((contractor) => (
                      <Card key={contractor.id} className={contractor.available ? '' : 'opacity-60'}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={contractor.avatar} />
                              <AvatarFallback>
                                {contractor.name.split(' ').map((n) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{contractor.name}</h3>
                                {contractor.available ? (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    Disponible
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                    Ocupado
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {contractor.specialties.map((specialty) => (
                                  <Badge key={specialty} variant="outline">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  {contractor.rating} ({contractor.completedJobs} trabajos)
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {contractor.distance}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {contractor.hourlyRate}/hora
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" disabled={!contractor.available}>
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" disabled={!contractor.available}>
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" disabled={!contractor.available} className="bg-blue-600 hover:bg-blue-700">
                                Contratar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Cotizaciones, Proformas y Facturas</CardTitle>
                <CardDescription>Gestiona todos los documentos enviados por los contratistas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDocuments.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{doc.type}</h3>
                              <p className="text-sm text-muted-foreground">De: {doc.contractor}</p>
                              <p className="text-xs text-muted-foreground">{doc.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">{doc.amount}</div>
                            <Badge
                              variant={
                                doc.status === 'Pagada' ? 'default' : doc.status === 'Pendiente' ? 'secondary' : 'outline'
                              }
                              className={
                                doc.status === 'Pagada'
                                  ? 'bg-green-100 text-green-700'
                                  : doc.status === 'Pendiente'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {doc.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                            <Button variant="outline" size="sm">
                              Descargar
                            </Button>
                            {doc.status === 'Pendiente' && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                Pagar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Servicios</CardTitle>
                <CardDescription>Revisa todos los servicios que has solicitado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <Card key={item}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">Reparación de fontanería</h3>
                            <p className="text-sm text-muted-foreground mb-2">Completado por Carlos Rodríguez</p>
                            <p className="text-sm text-muted-foreground">Enero 15, 2024 • $280</p>
                            <div className="flex items-center gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                              <span className="text-sm text-muted-foreground ml-2">Excelente trabajo</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Completado
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
