import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePalestraLead } from '@/hooks/usePalestraLead';
import { 
  Sparkles, 
  FileText, 
  Lightbulb, 
  Briefcase, 
  ArrowRight, 
  CheckCircle,
  Loader2
} from 'lucide-react';

interface SavedLeadData {
  nome: string;
  email: string;
  telefone: string;
  leadId: string;
}

const gatilhos = [
  {
    id: 'relatorio',
    title: 'Quero ver um relatório de exemplo',
    description: 'Veja como funciona na prática com um relatório real de análise de conversas',
    icon: FileText,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    darkBgGradient: 'dark:from-blue-950/20 dark:to-indigo-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'entender',
    title: 'Quero entender melhor como funciona',
    description: 'Descubra todo o processo de análise e automação inteligente',
    icon: Lightbulb,
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50',
    darkBgGradient: 'dark:from-purple-950/20 dark:to-pink-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'negocio',
    title: 'Como isso pode se aplicar no meu negócio?',
    description: 'Entenda como adaptar a solução para sua realidade específica',
    icon: Briefcase,
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50',
    darkBgGradient: 'dark:from-green-950/20 dark:to-emerald-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconBg: 'bg-green-100 dark:bg-green-900/50',
    iconColor: 'text-green-600 dark:text-green-400'
  }
];

export default function PalestraGatilhos() {
  const navigate = useNavigate();
  const { updateLeadAndSendWebhook, isUpdating } = usePalestraLead();
  const [leadData, setLeadData] = useState<SavedLeadData | null>(null);
  const [selectedGatilho, setSelectedGatilho] = useState<string | null>(null);

  useEffect(() => {
    // Recuperar dados do sessionStorage
    const savedData = sessionStorage.getItem('palestraLeadData');
    
    if (!savedData) {
      // Se não tem dados, redirecionar para o início
      navigate('/palestra');
      return;
    }

    try {
      const parsedData = JSON.parse(savedData);
      setLeadData(parsedData);
    } catch (error) {
      console.error('Erro ao recuperar dados:', error);
      navigate('/palestra');
    }
  }, [navigate]);

  const handleGatilhoClick = (gatilhoId: string) => {
    if (!leadData) return;

    setSelectedGatilho(gatilhoId);

    const gatilho = gatilhos.find(g => g.id === gatilhoId);
    if (!gatilho) return;

    // Atualizar lead no banco e enviar webhook
    updateLeadAndSendWebhook(
      {
        leadId: leadData.leadId,
        gatilho: gatilho.title,
        leadData: {
          nome: leadData.nome,
          email: leadData.email,
          telefone: leadData.telefone
        }
      },
      {
        onSuccess: () => {
          // Limpar sessionStorage
          sessionStorage.removeItem('palestraLeadData');
          
          // Aguardar um pouco e redirecionar para página de obrigado
          setTimeout(() => {
            navigate('/palestra/obrigado');
          }, 1500);
        }
      }
    );
  };

  if (!leadData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MetricsIA
              </h1>
              <p className="text-sm text-muted-foreground">
                Estamos quase lá, {leadData.nome.split(' ')[0]}!
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-8">
          {/* Título */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Dados Cadastrados com Sucesso
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              O que você gostaria de
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                saber agora?
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha uma opção abaixo e entraremos em contato com informações personalizadas
            </p>
          </div>

          {/* Cards de Gatilhos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {gatilhos.map((gatilho) => {
              const Icon = gatilho.icon;
              const isSelected = selectedGatilho === gatilho.id;
              const isProcessing = isUpdating && isSelected;
              
              return (
                <Card
                  key={gatilho.id}
                  className={`
                    relative overflow-hidden cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? `border-2 ${gatilho.borderColor} shadow-2xl scale-105` 
                      : 'border border-border/50 hover:border-border shadow-lg hover:shadow-xl hover:scale-102'
                    }
                    ${isProcessing ? 'opacity-75 cursor-wait' : ''}
                  `}
                  onClick={() => !isUpdating && handleGatilhoClick(gatilho.id)}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gatilho.bgGradient} ${gatilho.darkBgGradient} opacity-50`}></div>
                  
                  <CardContent className="relative p-6 space-y-4 min-h-[280px] flex flex-col">
                    {/* Ícone */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${gatilho.iconBg} rounded-2xl shadow-lg`}>
                      <Icon className={`h-8 w-8 ${gatilho.iconColor}`} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-bold leading-tight">
                        {gatilho.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {gatilho.description}
                      </p>
                    </div>

                    {/* Botão */}
                    <Button
                      disabled={isUpdating}
                      className={`
                        w-full h-12 font-semibold transition-all duration-300
                        bg-gradient-to-r ${gatilho.gradient} hover:shadow-lg
                        ${isProcessing ? 'cursor-wait' : ''}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUpdating) handleGatilhoClick(gatilho.id);
                      }}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Processando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Escolher esta opção</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>

                    {/* Indicador de seleção */}
                    {isSelected && !isProcessing && (
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Informação adicional */}
          <div className="text-center mt-12">
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Garantia de Resposta Rápida
                  </p>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Entraremos em contato em até 24 horas com as informações personalizadas 
                  de acordo com sua escolha. Fique de olho no seu WhatsApp e email!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

