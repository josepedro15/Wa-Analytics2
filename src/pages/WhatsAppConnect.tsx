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
  const [instanceStatus, setInstanceStatus] = useState<'idle' | 'creating' | 'qr_ready' | 'connected' | 'disconnected' | 'error'>('idle');
  
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

    // Função para verificar status REAL da instância
  const checkInstanceStatus = async () => {
    if (!instanceId || !formData.instanceName) return;

    try {
      console.log(`🔍 Verificando status REAL da instância: ${formData.instanceName}`);
      
      // Tentar criar a instância novamente para ver se ainda existe
      const response = await fetch('https://api.aiensed.com/instance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'd3050208ba862ee87302278ac4370cb9'
        },
        body: JSON.stringify({
          instanceName: formData.instanceName,
          qrcode: false, // Não gerar QR, só verificar
          integration: "WHATSAPP-BAILEYS"
        })
      });

      if (rootResponse.ok) {
        const rootData = await rootResponse.json();
        console.log('✅ Status da API:', rootData);
        
        // Se a API está ativa, tentar verificar se a instância está conectada
        console.log('📱 Verificando se WhatsApp está conectado...');
        
        // Tentar verificar se conseguimos acessar informações da instância
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
              if (instanceStatus !== 'connected') {
                console.log('🎉 WhatsApp conectado! Instância respondendo com sucesso.');
                setInstanceStatus('connected');
                setIsQrExpired(false);
                toast({
                  title: "WhatsApp Conectado!",
                  description: "Sua instância está ativa e pronta para receber dados.",
                });
              }
              return;
            }
          } else {
            console.log(`📱 Instância não respondeu: ${instanceCheckResponse.status}`);
            // Se a instância não responde, pode ter sido desconectada
            if (instanceStatus === 'connected') {
              console.log('⚠️ WhatsApp desconectado!');
              setInstanceStatus('disconnected');
              toast({
                title: "WhatsApp Desconectado",
                description: "A conexão foi perdida. Gere um novo QR Code para reconectar.",
                variant: "destructive"
              });
            }
          }
        } catch (instanceError) {
          console.log('📱 Erro ao verificar instância:', instanceError);
          // Se há erro, pode ter sido desconectada
          if (instanceStatus === 'connected') {
            console.log('⚠️ WhatsApp desconectado por erro!');
            setInstanceStatus('disconnected');
            toast({
              title: "WhatsApp Desconectado",
              description: "Erro na conexão. Gere um novo QR Code para reconectar.",
              variant: "destructive"
            });
          }
        }
        
        // Se chegou até aqui, ainda não está conectado
        if (instanceStatus !== 'connected' && instanceStatus !== 'disconnected') {
          console.log('📱 WhatsApp ainda não conectado. Aguardando...');
        }
      } else {
        console.log(`❌ API não respondeu: ${rootResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro na verificação:`, error);
    }
  };

  // Função para regenerar QR Code
  const regenerateQrCode = async () => {
    if (!formData.instanceName) return;

    console.log('🔄 Regenerando QR Code...');
    setIsQrExpired(false);
    setTimeRemaining(60);
    setInstanceStatus('creating');

    try {
      const response = await fetch('https://api.aiensed.com/instance/create', {
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
        const data = await response.json();
        console.log('✅ QR Code regenerado:', data);

        if (data.qrcode && data.instance) {
          setQrCode(data.qrcode.base64 || data.qrcode);
          setInstanceId(data.instance.instanceId || data.instance.id);
          setInstanceStatus('qr_ready');
          startQrTimer();
          
          toast({
            title: "QR Code Regenerado!",
            description: "Escaneie o novo QR Code com seu WhatsApp.",
          });
        }
      } else {
        console.log(`❌ Erro ao regenerar QR Code: ${response.status}`);
        setInstanceStatus('error');
        toast({
          title: "Erro ao Regenerar",
          description: "Não foi possível gerar um novo QR Code.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.log('❌ Erro ao regenerar QR Code:', error);
      setInstanceStatus('error');
      toast({
        title: "Erro ao Regenerar",
        description: "Erro de conexão ao gerar novo QR Code.",
        variant: "destructive"
      });
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



  // Persistência de estado no localStorage
  useEffect(() => {
    // Carregar estado salvo ao montar o componente
    const savedState = localStorage.getItem('whatsapp-connect-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        console.log('🔄 Restaurando estado salvo:', parsedState);
        
        if (parsedState.instanceName && parsedState.instanceId) {
          setFormData({ instanceName: parsedState.instanceName });
          setInstanceId(parsedState.instanceId);
          setInstanceCreated(true);
          
          // Se estava conectado, verificar se ainda está
          if (parsedState.status === 'connected') {
            setInstanceStatus('connected');
            console.log('🔄 Restaurando status conectado...');
            // Verificar status imediatamente
            setTimeout(() => checkInstanceStatus(), 1000);
          } else if (parsedState.status === 'qr_ready') {
            setInstanceStatus('qr_ready');
            if (parsedState.qrCode) {
              setQrCode(parsedState.qrCode);
              startQrTimer();
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro ao restaurar estado:', error);
        localStorage.removeItem('whatsapp-connect-state');
      }
    }
  }, []);

  // Salvar estado no localStorage quando mudar
  useEffect(() => {
    if (instanceId && formData.instanceName) {
      const stateToSave = {
        instanceName: formData.instanceName,
        instanceId,
        status: instanceStatus,
        qrCode: qrCode,
        timestamp: Date.now()
      };
      localStorage.setItem('whatsapp-connect-state', JSON.stringify(stateToSave));
      console.log('💾 Estado salvo:', stateToSave);
    }
  }, [instanceId, formData.instanceName, instanceStatus, qrCode]);

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
    
    // Se está conectado, continuar verificando status
    if (instanceStatus === 'connected' && instanceId) {
      statusInterval = setInterval(checkInstanceStatus, 10000); // Verificar a cada 10 segundos
    }
    
    return () => {
      if (statusInterval) clearInterval(statusInterval);
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [instanceStatus, instanceId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar ao Dashboard
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">
                📱 Conectar WhatsApp
              </h1>
              <p className="text-emerald-100 text-lg">
                Configure sua instância para análise de dados
              </p>
            </div>
            
            <div className="w-20"></div> {/* Espaçador para centralizar */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Debug Info - mais discreto */}
        <div className="mb-6 p-3 bg-blue-50/50 border border-blue-200/50 rounded-xl backdrop-blur-sm">
          <p className="text-xs text-blue-700 text-center">
            <strong>Debug:</strong> Usuário: {user?.email || 'Não autenticado'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Card Principal com design moderno */}
          <Card className="mb-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-100">
              <CardTitle className="flex items-center gap-3 text-2xl text-emerald-800">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-emerald-600" />
                </div>
                Configuração da Instância
              </CardTitle>
              <CardDescription className="text-emerald-700 text-lg">
                Crie uma nova instância do WhatsApp para análise de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                            {/* Formulário com design moderno */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border border-emerald-100">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="instanceName" className="text-lg font-semibold text-emerald-800 mb-2 block">
                        🏷️ Nome da Instância
                      </Label>
                      <div className="relative">
                        <Input
                          id="instanceName"
                          type="text"
                          placeholder="Ex: lojamoveis"
                          value={formData.instanceName}
                          onChange={(e) => handleInputChange('instanceName', e.target.value)}
                          className={`text-lg p-4 border-2 transition-all duration-300 ${
                            errors.instanceName 
                              ? "border-red-400 focus:border-red-500 focus:ring-red-200" 
                              : "border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                          } rounded-xl focus:ring-4`}
                          disabled={isCreatingInstance}
                        />
                        {errors.instanceName && (
                          <p className="mt-2 text-sm text-red-600 font-medium">{errors.instanceName}</p>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        💡 <strong>Dica:</strong> Use apenas letras minúsculas e números (sem hífens ou caracteres especiais). 
                        Ex: lojamoveis, empresaabc, vendas2024
                      </p>
                    </div>

                    {/* URL Preview com design moderno */}
                    <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
                      <p className="text-sm font-medium text-emerald-800 mb-2">
                        🔗 URL da instância:
                      </p>
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        <code className="text-sm font-mono text-emerald-700 break-all">
                          https://api.aiensed.com/instance/connect/{formData.instanceName || 'sua-instancia'}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botão principal com design moderno */}
                <div className="text-center">
                  <Button
                    onClick={handleConnect}
                    disabled={isCreatingInstance || !formData.instanceName}
                    className={`w-full max-w-md h-16 text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 ${
                      isCreatingInstance || !formData.instanceName
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 hover:scale-105 hover:shadow-xl'
                    }`}
                    size="lg"
                  >
                    {isCreatingInstance ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Conectando WhatsApp...
                      </>
                    ) : (
                      <>
                        <Zap className="h-6 w-6 mr-3" />
                        Conectar WhatsApp
                      </>
                    )}
                  </Button>
                </div>
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
                    {instanceStatus === 'disconnected' && (
                      <>
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <span className="text-orange-600 font-medium">WhatsApp Desconectado</span>
                      </>
                    )}
                  </div>

                  {/* QR Code - só mostra quando não está conectado */}
                  {(instanceStatus === 'qr_ready' || (instanceCreated && instanceStatus !== 'connected')) && qrCode && (
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
                            onClick={regenerateQrCode}
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
                      {/* Animações de sucesso */}
                      <div className="mb-4">
                        {/* Checkmark animado */}
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                            <svg 
                              className="w-5 h-5 text-white" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={3} 
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Texto de sucesso animado */}
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-green-600 animate-fade-in">
                            🎉 WhatsApp Conectado!
                          </h3>
                          <p className="text-lg text-green-700 font-medium">
                            Instância Ativa e Funcionando
                          </p>
                        </div>
                      </div>
                      
                      {/* Informações da instância */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-700">
                            Status: Conectado e Ativo
                          </span>
                        </div>
                        <p className="text-sm text-green-600">
                          Sua instância está pronta para receber e processar dados do WhatsApp.
                        </p>
                      </div>
                      
                      {/* ID da instância */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-500 mb-1">ID da Instância:</p>
                        <code className="text-xs bg-white px-2 py-1 rounded border font-mono">
                          {instanceId}
                        </code>
                      </div>
                      
                      {/* Mensagem de sucesso */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          ✅ Conexão estabelecida com sucesso!
                        </p>
                        <p className="text-xs text-gray-500">
                          Você pode fechar esta página. A instância continuará funcionando.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status Desconectado */}
                  {instanceStatus === 'disconnected' && (
                    <div className="text-center">
                      <div className="mb-4">
                        {/* Ícone de desconexão */}
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <svg 
                              className="w-5 h-5 text-white" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={3} 
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-orange-600 mb-2">
                          ⚠️ WhatsApp Desconectado
                        </h3>
                        <p className="text-lg text-orange-700 font-medium">
                          A conexão foi perdida
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-orange-600">
                          Sua instância foi desconectada. Gere um novo QR Code para reconectar.
                        </p>
                      </div>
                      
                      <Button
                        onClick={regenerateQrCode}
                        className="bg-orange-600 hover:bg-orange-700"
                        size="lg"
                      >
                        Reconectar WhatsApp
                      </Button>
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
                            // Limpar estado salvo
                            localStorage.removeItem('whatsapp-connect-state');
                            console.log('🗑️ Estado limpo do localStorage');
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
