import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Wrench, Users, Phone, Facebook, Chrome } from 'lucide-react';
import type { Screen, UserRole } from '@/App';
import  ImageWithFallback  from './figma/ImageWithFallback';

interface WelcomeScreenProps {
  onNavigate: (screen: Screen, role?: UserRole) => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {

  type AuthTab = 'login' | 'register';

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [userType, setUserType] = useState<UserRole>('client');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === 'client') {
      onNavigate('client-dashboard', 'client');
    } else {
      onNavigate('contractor-dashboard', 'contractor');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === 'client') {
      onNavigate('client-dashboard', 'client');
    } else {
      onNavigate('contractor-dashboard', 'contractor');
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                🚀 Plataforma de servicios
              </Badge>
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

      {/* Login/Register Section */}
      <section className="flex-1 px-6 py-16 bg-white">
        <div className="max-w-md mx-auto">
        <Tabs
  value={activeTab}
  onValueChange={(value: string) => setActiveTab(value as AuthTab)}
>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            {/* User Type Selection */}
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
                      <Label htmlFor="email">Email o Teléfono</Label>
                      <Input id="email" type="text" placeholder="ejemplo@correo.com o +1234567890" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input id="password" type="password" placeholder="••••••••" required />
                    </div>
                    <Button 
                      type="submit" 
                      className={`w-full ${userType === 'client' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      Iniciar Sesión
                    </Button>
                  </form>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground">
                      o continúa con
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" size="sm" onClick={handleLogin}>
                      <Chrome className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogin}>
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogin}>
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                        <Input id="firstName" placeholder="Juan" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input id="lastName" placeholder="Pérez" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="ejemplo@correo.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" type="tel" placeholder="+1234567890" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input id="password" type="password" placeholder="••••••••" required />
                    </div>
                    {userType === 'contractor' && (
                      <div className="space-y-2">
                        <Label htmlFor="specialties">Especialidades</Label>
                        <Input id="specialties" placeholder="Fontanería, Electricidad, Pintura..." required />
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className={`w-full ${userType === 'client' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      Crear Cuenta
                    </Button>
                  </form>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground">
                      o regístrate con
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" size="sm" onClick={handleRegister}>
                      <Chrome className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRegister}>
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRegister}>
                      <Phone className="w-4 h-4" />
                    </Button>
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