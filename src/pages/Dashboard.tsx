import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Star, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
  Filter,
  Download,
  Calendar,
  Target,
  Lightbulb,
  Bot,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await signOut();
    
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  // Mock data - será substituído por dados reais
  const metricsData: MetricCard[] = [
    {
      title: "Total de Atendimentos",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      title: "Taxa de Conversão",
      value: "24.5%",
      change: "+3.2%",
      trend: "up",
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: "Tempo Médio de Resposta",
      value: "2m 34s",
      change: "-15s",
      trend: "up",
      icon: <Clock className="h-4 w-4" />
    },
    {
      title: "Nota Média de Qualidade",
      value: "4.2/5",
      change: "+0.3",
      trend: "up",
      icon: <Star className="h-4 w-4" />
    }
  ];

  const intentionsData = [
    { name: "Compra", percentage: 45, color: "bg-primary" },
    { name: "Dúvida Geral", percentage: 25, color: "bg-secondary" },
    { name: "Reclamação", percentage: 15, color: "bg-destructive" },
    { name: "Suporte", percentage: 10, color: "bg-accent" },
    { name: "Orçamento", percentage: 5, color: "bg-muted" }
  ];

  const tasksData = [
    { id: 1, title: "Revisar script de boas-vindas", status: "pendente", priority: "alta", deadline: "2024-01-20" },
    { id: 2, title: "Implementar FAQ automatizado", status: "em_andamento", priority: "media", deadline: "2024-01-25" },
    { id: 3, title: "Treinamento equipe - objeções", status: "concluida", priority: "alta", deadline: "2024-01-15" }
  ];

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">MetricaWhats</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Olá, {user.email}
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                disabled={loading}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Métricas Principais */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Analítico</h1>
              <p className="text-muted-foreground">Análise completa dos atendimentos do WhatsApp</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricsData.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  {metric.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className={`text-xs flex items-center gap-1 ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {metric.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {metric.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                    {metric.change} vs mês anterior
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Intenções dos Clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Principais Intenções dos Clientes
              </CardTitle>
              <CardDescription>
                Distribuição das intenções identificadas nos atendimentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {intentionsData.map((intention, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{intention.name}</span>
                    <span className="text-sm text-muted-foreground">{intention.percentage}%</span>
                  </div>
                  <Progress value={intention.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* O que funcionou / O que atrapalhou */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Insights de Performance
              </CardTitle>
              <CardDescription>
                Pontos fortes e áreas de melhoria identificados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="funcionou" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="funcionou" className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    O que funcionou
                  </TabsTrigger>
                  <TabsTrigger value="atrapalhou" className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4" />
                    O que atrapalhou
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="funcionou" className="space-y-3 mt-4">
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="font-medium text-green-800 dark:text-green-200">Resposta rápida (&lt; 1min)</div>
                    <div className="text-sm text-green-600 dark:text-green-300">87% dos clientes responderam positivamente</div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="font-medium text-green-800 dark:text-green-200">Ofertas personalizadas</div>
                    <div className="text-sm text-green-600 dark:text-green-300">Aumentaram conversão em 34%</div>
                  </div>
                </TabsContent>
                <TabsContent value="atrapalhou" className="space-y-3 mt-4">
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="font-medium text-red-800 dark:text-red-200">Falta de clareza no pagamento</div>
                    <div className="text-sm text-red-600 dark:text-red-300">23% abandonaram nesta etapa</div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="font-medium text-red-800 dark:text-red-200">Respostas genéricas</div>
                    <div className="text-sm text-red-600 dark:text-red-300">Baixa satisfação (2.1/5)</div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Melhor e Pior Atendimento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Destaque do Período
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800 dark:text-green-200">Melhor Atendimento</span>
                  <Badge variant="default">5.0★</Badge>
                </div>
                <div className="text-sm text-green-600 dark:text-green-300 mb-2">
                  Cliente: +55 11 9xxxx-8765
                </div>
                <div className="text-xs text-green-600 dark:text-green-300">
                  Resposta em 30s, proposta personalizada, fechamento em 3 mensagens
                </div>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-800 dark:text-red-200">Atendimento Crítico</span>
                  <Badge variant="destructive">1.5★</Badge>
                </div>
                <div className="text-sm text-red-600 dark:text-red-300 mb-2">
                  Cliente: +55 11 9xxxx-1234
                </div>
                <div className="text-xs text-red-600 dark:text-red-300">
                  Demora de 12min, informações confusas, cliente abandonou
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Oportunidades de Automação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Automação Sugerida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">FAQ Automatizado</div>
                <div className="text-xs text-muted-foreground">67% das dúvidas são sobre horário de funcionamento</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Reengajamento</div>
                <div className="text-xs text-muted-foreground">Clientes que enviam apenas "Oi" e param</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Follow-up</div>
                <div className="text-xs text-muted-foreground">Lembrete para leads inativos há 3+ dias</div>
              </div>
            </CardContent>
          </Card>

          {/* Próximas Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Próximas Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksData.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={
                          task.status === 'concluida' ? 'default' : 
                          task.status === 'em_andamento' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {task.status === 'concluida' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {task.status === 'em_andamento' && <Clock className="h-3 w-3 mr-1" />}
                        {task.status === 'pendente' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {task.status === 'concluida' ? 'Feito' : 
                         task.status === 'em_andamento' ? 'Em andamento' : 'Pendente'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.deadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Metas de Curto e Médio Prazo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas e Progresso
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso das suas metas de performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Taxa de Conversão</span>
                  <span className="text-sm text-muted-foreground">24.5% / 30%</span>
                </div>
                <Progress value={81.6} className="h-2" />
                <div className="text-xs text-muted-foreground">Meta: 30% até março</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tempo de Resposta</span>
                  <span className="text-sm text-muted-foreground">2m 34s / 2m</span>
                </div>
                <Progress value={78} className="h-2" />
                <div className="text-xs text-muted-foreground">Meta: &lt; 2min até fevereiro</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Nota de Qualidade</span>
                  <span className="text-sm text-muted-foreground">4.2 / 4.5</span>
                </div>
                <Progress value={93.3} className="h-2" />
                <div className="text-xs text-muted-foreground">Meta: 4.5/5 até abril</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer com informações da análise */}
        <div className="text-center text-sm text-muted-foreground border-t pt-6">
          <div className="flex items-center justify-center gap-4">
            <span>Última análise: {new Date().toLocaleDateString('pt-BR')}</span>
            <span>•</span>
            <span>Assinatura: MetricaWhats Analytics Engine v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}