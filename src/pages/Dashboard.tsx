import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDashboardData } from '@/hooks/useDashboardData';
import { ExportModal } from '@/components/ExportModal';
import { FilterModal } from '@/components/FilterModal';
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
  
  // Buscar dados do dashboard
  const { 
    data: dashboardData, 
    isLoading: isLoadingData, 
    error: dataError,
    refetch 
  } = useDashboardData();

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

  // Dados reais do dashboard
  const metricsData: MetricCard[] = [
    {
      title: "Total de Atendimentos",
      value: dashboardData?.total_atendimentos?.toLocaleString() || "0",
      change: "+12%", // TODO: Calcular mudança real
      trend: "up",
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      title: "Taxa de Conversão",
      value: `${dashboardData?.taxa_conversao?.toFixed(1) || 0}%`,
      change: "+3.2%", // TODO: Calcular mudança real
      trend: "up",
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: "Tempo Médio de Resposta",
      value: dashboardData?.tempo_medio_resposta 
        ? `${Math.floor(dashboardData.tempo_medio_resposta / 60)}m ${dashboardData.tempo_medio_resposta % 60}s`
        : "0s",
      change: "-15s", // TODO: Calcular mudança real
      trend: "up",
      icon: <Clock className="h-4 w-4" />
    },
    {
      title: "Nota Média de Qualidade",
      value: `${dashboardData?.nota_media_qualidade?.toFixed(1) || 0}/5`,
      change: "+0.3", // TODO: Calcular mudança real
      trend: "up",
      icon: <Star className="h-4 w-4" />
    }
  ];

  const intentionsData = [
    { name: "Compra", percentage: dashboardData?.intencao_compra || 0, color: "bg-primary" },
    { name: "Dúvida Geral", percentage: dashboardData?.intencao_duvida_geral || 0, color: "bg-secondary" },
    { name: "Reclamação", percentage: dashboardData?.intencao_reclamacao || 0, color: "bg-destructive" },
    { name: "Suporte", percentage: dashboardData?.intencao_suporte || 0, color: "bg-accent" },
    { name: "Orçamento", percentage: dashboardData?.intencao_orcamento || 0, color: "bg-muted" }
  ];

  // Processar próximas ações do dashboard
  const tasksData = dashboardData?.proximas_acoes?.map((acao, index) => {
    const match = acao.match(/^(.*?)\s*–\s*(.*?)\s*\((\d{4}-\d{2}-\d{2})\)$/);
    if (match) {
      const [, title, status, deadline] = match;
      return {
        id: index + 1,
        title,
        status: status === 'Feito' ? 'concluida' : status === 'Em andamento' ? 'em_andamento' : 'pendente',
        priority: 'media',
        deadline
      };
    }
    return {
      id: index + 1,
      title: acao,
      status: 'pendente' as const,
      priority: 'media' as const,
      deadline: new Date().toISOString().split('T')[0]
    };
  }) || [];

  if (!user) {
    return <div>Carregando...</div>;
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header skeleton */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Title skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
            </div>
          </div>

          {/* Metrics skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados do dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar dados do dashboard</p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      </div>
    );
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
              <FilterModal 
                onFilterChange={(dateRange) => {
                  // TODO: Implementar filtro de dados por período
                  console.log('Filtrar por período:', dateRange);
                }}
                trigger={
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                }
              />
              <ExportModal 
                data={dashboardData} 
                trigger={
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                }
              />
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
                  {dashboardData?.insights_funcionou?.map((insight, index) => {
                    const [title, description] = insight.split(': ');
                    return (
                      <div key={index} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="font-medium text-green-800 dark:text-green-200">{title}</div>
                        <div className="text-sm text-green-600 dark:text-green-300">{description}</div>
                      </div>
                    );
                  }) || (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Nenhum insight positivo registrado ainda.</div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="atrapalhou" className="space-y-3 mt-4">
                  {dashboardData?.insights_atrapalhou?.map((insight, index) => {
                    const [title, description] = insight.split(': ');
                    return (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="font-medium text-red-800 dark:text-red-200">{title}</div>
                        <div className="text-sm text-red-600 dark:text-red-300">{description}</div>
                      </div>
                    );
                  }) || (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Nenhum problema identificado ainda.</div>
                    </div>
                  )}
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
              {dashboardData?.melhor_atendimento_cliente && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-800 dark:text-green-200">Melhor Atendimento</span>
                    <Badge variant="default">{dashboardData.melhor_atendimento_nota?.toFixed(1) || '5.0'}★</Badge>
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-300 mb-2">
                    Cliente: {dashboardData.melhor_atendimento_cliente}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-300">
                    {dashboardData.melhor_atendimento_observacao}
                  </div>
                </div>
              )}

              {dashboardData?.atendimento_critico_cliente && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-red-800 dark:text-red-200">Atendimento Crítico</span>
                    <Badge variant="destructive">{dashboardData.atendimento_critico_nota?.toFixed(1) || '1.5'}★</Badge>
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-300 mb-2">
                    Cliente: {dashboardData.atendimento_critico_cliente}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-300">
                    {dashboardData.atendimento_critico_observacao}
                  </div>
                </div>
              )}

              {!dashboardData?.melhor_atendimento_cliente && !dashboardData?.atendimento_critico_cliente && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Nenhum destaque registrado ainda.</div>
                </div>
              )}
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
              {dashboardData?.automacao_sugerida?.map((automacao, index) => {
                const [title, description] = automacao.split(': ');
                return (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">{title}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                );
              }) || (
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">Nenhuma automação sugerida</div>
                  <div className="text-xs text-muted-foreground">As sugestões aparecerão conforme os dados forem analisados</div>
                </div>
              )}
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
                  <span className="text-sm text-muted-foreground">
                    {dashboardData?.taxa_conversao?.toFixed(1) || 0}% / 30%
                  </span>
                </div>
                <Progress value={((dashboardData?.taxa_conversao || 0) / 30) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">Meta: 30% até março</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tempo de Resposta</span>
                  <span className="text-sm text-muted-foreground">
                    {dashboardData?.tempo_medio_resposta 
                      ? `${Math.floor(dashboardData.tempo_medio_resposta / 60)}m ${dashboardData.tempo_medio_resposta % 60}s`
                      : '0s'} / 2m
                  </span>
                </div>
                <Progress value={Math.max(0, 100 - ((dashboardData?.tempo_medio_resposta || 0) / 120) * 100)} className="h-2" />
                <div className="text-xs text-muted-foreground">Meta: &lt; 2min até fevereiro</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Nota de Qualidade</span>
                  <span className="text-sm text-muted-foreground">
                    {dashboardData?.nota_media_qualidade?.toFixed(1) || 0} / 4.5
                  </span>
                </div>
                <Progress value={((dashboardData?.nota_media_qualidade || 0) / 4.5) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">Meta: 4.5/5 até abril</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer com informações da análise */}
        <div className="text-center text-sm text-muted-foreground border-t pt-6">
          <div className="flex items-center justify-center gap-4">
            <span>Última análise: {dashboardData?.updated_at ? new Date(dashboardData.updated_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</span>
            <span>•</span>
            <span>Período: {dashboardData?.periodo_inicio ? new Date(dashboardData.periodo_inicio).toLocaleDateString('pt-BR') : '-'} a {dashboardData?.periodo_fim ? new Date(dashboardData.periodo_fim).toLocaleDateString('pt-BR') : '-'}</span>
            <span>•</span>
            <span>Assinatura: MetricaWhats Analytics Engine v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}