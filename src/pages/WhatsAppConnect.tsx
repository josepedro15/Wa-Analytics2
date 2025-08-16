import React, { useState, useEffect } from 'react';
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
  
  // Estado para controlar o fluxo
  const [instanceCreated, setInstanceCreated] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [instanceId, setInstanceId] = useState<string>('');
  const [instanceStatus, setInstanceStatus] = useState<'idle' | 'creating' | 'qr_ready' | 'connected' | 'error'>('idle');

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
    setInstanceStatus('creating');
    
    try {
      // Testar diferentes endpoints para encontrar o correto
      const endpoints = [
        'https://api.aiensed.com/instance/connect/',
        'https://api.aiensed.com/instance/create',
        'https://api.aiensed.com/instance/connect'
      ];
      
      let response;
      let workingEndpoint = '';
      
      // Tentar cada endpoint até encontrar um que funcione
      for (const endpoint of endpoints) {
        try {
          console.log(`Testando endpoint: ${endpoint}`);
          
          response = await fetch(endpoint, {
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
          
          if (response.ok) {
            workingEndpoint = endpoint;
            console.log(`✅ Endpoint funcionando: ${endpoint}`);
            break;
          } else {
            console.log(`❌ Endpoint ${endpoint} retornou: ${response.status}`);
            
            // Se for 403, vamos tentar ler a resposta de erro
            if (response.status === 403) {
              try {
                const errorData = await response.text();
                console.log(`🚨 Detalhes do erro 403:`, errorData);
                
                // Tentar parsear como JSON se possível
                try {
                  const errorJson = JSON.parse(errorData);
                  console.log(`🚨 Erro 403 em JSON:`, errorJson);
                } catch (parseError) {
                  console.log(`🚨 Erro 403 em texto:`, errorData);
                }
              } catch (readError) {
                console.log(`🚨 Não foi possível ler resposta de erro 403:`, readError);
              }
            }
          }
        } catch (endpointError) {
          console.log(`❌ Erro no endpoint ${endpoint}:`, endpointError);
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Nenhum endpoint funcionou. Último status: ${response?.status || 'Erro de rede'}`);
      }

      const data = await response.json();
      console.log('🔍 Resposta completa da API:', JSON.stringify(data, null, 2));
      console.log('🔍 Chaves disponíveis na resposta:', Object.keys(data));
      console.log('🔍 Tipo de dados:', typeof data);
      
      // Passo 2: Extrair dados da resposta - tentar diferentes formatos
      let qrCode = null;
      let instanceId = null;
      
      // Tentar diferentes possibilidades de chaves
      if (data.qrcode) qrCode = data.qrcode;
      else if (data.qrCode) qrCode = data.qrCode;
      else if (data.qr) qrCode = data.qr;
      else if (data.qrcode_url) qrCode = data.qrcode_url;
      
      if (data.instanceId) instanceId = data.instanceId;
      else if (data.instance_id) instanceId = data.instance_id;
      else if (data.id) instanceId = data.id;
      else if (data.instance) instanceId = data.instance;
      
      console.log('🔍 QR Code encontrado:', qrCode);
      console.log('🔍 Instance ID encontrado:', instanceId);
      
      if (qrCode && instanceId) {
        setQrCode(qrCode);
        setInstanceId(instanceId);
        setInstanceCreated(true);
        setInstanceStatus('qr_ready');
        
        toast({
          title: "QR Code Gerado!",
          description: `Instância criada via ${workingEndpoint}. Agora escaneie o QR Code!`,
        });
      } else {
        // Mostrar erro mais detalhado
        const errorMsg = `API respondeu com sucesso, mas não encontrou os dados necessários.
        
Resposta recebida: ${JSON.stringify(data, null, 2)}

Chaves disponíveis: ${Object.keys(data).join(', ')}

Esperado: qrcode (ou qrCode, qr, qrcode_url) e instanceId (ou instance_id, id, instance)`;
        
        console.error('❌ Erro detalhado:', errorMsg);
        throw new Error(`API não retornou dados esperados. Verifique o console para detalhes.`);
      }
      
    } catch (error) {
      console.error('Erro ao conectar:', error);
      setInstanceStatus('error');
      toast({
        title: "Erro na conexão",
        description: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setIsCreatingInstance(false);
    }
  };

  // Função para verificar status da instância
  const checkInstanceStatus = async () => {
    if (!instanceId) return;
    
    try {
      const response = await fetch(`https://api.aiensed.com/instance/status/${instanceId}`, {
        headers: {
          'apikey': 'd3050208ba862ee87302278ac4370cb9'
        }
      });

      if (response.ok) {
        const statusData = await response.json();
        
        if (statusData.status === 'connected') {
          setInstanceStatus('connected');
          toast({
            title: "Conectado!",
            description: "WhatsApp conectado com sucesso! A instância está ativa.",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  // Verificar status periodicamente quando QR estiver pronto
  useEffect(() => {
    let interval: number;
    
    if (instanceStatus === 'qr_ready' && instanceId) {
      interval = setInterval(checkInstanceStatus, 5000); // Verificar a cada 5 segundos
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [instanceStatus, instanceId]);

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

              {/* Status da Instância */}
              {instanceStatus !== 'idle' && (
                <div className="mt-6 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    {instanceStatus === 'creating' && (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span className="text-blue-600 font-medium">Criando instância...</span>
                      </>
                    )}
                    {instanceStatus === 'qr_ready' && (
                      <>
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 font-medium">QR Code Gerado!</span>
                      </>
                    )}
                    {instanceStatus === 'connected' && (
                      <>
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 font-medium">WhatsApp Conectado!</span>
                      </>
                    )}
                    {instanceStatus === 'error' && (
                      <>
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-red-600 font-medium">Erro na Conexão</span>
                      </>
                    )}
                  </div>

                  {/* QR Code */}
                  {instanceStatus === 'qr_ready' && qrCode && (
                    <div className="text-center">
                      <h3 className="font-medium text-gray-800 mb-3">
                        Escaneie o QR Code com seu WhatsApp
                      </h3>
                      <div className="bg-white p-4 rounded-lg inline-block border">
                        <img 
                          src={qrCode} 
                          alt="QR Code WhatsApp" 
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Abra o WhatsApp Business → Configurações → Dispositivos Vinculados
                      </p>
                      <div className="mt-3 text-xs text-gray-500">
                        ID da Instância: {instanceId}
                      </div>
                    </div>
                  )}

                  {/* Status Conectado */}
                  {instanceStatus === 'connected' && (
                    <div className="text-center">
                      <div className="text-green-600 text-lg font-medium mb-2">
                        ✅ Instância Conectada com Sucesso!
                      </div>
                      <p className="text-sm text-gray-600">
                        Sua instância está ativa e pronta para receber dados do WhatsApp.
                      </p>
                      <div className="mt-3 text-xs text-gray-500">
                        ID da Instância: {instanceId}
                      </div>
                    </div>
                  )}

                  {/* Botão para nova instância */}
                  {instanceStatus === 'connected' && (
                    <div className="mt-4 text-center">
                      <Button
                        onClick={() => {
                          setInstanceStatus('idle');
                          setInstanceCreated(false);
                          setQrCode('');
                          setInstanceId('');
                          setFormData({ instanceName: '' });
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Criar Nova Instância
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
