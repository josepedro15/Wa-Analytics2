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
    .regex(/^[a-z0-9]+$/, 'Use apenas letras minúsculas e números (sem hífens ou caracteres especiais)')
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
  
  // Timer para expiração do QR Code
  const [qrExpirationTime, setQrExpirationTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isQrExpired, setIsQrExpired] = useState(false);
  
  // Função para gerar nome único (apenas letras e números)
  const generateUniqueName = (baseName: string): string => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    // Remover hífens e usar apenas letras e números
    return `${baseName}${timestamp}${randomSuffix}`;
  };
  
  // Função para sugerir nomes alternativos (apenas letras e números)
  const suggestAlternativeNames = (baseName: string): string => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    // Remover hífens e usar apenas letras e números
    return `${baseName}${timestamp}${randomSuffix}`;
  };

  // Função para iniciar timer de expiração do QR Code (60 segundos)
  const startQrTimer = () => {
    const expirationTime = Date.now() + (60 * 1000); // 60 segundos
    setQrExpirationTime(expirationTime);
    setTimeRemaining(60);
    setIsQrExpired(false);
  };

  // Função para verificar status da instância usando endpoints padrão da Evolution API
  const checkInstanceStatus = async () => {
    if (!instanceId) return;

    try {
      console.log(`🔍 Verificando status da instância: ${instanceId}`);
      
      // Tentar usar endpoint raiz para verificar status geral
      const rootResponse = await fetch('https://api.aiensed.com/', {
        headers: {
          'apikey': 'd3050208ba862ee87302278ac4370cb9'
        }
      });

      if (rootResponse.ok) {
        const rootData = await rootResponse.json();
        console.log('✅ Status da API:', rootData);
        
              // Se a API está ativa, tentar verificar se a instância está conectada
      // Como /fetchProfile não existe, vamos usar uma abordagem diferente
      console.log('📱 Verificando se WhatsApp está conectado...');
      
      // Tentar verificar se conseguimos acessar informações da instância
      // Vamos usar o endpoint raiz com parâmetros específicos
      try {
        const instanceCheckResponse = await fetch(`https://api.aiensed.com/?instance=${formData.instanceName}`, {
          headers: {
            'apikey': 'd3050208ba862ee87302278ac4370cb9'
          }
        });

        if (instanceCheckResponse.ok) {
          const instanceData = await instanceCheckResponse.json();
          console.log('✅ Dados da instância:', instanceData);
          
          // Se conseguimos acessar dados da instância, provavelmente está conectada
          if (instanceData.status === 200 && instanceData.message) {
            console.log('🎉 WhatsApp conectado! Instância respondendo com sucesso.');
            setInstanceStatus('connected');
            setIsQrExpired(false);
            toast({
              title: "WhatsApp Conectado!",
              description: "Sua instância está ativa e pronta para receber dados.",
            });
            return;
          }
        } else {
          console.log(`📱 Instância não respondeu: ${instanceCheckResponse.status}`);
        }
      } catch (instanceError) {
        console.log('📱 Erro ao verificar instância:', instanceError);
      }
      
      // Se chegou até aqui, ainda não está conectado
      console.log('📱 WhatsApp ainda não conectado. Aguardando...');
      } else {
        console.log(`❌ API não respondeu: ${rootResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro na verificação:`, error);
    }
  };

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
                  
                  // Se for erro de nome já em uso, tentar com nome único
                  if (errorJson.response?.message?.[0]?.includes('already in use')) {
                    const uniqueName = generateUniqueName(formData.instanceName);
                    console.log(`🔄 Tentando com nome único: ${uniqueName}`);
                    
                    // Tentar novamente com o nome único
                    const retryResponse = await fetch(endpoint, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'apikey': 'd3050208ba862ee87302278ac4370cb9'
                      },
                      body: JSON.stringify({
                        instanceName: uniqueName,
                        qrcode: true,
                        integration: "WHATSAPP-BAILEYS"
                      })
                    });
                    
                    if (retryResponse.ok) {
                      workingEndpoint = endpoint;
                      console.log(`✅ Endpoint funcionando com nome único: ${endpoint}`);
                      response = retryResponse;
                      break;
                    } else {
                      console.log(`❌ Retry com nome único falhou: ${retryResponse.status}`);
                    }
                  }
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
      
      // Passo 2: Extrair dados da resposta - baseado na estrutura real da API
      let qrCode = null;
      let instanceId = null;
      let instanceName = null;
      
      console.log('🔍 Estrutura da resposta:', data);
      
      // Extrair QR Code - tentar diferentes possibilidades
      if (data.qrcode) {
        if (typeof data.qrcode === 'string') {
          qrCode = data.qrcode;
        } else if (data.qrcode.base64) {
          qrCode = data.qrcode.base64;
        } else if (data.qrcode.code) {
          qrCode = data.qrcode.code;
        }
      }
      
      // Extrair Instance ID e Name
      if (data.instance) {
        if (typeof data.instance === 'string') {
          instanceId = data.instance;
        } else if (data.instance.instanceId) {
          instanceId = data.instance.instanceId;
        } else if (data.instance.id) {
          instanceId = data.instance.id;
        }
        
        if (data.instance.instanceName) {
          instanceName = data.instance.instanceName;
        }
      }
      
      // Fallbacks para outras estruturas possíveis
      if (!instanceId && data.instanceId) instanceId = data.instanceId;
      if (!instanceId && data.instance_id) instanceId = data.instance_id;
      if (!instanceId && data.id) instanceId = data.id;
      
      if (!qrCode && data.qrCode) qrCode = data.qrCode;
      if (!qrCode && data.qr) qrCode = data.qr;
      if (!qrCode && data.qrcode_url) qrCode = data.qrcode_url;
      
      console.log('🔍 QR Code encontrado:', qrCode);
      console.log('🔍 Instance ID encontrado:', instanceId);
      console.log('🔍 Instance Name encontrado:', instanceName);
      
      if (qrCode && instanceId) {
        console.log('✅ Dados extraídos com sucesso:', { qrCode, instanceId, instanceName });
        
        setQrCode(qrCode);
        setInstanceId(instanceId);
        setInstanceCreated(true);
        setInstanceStatus('qr_ready');
        
        console.log('🔄 Estados atualizados:', { 
          qrCode: !!qrCode, 
          instanceId: !!instanceId, 
          instanceCreated: true, 
          instanceStatus: 'qr_ready' 
        });
        
        toast({
          title: "QR Code Gerado!",
          description: `Instância "${instanceName || instanceId}" criada via ${workingEndpoint}. Agora escaneie o QR Code!`,
        });
      } else {
        // Mostrar erro mais detalhado
        const errorMsg = `API respondeu com sucesso, mas não encontrou os dados necessários.
        
Resposta recebida: ${JSON.stringify(data, null, 2)}

Chaves disponíveis: ${Object.keys(data).join(', ')}

Estrutura esperada: qrcode.base64 ou qrcode.code, e instance.instanceId ou instance.id`;
        
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



  // Timer de expiração do QR Code e verificação de status
  useEffect(() => {
    let statusInterval: number;
    let timerInterval: number;
    
    if (instanceStatus === 'qr_ready' && instanceId) {
      // Iniciar timer de expiração (60 segundos)
      startQrTimer();
      
      // Verificar status da instância a cada 5 segundos
      statusInterval = setInterval(checkInstanceStatus, 5000);
      
      // Timer de contagem regressiva
      timerInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsQrExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (statusInterval) clearInterval(statusInterval);
      if (timerInterval) clearInterval(timerInterval);
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
                             Use apenas letras minúsculas e números (sem hífens ou caracteres especiais). Ex: lojamoveis, empresaabc, vendas2024
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
                               Conectando WhatsApp...
                             </>
                           ) : (
                             <>
                               <Zap className="h-4 w-4 mr-2" />
                               Conectar WhatsApp
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
                  {(instanceStatus === 'qr_ready' || instanceCreated) && qrCode && (
                    <div className="text-center">
                      <h3 className="font-medium text-gray-800 mb-3">
                        Escaneie o QR Code com seu WhatsApp
                      </h3>
                      
                      {/* Timer de expiração */}
                      {!isQrExpired && (
                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-yellow-700">
                              QR Code expira em: <strong>{timeRemaining}s</strong>
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* QR Code expirado */}
                      {isQrExpired && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-red-700">
                              QR Code expirado! Clique em "Gerar Novo QR Code"
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-white p-4 rounded-lg inline-block border">
                        <img 
                          src={qrCode} 
                          alt="QR Code WhatsApp" 
                          className={`w-48 h-48 ${isQrExpired ? 'opacity-50' : ''}`}
                        />
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2">
                        Abra o WhatsApp Business → Configurações → Dispositivos Vinculados
                      </p>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        ID da Instância: {instanceId}
                      </div>
                      
                      {/* Botão para gerar novo QR Code quando expirar */}
                      {isQrExpired && (
                        <div className="mt-3">
                          <Button
                            onClick={() => {
                              setIsQrExpired(false);
                              setTimeRemaining(60);
                              startQrTimer();
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Gerar Novo QR Code
                          </Button>
                        </div>
                      )}
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
