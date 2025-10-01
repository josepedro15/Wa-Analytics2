import { useState } from 'react';
import { useHtmlData } from '@/hooks/useHtmlData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, RefreshCw, Eye, Calendar, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Teste() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: htmlData, isLoading, error, refetch } = useHtmlData();

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Dados atualizados",
      description: "Lista de HTMLs foi atualizada com sucesso.",
    });
  };

  const handleSelectHtml = (id: number) => {
    setSelectedId(id);
    toast({
      title: "HTML selecionado",
      description: `Carregando HTML ID: ${id}`,
    });
  };

  const selectedHtml = htmlData?.find(item => item.id === selectedId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
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
          <h3 className="text-xl font-semibold mb-2">Erro ao carregar dados</h3>
          <p className="text-muted-foreground mb-6">Não foi possível carregar os dados da tabela HTML.</p>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Teste de HTML
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Visualize e teste HTMLs armazenados no banco de dados
            </p>
          </div>
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista de HTMLs */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  HTMLs Disponíveis
                </CardTitle>
                <CardDescription>
                  Selecione um HTML para visualizar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {htmlData && htmlData.length > 0 ? (
                  <div className="space-y-3">
                    {htmlData.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedId === item.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleSelectHtml(item.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">ID: {item.id}</Badge>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(item.data).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.html.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum HTML encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visualização do HTML */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visualização
                </CardTitle>
                <CardDescription>
                  {selectedHtml ? `HTML ID: ${selectedHtml.id}` : 'Selecione um HTML para visualizar'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedHtml ? (
                  <div className="space-y-4">
                    {/* Informações do HTML */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary">ID: {selectedHtml.id}</Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedHtml.data).toLocaleString('pt-BR')}
                      </div>
                    </div>

                    {/* Preview do HTML */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted px-4 py-2 text-sm font-medium border-b">
                        Preview
                      </div>
                      <div className="p-4 bg-background min-h-[400px] max-h-[600px] overflow-auto">
                        <div 
                          dangerouslySetInnerHTML={{ __html: selectedHtml.html }}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Código fonte */}
                    <details className="border rounded-lg">
                      <summary className="bg-muted px-4 py-2 text-sm font-medium cursor-pointer hover:bg-muted/80">
                        Código Fonte
                      </summary>
                      <div className="p-4 bg-background">
                        <pre className="text-xs overflow-auto max-h-[300px] whitespace-pre-wrap">
                          {selectedHtml.html}
                        </pre>
                      </div>
                    </details>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Selecione um HTML da lista para visualizar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
