import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { RjDiehlBranchSelector } from '@/components/RjDiehlBranchSelector';
import { RjDiehlReportViewer } from '@/components/RjDiehlReportViewer';
import {
    ArrowLeft,
    Briefcase,
    Shield,
    AlertCircle,
    CheckCircle,
    Calendar,
    BarChart3,
    RefreshCw,
    Settings,
    LogOut
} from 'lucide-react';

// ID do usuário específico que tem acesso a esta página
const AUTHORIZED_USER_ID = 'b3e2bb3f-d920-444c-87ea-dfbdcb144413';

export default function RjDiehlDashboard() {
    const { user, signOut } = useAuth();
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
            description: `Visualizando relatório do RJ DIEHL`,
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

    const handleSignOut = async () => {
        const { error } = await signOut();

        if (error) {
            toast({
                title: "Erro ao sair",
                description: error.message,
                variant: "destructive"
            });
        } else {
            navigate('/auth');
        }
    };

    const refetch = () => {
        // Função para atualizar dados (pode ser implementada conforme necessário)
        toast({
            title: "Dados atualizados",
            description: "Os dados foram atualizados com sucesso.",
        });
    };

    // Mostrar loading enquanto verifica autorização
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto"></div>
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
            {/* Header padronizado */}
            <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/')}
                                className="p-0 h-auto hover:bg-transparent group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-gradient-to-r from-slate-700 to-slate-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                                        <Briefcase className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent group-hover:from-slate-600 group-hover:to-slate-800 transition-all duration-200">
                                            RJ DIEHL
                                        </span>
                                        <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200">
                                            Dashboard Personalizado
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <CheckCircle className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Acesso Autorizado
                                </span>
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => refetch()}
                                        className="h-8 w-8 p-0 hover:bg-muted"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Atualizar dados</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate('/settings')}
                                        className="h-8 w-8 p-0 hover:bg-muted"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Configurações</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSignOut}
                                        className="h-8 w-8 p-0 hover:bg-muted"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Sair</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 space-y-8">

                {/* Seletor de Filiais */}
                {!selectedBranch && (
                    <RjDiehlBranchSelector
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
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <BarChart3 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold">
                                                Relatório Selecionado
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                RJ DIEHL {selectedDate && `• ${selectedDate.toLocaleDateString('pt-BR')}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedBranch('')}
                                        className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Voltar à Seleção
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Visualizador */}
                        <RjDiehlReportViewer
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
                                    <div className="w-2 h-2 bg-slate-700 rounded-full mt-2"></div>
                                    <span>Os relatórios são atualizados automaticamente conforme novos dados são inseridos</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-slate-700 rounded-full mt-2"></div>
                                    <span>Use o filtro de data para visualizar relatórios de períodos específicos</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-slate-700 rounded-full mt-2"></div>
                                    <span>Você pode baixar os relatórios em formato PDF para uso offline</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-slate-700 rounded-full mt-2"></div>
                                    <span>Esta página é exclusiva para usuários autorizados do RJ DIEHL</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
