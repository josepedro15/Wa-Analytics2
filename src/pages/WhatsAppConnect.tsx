import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  ArrowLeft,
  Smartphone,
  Zap
} from 'lucide-react';
import { z } from 'zod';

// Schema de validação para o formulário
const connectSchema = z.object({
  instanceName: z.string()
    .min(3, 'Nome da instância deve ter pelo menos 3 caracteres')
    .max(50, 'Nome da instância deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens')
    .refine(name => !name.startsWith('-') && !name.endsWith('-'), {
      message: 'Nome não pode começar ou terminar com hífen'
    })
});

type ConnectFormData = z.infer<typeof connectSchema>;

export default function WhatsAppConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ConnectFormData>({
    instanceName: ''
  });
  const [errors, setErrors] = useState<Partial<ConnectFormData>>({});
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);

  const validateForm = (): boolean => {
    try {
      connectSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<ConnectFormData> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ConnectFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleInputChange = (field: keyof ConnectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleConnect = async () => {
    if (!validateForm() || !user) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingInstance(true);
    
    try {
      // Chamada direta para a API Evolution (usando configuração do N8N)
      const response = await fetch('https://api.aiensed.com/instance/connect/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'd3050208ba862ee87302278ac4370cb9'
        },
        body: JSON.stringify({
          instanceName: formData.instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS"
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      toast({
        title: "Sucesso!",
        description: "Instância criada. Verifique a resposta da API no console.",
      });

      console.log('Resposta da API:', data);

      // Limpar formulário após envio
      setFormData({ instanceName: '' });
      
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar à API. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingInstance(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Conectar WhatsApp
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure sua instância do WhatsApp para começar a coletar dados
            </p>
          </div>
        </div>
        
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Debug:</strong> Página carregada. Usuário: {user?.email || 'Não autenticado'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Card Principal */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Configuração da Instância
              </CardTitle>
              <CardDescription>
                Crie uma nova instância do WhatsApp para análise de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="instanceName" className="text-sm font-medium">
                    Nome da Instância
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="instanceName"
                      type="text"
                      placeholder="Ex: lojamoveis"
                      value={formData.instanceName}
                      onChange={(e) => handleInputChange('instanceName', e.target.value)}
                      className={errors.instanceName ? "border-red-500 focus:border-red-500" : ""}
                      disabled={isCreatingInstance}
                    />
                    {errors.instanceName && (
                      <p className="mt-1 text-sm text-red-600">{errors.instanceName}</p>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Use apenas letras minúsculas, números e hífens. Ex: lojamoveis, empresa-abc, vendas2024
                  </p>
                </div>

                {/* URL Preview */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    URL da instância:
                  </p>
                  <code className="text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded border">
                    https://api.aiensed.com/instance/connect/{formData.instanceName || 'sua-instancia'}
                  </code>
                </div>

                <Button
                  onClick={handleConnect}
                  disabled={isCreatingInstance || !formData.instanceName}
                  className="w-full"
                  size="lg"
                >
                  {isCreatingInstance ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando Instância...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Criar Instância
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
