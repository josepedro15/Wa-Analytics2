import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  CheckCircle, 
  Mail, 
  Phone, 
  ArrowRight,
  Home
} from 'lucide-react';

export default function PalestraObrigado() {
  const navigate = useNavigate();

  useEffect(() => {
    // Limpar qualquer dado residual do sessionStorage
    sessionStorage.removeItem('palestraLeadData');
  }, []);

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
                Cadastro realizado com sucesso!
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Card Principal */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                {/* Ícone de Sucesso */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl mb-4 animate-bounce">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>

                {/* Título */}
                <div className="space-y-3">
                  <h2 className="text-4xl md:text-5xl font-bold">
                    Tudo Certo! 🎉
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Suas informações foram registradas com sucesso. 
                    Em breve entraremos em contato!
                  </p>
                </div>

                {/* Próximos Passos */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-8 space-y-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    📋 Próximos Passos
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">1</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Verificar Email</p>
                          <p className="text-sm text-muted-foreground">
                            Enviamos uma confirmação para seu email
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">2</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Aguardar Contato</p>
                          <p className="text-sm text-muted-foreground">
                            Entraremos em contato em até 24h
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">3</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Preparar Dúvidas</p>
                          <p className="text-sm text-muted-foreground">
                            Anote suas perguntas sobre o sistema
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">4</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Receber Conteúdo</p>
                          <p className="text-sm text-muted-foreground">
                            Material personalizado conforme sua escolha
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações de Contato */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                  <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-xl">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">Verificar sua caixa de entrada</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-xl">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">WhatsApp</p>
                      <p className="text-sm font-medium">Fique de olho nas mensagens</p>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <Home className="h-5 w-5" />
                    Voltar ao Início
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/auth')}
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <span>Acessar Plataforma</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Informação Extra */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <p className="font-semibold text-purple-900 dark:text-purple-100">
                    Dica Importante
                  </p>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                  Enquanto aguarda nosso contato, que tal explorar nossa plataforma? 
                  Você pode criar uma conta gratuita e conhecer algumas funcionalidades básicas!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

