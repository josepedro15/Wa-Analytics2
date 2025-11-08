import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { World } from '@/components/ui/globe';
import { WHATSAPP_CONTACT } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  MessageSquare,
  Settings,
  BarChart3,
  Mail,
  ExternalLink,
  Sparkles,
  Zap
} from 'lucide-react';

interface OnboardingViewProps {
  user: {
    id: string;
    email: string;
    created_at?: string;
  };
  whatsappConnected?: boolean;
}

export function OnboardingView({ user, whatsappConnected = false }: OnboardingViewProps) {
  const [globeData] = useState(() => {
    // Dados de exemplo para o Globe - conexões globais
    return [
      {
        order: 1,
        startLat: -14.2350,
        startLng: -51.9253,
        endLat: 40.7128,
        endLng: -74.0060,
        arcAlt: 0.3,
        color: "#22c55e"
      },
      {
        order: 2,
        startLat: -14.2350,
        startLng: -51.9253,
        endLat: 51.5074,
        endLng: -0.1278,
        arcAlt: 0.3,
        color: "#4ade80"
      },
      {
        order: 3,
        startLat: -14.2350,
        startLng: -51.9253,
        endLat: 35.6762,
        endLng: 139.6503,
        arcAlt: 0.3,
        color: "#86efac"
      },
    ];
  });

  const globeConfig = useMemo(() => ({
    pointSize: 2,
    globeColor: "#064e3b",
    showAtmosphere: true,
    atmosphereColor: "#a7f3d0",
    atmosphereAltitude: 0.1,
    emissive: "#065f46",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(34, 197, 94, 0.7)",
    ambientLight: "#86efac",
    directionalLeftLight: "#4ade80",
    directionalTopLight: "#22c55e",
    pointLight: "#16a34a",
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    initialPosition: { lat: -14.2350, lng: -51.9253 },
    autoRotate: true,
    autoRotateSpeed: 1,
  }), []);

  // Calcular progresso
  const steps = [
    { id: 'account', label: 'Conta criada', completed: true },
    { id: 'auth', label: 'Autenticação configurada', completed: true },
    { id: 'whatsapp', label: 'Conexão WhatsApp', completed: whatsappConnected },
    { id: 'dashboard', label: 'Dashboard personalizado', completed: false },
    { id: 'report', label: 'Primeiro relatório', completed: false },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const accountCreatedDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('pt-BR')
    : 'Data não disponível';

  return (
    <div className="space-y-8">
      {/* Hero Section com Globe */}
      <div className="relative">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Texto */}
              <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Em Configuração
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Bem-vindo ao MetricsIA
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Seu dashboard personalizado está sendo configurado pela nossa equipe. 
                    Em breve você terá acesso a relatórios completos e insights detalhados dos seus atendimentos.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Progresso da Implementação</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              </div>

              {/* Globe */}
              <div className="h-[400px] lg:h-full w-full relative">
                <World globeConfig={globeConfig} data={globeData} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status e Próximos Passos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status da Implementação */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Status da Implementação
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso da configuração do seu dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </div>
                  {!step.completed && step.id === 'whatsapp' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => window.open('https://webhook.metricsia.com.br/webhook/conexaochip', '_blank')}
                    >
                      <MessageSquare className="h-3 w-3 mr-2" />
                      Conectar Agora
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Próximos Passos */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Próximos Passos
            </CardTitle>
            <CardDescription>
              O que acontece agora?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <div className="font-medium">Conectar WhatsApp</div>
                  <div className="text-sm text-muted-foreground">
                    {whatsappConnected 
                      ? 'WhatsApp conectado com sucesso!'
                      : 'Conecte sua conta do WhatsApp para começar a coletar dados.'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <div className="font-medium">Configuração do Dashboard</div>
                  <div className="text-sm text-muted-foreground">
                    Nossa equipe está configurando seu dashboard personalizado. 
                    Geralmente leva 2-3 dias úteis.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <div className="font-medium">Primeiro Relatório</div>
                  <div className="text-sm text-muted-foreground">
                    Você receberá um email quando o primeiro relatório estiver disponível. 
                    Os relatórios são atualizados automaticamente.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Cliente e Suporte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações do Cliente */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{user.email}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Data de criação</div>
              <div className="font-medium">{accountCreatedDate}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Em configuração
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Suporte */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Precisa de Ajuda?
            </CardTitle>
            <CardDescription>
              Nossa equipe está pronta para ajudar você
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start bg-green-600 hover:bg-green-700"
              onClick={() => window.open(WHATSAPP_CONTACT.link, '_blank')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Falar no WhatsApp
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.open(`mailto:suporte@metricsia.com.br?subject=Dúvida sobre configuração&body=Olá, tenho uma dúvida sobre a configuração da minha conta.`, '_blank')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
            <div className="pt-2 text-xs text-muted-foreground text-center">
              Tempo médio de resposta: 2-4 horas
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

