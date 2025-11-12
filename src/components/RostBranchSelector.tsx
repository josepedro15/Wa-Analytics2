import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROST_BRANCH_OPTIONS } from '@/hooks/useRostData';
import { 
  Building2, 
  Calendar, 
  Users, 
  TrendingUp, 
  BarChart3,
  MapPin,
  Clock,
  Crown
} from 'lucide-react';

interface RostBranchSelectorProps {
  selectedBranch?: string;
  onBranchSelect: (branchId: string) => void;
  onDateSelect: (date: Date | null) => void;
  selectedDate?: Date | null;
}

const getBranchIcon = (branchId: string) => {
  switch (branchId) {
    case 'rost-planos':
      return <TrendingUp className="h-5 w-5" />;
    case 'rost-atendimento':
      return <Users className="h-5 w-5" />;
    default:
      return <Building2 className="h-5 w-5" />;
  }
};

const getBranchColor = (branchId: string) => {
  switch (branchId) {
    case 'rost-planos':
      return 'from-amber-600 to-yellow-700';
    case 'rost-atendimento':
      return 'from-yellow-600 to-amber-700';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const getBranchType = (branchId: string) => {
  if (branchId.includes('planos')) {
    return { type: 'Planos', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' };
  }
  return { type: 'Atendimento', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' };
};

export function RostBranchSelector({ 
  selectedBranch, 
  onBranchSelect, 
  onDateSelect, 
  selectedDate 
}: RostBranchSelectorProps) {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value ? new Date(event.target.value) : null;
    onDateSelect(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="h-16 w-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent">
          Dashboard Funerária Rost
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Selecione uma área para visualizar os relatórios específicos
        </p>
      </div>

      {/* Filtro de Data */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            Filtro por Data
          </CardTitle>
          <CardDescription>
            Selecione uma data específica para filtrar os relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="date"
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            {selectedDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDateSelect(null)}
                className="flex items-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/20"
              >
                <Clock className="h-4 w-4" />
                Limpar Filtro
              </Button>
            )}
          </div>
          {selectedDate && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
              <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                📅 Filtrando relatórios de: {selectedDate.toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid de Filiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ROST_BRANCH_OPTIONS.map((branch) => {
          const isSelected = selectedBranch === branch.id;
          const branchType = getBranchType(branch.id);
          
          return (
            <Card
              key={branch.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-border/50 bg-card/50 backdrop-blur-sm ${
                isSelected 
                  ? 'ring-2 ring-amber-500 shadow-lg scale-105' 
                  : 'hover:scale-102'
              }`}
              onClick={() => onBranchSelect(branch.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getBranchColor(branch.id)} text-white shadow-md`}>
                    {getBranchIcon(branch.id)}
                  </div>
                  <Badge className={branchType.color}>
                    {branchType.type}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold">
                  {branch.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {branch.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>Funerária Rost</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BarChart3 className="h-3 w-3" />
                    <span>
                      {branchType.type === 'Planos' ? 'Relatório de Planos' : 'Relatório de Atendimento'}
                    </span>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                      Selecionado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instruções */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
              <span className="text-sm font-medium">Como usar:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">1</span>
                </div>
                <span>Selecione uma área</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">2</span>
                </div>
                <span>Escolha uma data (opcional)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">3</span>
                </div>
                <span>Visualize o relatório</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

