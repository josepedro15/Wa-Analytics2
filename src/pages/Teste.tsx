import { useHtmlData } from '@/hooks/useHtmlData';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Teste() {
  const { toast } = useToast();
  const { data: htmlData, isLoading, error, refetch } = useHtmlData();

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Dados atualizados",
      description: "HTML foi atualizado com sucesso.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando HTML...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Erro ao carregar HTML</h3>
          <p className="text-muted-foreground mb-6">Não foi possível carregar o HTML da tabela.</p>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Pega o HTML mais recente (primeiro da lista ordenada por ID decrescente)
  const latestHtml = htmlData && htmlData.length > 0 ? htmlData[0] : null;

  if (!latestHtml) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="h-16 w-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum HTML encontrado</h3>
          <p className="text-muted-foreground mb-6">Não há HTMLs disponíveis na tabela.</p>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>
    );
  }

  // Renderiza o HTML completo diretamente
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: latestHtml.html }}
      className="w-full"
    />
  );
}
