import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppInstances } from '@/hooks/useWhatsAppInstances';
import { 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Smartphone,
  Wifi,
  Shield,
  Zap,
  Info,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';

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
  const { 
    instances, 
    isLoadingInstances, 
    createInstance, 
    deleteInstance,
    isCreatingInstance,
    isDeletingInstance,
    refetchInstances
  } = useWhatsAppInstances();
  
  const [formData, setFormData] = useState<ConnectFormData>({
    instanceName: ''
  });
  const [errors, setErrors] = useState<Partial<ConnectFormData>>({});

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

    createInstance({
      instanceName: formData.instanceName,
      userId: user.id,
      email: user.email || ''
    });

    // Limpar formulário após envio
    setFormData({ instanceName: '' });
  };

  const handleDeleteInstance = (instanceId: string) => {
    if (confirm('Tem certeza que deseja remover esta instância?')) {
      deleteInstance(instanceId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'connecting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
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
                      className={cn(
                        "transition-colors",
                        errors.instanceName && "border-red-500 focus:border-red-500"
                      )}
                      disabled={isConnecting}
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
                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

                             {/* Instâncias Existentes */}
               {instances && instances.length > 0 && (
                 <div className="space-y-4">
                   <Separator />
                   <div>
                     <h3 className="text-lg font-semibold mb-4">Suas Instâncias</h3>
                     <div className="space-y-3">
                       {instances.map((instance) => (
                         <Card key={instance.id} className="p-4">
                           <div className="flex items-center justify-between">
                             <div className="flex-1">
                               <div className="flex items-center gap-3 mb-2">
                                 <h4 className="font-medium">{instance.instance_name}</h4>
                                 <Badge 
                                   variant="outline" 
                                   className={cn("text-xs", getStatusColor(instance.status))}
                                 >
                                   <div className="flex items-center gap-1">
                                     {getStatusIcon(instance.status)}
                                     {instance.status === 'connected' ? 'Conectado' :
                                      instance.status === 'connecting' ? 'Conectando' :
                                      instance.status === 'disconnected' ? 'Desconectado' :
                                      'Erro'}
                                   </div>
                                 </Badge>
                               </div>
                               <div className="text-sm text-gray-600 space-y-1">
                                 <p>ID: {instance.instance_id}</p>
                                 {instance.phone_number && (
                                   <p>Telefone: {instance.phone_number}</p>
                                 )}
                                 <p>Criado em: {new Date(instance.created_at).toLocaleDateString('pt-BR')}</p>
                               </div>
                             </div>
                             <div className="flex items-center gap-2">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => refetchInstances()}
                                 disabled={isLoadingInstances}
                               >
                                 <RefreshCw className="h-4 w-4" />
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleDeleteInstance(instance.instance_id)}
                                 disabled={isDeletingInstance}
                                 className="text-red-600 hover:text-red-700"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                           
                           {/* QR Code para instâncias em conexão */}
                           {instance.status === 'connecting' && instance.qr_code && (
                             <div className="mt-4 pt-4 border-t">
                               <div className="text-center">
                                 <h5 className="font-medium text-blue-800 mb-2">
                                   Escaneie o QR Code
                                 </h5>
                                 <div className="bg-white p-4 rounded-lg inline-block">
                                   <img 
                                     src={instance.qr_code} 
                                     alt="QR Code WhatsApp" 
                                     className="w-32 h-32"
                                   />
                                 </div>
                                 <p className="text-sm text-blue-700 mt-2">
                                   Abra o WhatsApp e escaneie este código
                                 </p>
                               </div>
                             </div>
                           )}
                         </Card>
                       ))}
                     </div>
                   </div>
                 </div>
               )}

               {/* Loading das instâncias */}
               {isLoadingInstances && (
                 <div className="text-center py-8">
                   <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                   <p className="text-gray-600">Carregando instâncias...</p>
                 </div>
               )}
            </CardContent>
          </Card>

          {/* Cards Informativos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <h3 className="font-medium text-sm">Conexão Segura</h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Sua instância será criada com criptografia de ponta a ponta
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <h3 className="font-medium text-sm">Dados Protegidos</h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Todos os dados são armazenados de forma segura e privada
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-purple-500" />
                  <h3 className="font-medium text-sm">Integração N8N</h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Após a conexão, configure os workflows no N8N
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Instruções */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Como funciona</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Crie a instância</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Digite um nome único para sua instância do WhatsApp
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Conecte o WhatsApp</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Escaneie o QR Code com seu WhatsApp Business
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Configure o N8N</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use a instância criada para configurar seus workflows
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Analise os dados</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visualize insights e métricas no dashboard
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
