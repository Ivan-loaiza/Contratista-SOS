//src /components/WelcomeScreen.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Wrench, Users, Phone, Facebook, Chrome } from 'lucide-react';
import ImageWithFallback from './figma/ImageWithFallback';

import { useAuth } from '@/context/AuthContext';
import { loginUser, registerUser, type UserRole } from '@/api/authApi';
import { createContractorApplication } from '@/api/contractorApplicationsApi';
import type { ContractorApplicationCreateDto } from '@/types/contractor';
import Swal from 'sweetalert2';

interface WelcomeScreenProps {
  initialTab?: 'login' | 'register';
}

export function WelcomeScreen({ initialTab = 'login' }: WelcomeScreenProps) {
  type AuthTab = 'login' | 'register';

  const navigate = useNavigate();

  // ✅ ahora leemos isAuthenticated y user para redirigir en un useEffect
  const { login, isAuthenticated, user } = useAuth();

  // pestaña y tipo de usuario
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [userType, setUserType] = useState<UserRole>('client');

  // ---- login ----
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // ---- registro (comunes) ----
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // ---- registro (contratista) ----
  const [specialties, setSpecialties] = useState('');
  const [serviceId] = useState<number>(1);
  const [experienceYears] = useState<number>(0);
  const [availability] = useState<string>('Tiempo completo');
  const [preferredLocation] = useState<string>('');

  const isContractorRole = (roles?: string[]) =>
    Array.isArray(roles) &&
    roles.some((r) => r?.toLowerCase?.() === 'contractor' || r?.toLowerCase?.() === 'contratista');

  const extractError = (err: any): string =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (typeof err?.response?.data === 'string' ? err.response.data : '') ||
    err?.message ||
    'Ocurrió un error.';

  // 🔁 Redirección segura cuando el contexto ya está listo
  useEffect(() => {
    if (!isAuthenticated) return;

    // Preferimos roles del contexto; si no existen, tomamos los que guardamos tras el login
    const ctxRoles = user?.roles ?? [];
    const cached = sessionStorage.getItem('lastRoles');
    const rolesFromCache: string[] = cached ? JSON.parse(cached) : [];
    const roles = ctxRoles.length ? ctxRoles : rolesFromCache;

    const isContr =
      user?.role === 'contractor' ||
      isContractorRole(roles);

    // Limpiamos el cache para no reintentar en futuros renders
    sessionStorage.removeItem('lastRoles');

    if (isContr) {
      navigate('/contractor', { replace: true });
    } else {
      navigate('/client', { replace: true });
    }
  }, [
    isAuthenticated,
    user?.role,
    (user?.roles ?? []).join(','), // si cambian, reevalúa
    navigate,
  ]);

  // ====================== LOGIN ======================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginLoading) return; // evita doble submit
    setLoginLoading(true);

    try {
      const payload = {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      };

      // Backend: POST /api/User/login -> { token, fullName, email, roles }
      const resp = await loginUser(payload);
      const token = (resp as any)?.token;
      const roles = (resp as any)?.roles ?? [];
      const email = (resp as any)?.email ?? '';
      const fullName = (resp as any)?.fullName ?? '';

      if (!token) throw new Error('La respuesta no contiene token.');

      // 💾 Guarda los roles por si acaso
      sessionStorage.setItem('lastRoles', JSON.stringify(roles));
      sessionStorage.setItem('lastEmail', email);
      sessionStorage.setItem('lastFullName', fullName);

      // ✅ Guarda la sesión pasando roles al contexto (mejora)
      login(token, { email, fullName, roles });

      // ❌ No navegamos aquí; dejamos que el useEffect de arriba lo haga
      await Swal.fire({
        title: '¡Bienvenido!',
        text: 'Inicio de sesión exitoso.',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#16a34a',
      });
    } catch (err) {
      console.error('[LOGIN ERROR]', err);
      Swal.fire({
        title: 'Error',
        text: extractError(err) || 'Error al iniciar sesión. Verifica tus credenciales.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
    } finally {
      setLoginLoading(false);
    }
  };

  // ====================== REGISTRO ======================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerLoading) return; // evita doble submit
    setRegisterLoading(true);

    try {
      if (userType === 'contractor') {
        const appDto: ContractorApplicationCreateDto = {
          fullName: `${firstName} ${lastName}`.trim(),
          email: regEmail.trim().toLowerCase(),
          phone: regPhone,
          serviceId,
          experienceYears,
          availability,
          preferredLocation: preferredLocation || undefined,
          description: specialties || 'N/A',
        };

        await createContractorApplication(appDto);

        await Swal.fire({
          title: '¡Gracias!',
          text: 'Tu solicitud de contratista fue enviada con éxito. Pronto te informaremos.',
          icon: 'success',
          confirmButtonText: 'Ir a iniciar sesión',
          confirmButtonColor: '#16a34a',
        });

        setActiveTab('login');
        setUserType('contractor');
      } else {
        // Cliente: registrar y luego autologin
        await registerUser({
          fullName: `${firstName} ${lastName}`.trim(),
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
        });

        const resp = await loginUser({
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
        });

        const token = (resp as any)?.token;
        const roles = (resp as any)?.roles ?? []; // por si tu backend ya devuelve
        if (!token) throw new Error('La respuesta no contiene token.');

        // ✅ guarda sesión (si no hay roles, el contexto asumirá 'client')
        login(token, { email: regEmail.trim().toLowerCase(), fullName: `${firstName} ${lastName}`.trim(), roles });

        await Swal.fire({
          title: '¡Cuenta creada!',
          text: 'Has iniciado sesión automáticamente.',
          icon: 'success',
          confirmButtonText: 'Ir al panel',
          confirmButtonColor: '#2563eb',
        });
        // La redirección la hará el useEffect (irá a /client por defecto si no hay roles)
      }
    } catch (err) {
      console.error('[REGISTER ERROR]', err);
      Swal.fire({
        title: 'Error',
        text: extractError(err) || 'Hubo un problema al registrarse. Intenta de nuevo.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">SOS Service-on demand</h1>
              <p className="text-sm text-muted-foreground">Conectando contratistas y clientes</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">🚀 Plataforma de servicios</Badge>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                Encuentra el contratista perfecto para tu proyecto
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Conectamos clientes con contratistas profesionales de forma rápida y segura.
                Como Uber, pero para servicios de construcción y mantenimiento.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Para Clientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-green-600" />
                  <span>Para Contratistas</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1642006953665-4046190641ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjB3b3JrZXIlMjB0b29sc3xlbnwxfHx8fDE3NTczMzM0Njl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Construction tools and workers"
                className="rounded-2xl shadow-2xl w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Login/Register */}
      <section className="flex-1 px-6 py-16 bg-white">
        <div className="max-w-md mx-auto">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AuthTab)}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            {/* Selector de tipo */}
            <div className="mb-6">
              <Label className="text-base mb-3 block">Tipo de Usuario</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={userType === 'client' ? 'default' : 'outline'}
                  className={`h-16 flex flex-col gap-1 ${userType === 'client' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setUserType('client')}
                >
                  <Users className="w-5 h-5" />
                  <span>Cliente</span>
                </Button>
                <Button
                  type="button"
                  variant={userType === 'contractor' ? 'default' : 'outline'}
                  className={`h-16 flex flex-col gap-1 ${userType === 'contractor' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => setUserType('contractor')}
                >
                  <Wrench className="w-5 h-5" />
                  <span>Contratista</span>
                </Button>
              </div>
            </div>

            {/* LOGIN */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Iniciar Sesión</CardTitle>
                  <CardDescription>
                    Ingresa a tu cuenta como {userType === 'client' ? 'cliente' : 'contratista'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loginLoading}
                      className={`w-full ${userType === 'client' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {loginLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </Button>
                  </form>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground">
                      o continúa con
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" size="sm"><Chrome className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm"><Facebook className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm"><Phone className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* REGISTER */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Crear Cuenta</CardTitle>
                  <CardDescription>
                    Regístrate como {userType === 'client' ? 'cliente' : 'contratista'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          placeholder="Juan"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          placeholder="Pérez"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Contraseña</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                      />
                    </div>

                    {userType === 'contractor' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="specialties">Especialidades</Label>
                          <Input
                            id="specialties"
                            placeholder="Fontanería, Electricidad, Pintura..."
                            value={specialties}
                            onChange={(e) => setSpecialties(e.target.value)}
                          />
                        </div>

                        {/* Si luego quieres mostrar controles para serviceId/experience/etc, agrégalos aquí */}
                      </>
                    )}

                    <Button
                      type="submit"
                      disabled={registerLoading}
                      className={`w-full ${userType === 'client' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {registerLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </Button>
                  </form>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground">
                      o regístrate con
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" size="sm"><Chrome className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm"><Facebook className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm"><Phone className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
