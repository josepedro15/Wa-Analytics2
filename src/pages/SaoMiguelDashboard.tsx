import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SaoMiguelBranchSelector } from '@/components/SaoMiguelBranchSelector';
import { SaoMiguelReportViewer } from '@/components/SaoMiguelReportViewer';
import { 
  ArrowLeft, 
  Building2, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react';

// ID do usuário específico que tem acesso a esta página
const AUTHORIZED_USER_ID = '1c93324c-65d3-456e-992e-c84e1f7d6ab1';

export default function SaoMiguelDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Verificar autorização do usuário
  useEffect(() => {
    if (user) {
      const authorized = user.id === AUTHORIZED_USER_ID;
      setIsAuthorized(authorized);
      setIsCheckingAuth(false);
      
      if (!authorized) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
    }
  }, [user, navigate, toast]);

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    toast({
      title: "Filial Selecionada",
      description: `Visualizando relatório de ${branchId}`,
    });
  };

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      toast({
        title: "Filtro Aplicado",
        description: `Filtrando relatórios de ${date.toLocaleDateString('pt-BR')}`,
      });
    } else {
      toast({
        title: "Filtro Removido",
        description: "Exibindo todos os relatórios disponíveis",
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Mostrar loading enquanto verifica autorização
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não autorizado, não renderizar nada (já redirecionou)
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleBackToDashboard}
                className="text-foreground hover:bg-muted transition-all duration-300 rounded-xl px-4 py-2"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="font-medium text-sm">Voltar ao Dashboard</span>
              </Button>
            </div>
            
            <div className="text-center flex-1 max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg mb-3">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-foreground">
                Dashboard São Miguel
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Relatórios personalizados das filiais São Miguel
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Acesso Autorizado
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Aviso de Acesso Especial */}
        <Card className="border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Acesso Especial Concedido
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Você tem acesso exclusivo aos relatórios das filiais São Miguel. 
                  Selecione uma filial abaixo para visualizar os relatórios específicos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seletor de Filiais */}
        {!selectedBranch && (
          <SaoMiguelBranchSelector
            selectedBranch={selectedBranch}
            onBranchSelect={handleBranchSelect}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        )}

        {/* Visualizador de Relatório */}
        {selectedBranch && (
          <div className="space-y-6">
            {/* Header do Relatório Selecionado */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">
                        Relatório Selecionado
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedBranch} {selectedDate && `• ${selectedDate.toLocaleDateString('pt-BR')}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedBranch('')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à Seleção
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Visualizador */}
            <SaoMiguelReportViewer
              selectedBranch={selectedBranch}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {/* Informações Adicionais */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Informações Importantes:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Os relatórios são atualizados automaticamente conforme novos dados são inseridos</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Use o filtro de data para visualizar relatórios de períodos específicos</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Você pode baixar os relatórios em formato HTML para uso offline</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Esta página é exclusiva para usuários autorizados</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
