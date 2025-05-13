// src/app/dashboard/settings/page.tsx
'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, KeyRound, Layers } from 'lucide-react';

export default function SettingsPage() {
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Firebase config (read-only example from environment variables)
  const firebaseConfigDisplay = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '********' : 'No configurada',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'No configurado',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'No configurado',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'No configurado',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '********' : 'No configurado',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '********' : 'No configurado',
  };
  
  const handleSaveChanges = (service: string) => {
    // Placeholder for saving logic
    alert(`Guardar configuración para ${service} no implementado aún.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold tracking-tight animate-fadeInLeft">Configuración General</h2>
      <Tabs defaultValue="google-calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 sm:w-auto animate-fadeInUp">
          <TabsTrigger value="google-calendar">Google Calendar</TabsTrigger>
          <TabsTrigger value="gemini-api">Gemini API</TabsTrigger>
          <TabsTrigger value="firebase">Firebase</TabsTrigger>
        </TabsList>

        <TabsContent value="google-calendar" className="mt-4 animate-fadeInUp" data-delay="100">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" />Configuración de Google Calendar</CardTitle>
              <CardDescription>
                Integra tu Google Calendar para sincronizar eventos y plazos directamente con la agenda de la aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-api-key">Clave API de Google Calendar</Label>
                <Input
                  id="google-api-key"
                  type="password"
                  value={googleApiKey}
                  onChange={(e) => setGoogleApiKey(e.target.value)}
                  placeholder="Pega tu clave API aquí"
                />
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Instrucciones</AlertTitle>
                <AlertDescription>
                  Para obtener una clave API, visita la <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Google Cloud Console</a>,
                  crea un proyecto (o selecciona uno existente), habilita la API de Google Calendar y crea credenciales de clave API.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveChanges('Google Calendar')} className="transition-all duration-150 ease-in-out active:scale-95 hover:shadow-md">Guardar Configuración</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="gemini-api" className="mt-4 animate-fadeInUp" data-delay="200">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" />Configuración de Gemini API</CardTitle>
              <CardDescription>
                Configura tu clave API de Gemini para habilitar funciones de IA como el resumen de documentos legales.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gemini-api-key">Clave API de Gemini</Label>
                <Input
                  id="gemini-api-key"
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Pega tu clave API de Gemini aquí"
                />
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Nota sobre Genkit</AlertTitle>
                <AlertDescription>
                  La funcionalidad de resumen de documentos en esta aplicación utiliza Genkit, que típicamente se configura
                  con la variable de entorno <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">GOOGLE_API_KEY</code>.
                  Esta configuración es para usos alternativos o directos de la API de Gemini.
                  Consulta la <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Google AI Studio</a> para obtener tu clave.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveChanges('Gemini API')} className="transition-all duration-150 ease-in-out active:scale-95 hover:shadow-md">Guardar Configuración</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="firebase" className="mt-4 animate-fadeInUp" data-delay="300">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" />Configuración de Firebase</CardTitle>
              <CardDescription>
                Información sobre la configuración actual de Firebase utilizada por la aplicación para base de datos y almacenamiento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>Configuración vía Variables de Entorno</AlertTitle>
                <AlertDescription>
                  La configuración de Firebase se gestiona principalmente a través de variables de entorno en tu archivo <code>.env.local</code> o <code>.env</code>.
                  Asegúrate de que las siguientes variables estén correctamente configuradas para el funcionamiento de la aplicación:
                </AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm p-4 border rounded-md bg-muted/50">
                <p><strong>NEXT_PUBLIC_FIREBASE_API_KEY:</strong> {firebaseConfigDisplay.apiKey}</p>
                <p><strong>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:</strong> {firebaseConfigDisplay.authDomain}</p>
                <p><strong>NEXT_PUBLIC_FIREBASE_PROJECT_ID:</strong> {firebaseConfigDisplay.projectId}</p>
                <p><strong>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:</strong> {firebaseConfigDisplay.storageBucket}</p>
                <p><strong>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:</strong> {firebaseConfigDisplay.messagingSenderId}</p>
                <p><strong>NEXT_PUBLIC_FIREBASE_APP_ID:</strong> {firebaseConfigDisplay.appId}</p>
              </div>
               <p className="text-xs text-muted-foreground">
                Esta sección es informativa. Los cambios en la configuración de Firebase deben realizarse en el entorno de desarrollo/despliegue.
              </p>
            </CardContent>
             <CardFooter>
                {/* Could add a "Test Connection" button in the future if desired */}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
