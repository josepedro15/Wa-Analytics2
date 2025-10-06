import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBranchData, BRANCH_OPTIONS } from '@/hooks/useSaoMiguelData';
import { 
  FileText, 
  Calendar, 
  Building2, 
  RefreshCw, 
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useState } from 'react';

interface ReportViewerProps {
  selectedBranch: string;
  selectedDate?: Date | null;
}

export function SaoMiguelReportViewer({ selectedBranch, selectedDate }: ReportViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { 
    data: reportData, 
    isLoading, 
    error, 
    refetch 
  } = useBranchData(selectedBranch, selectedDate);

  const branchInfo = BRANCH_OPTIONS.find(b => b.id === selectedBranch);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadHTML = () => {
    if (!reportData?.html) return;
    
    const blob = new Blob([reportData.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${branchInfo?.name || 'relatorio'}_${reportData.data.split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openInNewTab = () => {
    if (!reportData?.html) return;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(reportData.html);
      newWindow.document.close();
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar relatório</h3>
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar o relatório da filial selecionada.
              </p>
              <Button onClick={() => refetch()} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
              <p className="text-muted-foreground">
                {selectedDate 
                  ? `Não há relatórios disponíveis para ${branchInfo?.description} na data ${selectedDate.toLocaleDateString('pt-BR')}.`
                  : `Não há relatórios disponíveis para ${branchInfo?.description}.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
      {/* Header do Relatório */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {branchInfo?.description}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {branchInfo?.name}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Disponível
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? 'Sair' : 'Tela Cheia'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Data do Relatório:</span>
              <span>{formatDate(reportData.data)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">ID:</span>
              <span className="font-mono text-xs">{reportData.id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Filial:</span>
              <span>{branchInfo?.description}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button onClick={downloadHTML} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Baixar HTML
            </Button>
            <Button variant="outline" onClick={openInNewTab} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Abrir em Nova Aba
            </Button>
            <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualizador do Relatório */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Visualização do Relatório
          </CardTitle>
          <CardDescription>
            Relatório HTML renderizado para {branchInfo?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <div 
              className={`bg-white ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'} overflow-auto`}
              dangerouslySetInnerHTML={{ __html: reportData.html }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Relatório gerado automaticamente para {branchInfo?.description} • 
              Última atualização: {formatDate(reportData.data)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
