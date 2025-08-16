import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Smartphone, Zap, CheckCircle, AlertCircle, Clock, QrCode, Wifi, WifiOff } from 'lucide-react';
import { z } from 'zod';

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
  
  const [formData, setFormData] = useState<ConnectFormData>({ instanceName: '' });
  const [errors, setErrors] = useState<Partial<ConnectFormData>>({});
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [instanceCreated, setInstanceCreated] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [instanceId, setInstanceId] = useState<string>('');
  const [instanceStatus, setInstanceStatus] = useState<'idle' | 'creating' | 'qr_ready' | 'connected' | 'disconnected' | 'error'>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [isQrExpired, setIsQrExpired] = useState(false);

  const generateUniqueName = (baseName: string): string => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${baseName}${timestamp}${randomSuffix}`;
  };

  const startQrTimer = () => {
    setTimeRemaining(60);
    setIsQrExpired(false);
  };

  // Função para verificar status da instância em tempo real via API
  const checkInstanceStatus = async () => {
    if (!instanceId || !formData.instanceName) return;

    try {
      console.log(`🔍 Verificando status da instância: ${formData.instanceName} (ID: ${instanceId})`);
      console.log(`🔍 Status atual: ${instanceStatus}`);
      
      // Verificar status da instância via POST /instance/create com qrcode: false
      try {
        const statusResponse = await fetch('https://api.aiensed.com/instance/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'd3050208ba862ee87302278ac4370cb9'
          },
          body: JSON.stringify({
            instanceName: formData.instanceName,
            qrcode: false,
            integration: "WHATSAPP-BAILEYS"
          })
        });
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('🔍 Resposta da verificação de status:', statusData);
          
          // Se retornou instância mas sem QR code, está conectada
          if (statusData.instance && !statusData.qrcode) {
            console.log('🎉 WhatsApp CONECTADO! (instância ativa sem QR)');
            if (instanceStatus !== 'connected') {
              setInstanceStatus('connected');
              setIsQrExpired(false);
              toast({
                title: "WhatsApp Conectado!",
                description: "Sua instância está ativa e pronta para receber dados.",
              });
            }
            return;
          }
          
          // Se retornou QR code, ainda não está conectada
          if (statusData.qrcode) {
            console.log('📱 WhatsApp ainda não conectado (QR code presente)');
            if (instanceStatus !== 'qr_ready') {
              setInstanceStatus('qr_ready');
            }
            return;
          }
          
        } else if (statusResponse.status === 404) {
          console.log('📱 Instância não encontrada (404) - foi excluída');
          if (instanceStatus === 'connected') {
            setInstanceStatus('disconnected');
            toast({
              title: "WhatsApp Desconectado",
              description: "A instância foi removida da API.",
              variant: "destructive"
            });
          }
          return;
        } else if (statusResponse.status === 403) {
          console.log('🚫 Acesso negado (403) - verificar permissões');
          return;
        }
        
      } catch (statusError) {
        console.log('❌ Erro ao verificar status:', statusError);
      }
      
      // Se chegou até aqui, a instância não está conectada
      console.log('📱 Instância não está conectada');
      if (instanceStatus === 'connected') {
        setInstanceStatus('disconnected');
        toast({
          title: "WhatsApp Desconectado",
          description: "A conexão foi perdida.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.log(`❌ Erro na verificação:`, error);
    }
  };

  const regenerateQrCode = async () => {
    if (!formData.instanceName) return;

    setIsQrExpired(false);
    setTimeRemaining(60);
    setInstanceStatus('creating');

    try {
      // Usar o endpoint que sabemos que funciona para criar instância
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
        setInstanceStatus('error');
        toast({
          title: "Erro ao Regenerar",
          description: "Não foi possível gerar um novo QR Code.",
          variant: "destructive"
        });
      }
    } catch (error) {
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
      // Usar o endpoint que sabemos que funciona para criar instância
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
        console.log('🔍 Resposta completa da API:', data);
        
        let qrCode = null;
        let instanceId = null;
        let instanceName = null;
        
        if (data.qrcode) {
          if (typeof data.qrcode === 'string') {
            qrCode = data.qrcode;
          } else if (data.qrcode.base64) {
            qrCode = data.qrcode.base64;
          } else if (data.qrcode.code) {
            qrCode = data.qrcode.code;
          }
        }
        
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
        
        if (!instanceId && data.instanceId) instanceId = data.instanceId;
        if (!instanceId && data.instance_id) instanceId = data.instance_id;
        if (!instanceId && data.id) instanceId = data.id;
        
        if (!qrCode && data.qrCode) qrCode = data.qrCode;
        if (!qrCode && data.qr) qrCode = data.qr;
        if (!qrCode && data.qrcode_url) qrCode = data.qrcode_url;
        
        if (qrCode && instanceId) {
          setQrCode(qrCode);
          setInstanceId(instanceId);
          setInstanceCreated(true);
          setInstanceStatus('qr_ready');
          
          toast({
            title: "QR Code Gerado!",
            description: `Instância "${instanceName || instanceId}" criada com sucesso. Agora escaneie o QR Code!`,
          });
        } else {
          throw new Error(`API não retornou dados esperados. Verifique o console para detalhes.`);
        }
        
      } else if (response.status === 403) {
        // Se for 403, tentar com nome único
        try {
          const errorData = await response.text();
          console.log(`🚨 Erro 403:`, errorData);
          
          if (errorData.toLowerCase().includes('already in use')) {
            const uniqueName = generateUniqueName(formData.instanceName);
            console.log(`🔄 Tentando com nome único: ${uniqueName}`);
            
            const retryResponse = await fetch('https://api.aiensed.com/instance/create', {
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
              const retryData = await retryResponse.json();
              
              let qrCode = null;
              let instanceId = null;
              
              if (retryData.qrcode) {
                qrCode = retryData.qrcode.base64 || retryData.qrcode;
              }
              
              if (retryData.instance) {
                instanceId = retryData.instance.instanceId || retryData.instance.id;
              }
              
              if (qrCode && instanceId) {
                setFormData(prev => ({ ...prev, instanceName: uniqueName }));
                setQrCode(qrCode);
                setInstanceId(instanceId);
                setInstanceCreated(true);
                setInstanceStatus('qr_ready');
                
                toast({
                  title: "QR Code Gerado!",
                  description: `Instância "${uniqueName}" criada com nome único. Agora escaneie o QR Code!`,
                });
              }
            } else {
              throw new Error(`Retry com nome único falhou: ${retryResponse.status}`);
            }
          } else {
            throw new Error(`Erro 403: ${errorData}`);
          }
        } catch (parseError) {
          throw new Error(`Erro ao processar resposta 403: ${parseError}`);
        }
      } else {
        throw new Error(`API retornou erro: ${response.status}`);
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

  useEffect(() => {
    const savedState = localStorage.getItem('whatsapp-connect-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        if (parsedState.instanceName && parsedState.instanceId) {
          setFormData({ instanceName: parsedState.instanceName });
          setInstanceId(parsedState.instanceId);
          setInstanceCreated(true);
          
          if (parsedState.status === 'connected') {
            setInstanceStatus('connected');
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
    }
  }, [instanceId, formData.instanceName, instanceStatus, qrCode]);

  useEffect(() => {
    let statusInterval: number;
    let timerInterval: number;
    
    if (instanceStatus === 'qr_ready' && instanceId) {
      startQrTimer();
      
      // Verificar status em tempo real quando aguardando conexão
      statusInterval = setInterval(checkInstanceStatus, 2000); // A cada 2 segundos
      
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
    
    if (instanceStatus === 'connected' && instanceId) {
      // Verificar status a cada 5 segundos quando conectado (mais responsivo)
      statusInterval = setInterval(checkInstanceStatus, 5000);
    }
    
    return () => {
      if (statusInterval) clearInterval(statusInterval);
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [instanceStatus, instanceId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header com design moderno */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/20 transition-all duration-300 rounded-xl px-6 py-3"
            >
              <ArrowLeft className="h-5 w-5 mr-3" />
              <span className="font-medium">Voltar ao Dashboard</span>
            </Button>
            
            <div className="text-center flex-1">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Conectar WhatsApp
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Configure sua instância para análise de dados e integração com o sistema
              </p>
            </div>
            
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Debug Info com design melhorado */}
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-blue-700 font-medium">
              <strong>Debug:</strong> Usuário: {user?.email || 'Não autenticado'}
            </p>
          </div>
        </div>

        {/* Layout principal com grid responsivo */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Coluna Principal - Formulário */}
          <div className="xl:col-span-2 space-y-8">
            {/* Card de Configuração */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-100 p-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                      Configuração da Instância
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 leading-relaxed">
                      Crie uma nova instância do WhatsApp para análise de dados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                {/* Formulário com design moderno */}
                <div className="space-y-6">
                  {/* Campo Nome da Instância */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 shadow-sm">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="instanceName" className="text-xl font-semibold text-gray-800">
                          🏷️ Nome da Instância
                        </Label>
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Obrigatório
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Input
                          id="instanceName"
                          type="text"
                          placeholder="Ex: lojamoveis, empresaabc, vendas2024"
                          value={formData.instanceName}
                          onChange={(e) => handleInputChange('instanceName', e.target.value)}
                          className={`text-lg p-5 border-2 transition-all duration-300 ${
                            errors.instanceName 
                              ? "border-red-400 focus:border-red-500 focus:ring-red-200" 
                              : "border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                          } rounded-2xl focus:ring-4 focus:ring-blue-100`}
                          disabled={isCreatingInstance}
                        />
                        {errors.instanceName && (
                          <p className="mt-3 text-sm text-red-600 font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errors.instanceName}
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-700">Dica de Nomenclatura</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Use apenas <strong>letras minúsculas</strong> e <strong>números</strong> (sem hífens ou caracteres especiais). 
                          Exemplos: <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">lojamoveis</code>, 
                          <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">empresaabc</code>, 
                          <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">vendas2024</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* URL Preview com design moderno */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-xl">
                        <QrCode className="h-5 w-5 text-indigo-600" />
                      </div>
                      <span className="text-lg font-semibold text-indigo-800">URL da Instância</span>
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-sm">
                      <code className="text-sm font-mono text-indigo-700 break-all bg-indigo-50 px-3 py-2 rounded-lg block">
                        https://api.aiensed.com/instance/connect/{formData.instanceName || 'sua-instancia'}
                      </code>
                    </div>
                  </div>

                  {/* Botão principal com design moderno */}
                  <div className="text-center pt-4">
                    <Button
                      onClick={handleConnect}
                      disabled={isCreatingInstance || !formData.instanceName}
                      className={`w-full max-w-lg h-20 text-xl font-bold rounded-3xl shadow-2xl transition-all duration-500 ${
                        isCreatingInstance || !formData.instanceName
                          ? 'bg-gray-400 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:scale-105 hover:shadow-3xl'
                      }`}
                      size="lg"
                    >
                      {isCreatingInstance ? (
                        <div className="flex items-center gap-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Conectando WhatsApp...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <Zap className="h-7 w-7" />
                          <span>Conectar WhatsApp</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status da Instância com design melhorado */}
            {instanceStatus !== 'idle' && (
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 p-6">
                  <div className="flex items-center gap-3">
                    {instanceStatus === 'creating' && (
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                    {instanceStatus === 'qr_ready' && (
                      <div className="p-2 bg-green-100 rounded-xl">
                        <QrCode className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                    {instanceStatus === 'connected' && (
                      <div className="p-2 bg-green-100 rounded-xl">
                        <Wifi className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                    {instanceStatus === 'error' && (
                      <div className="p-2 bg-red-100 rounded-xl">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                    )}
                    {instanceStatus === 'disconnected' && (
                      <div className="p-2 bg-orange-100 rounded-xl">
                        <WifiOff className="h-6 w-6 text-orange-600" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {instanceStatus === 'creating' && 'Criando Instância...'}
                        {instanceStatus === 'qr_ready' && 'QR Code Gerado!'}
                        {instanceStatus === 'connected' && 'WhatsApp Conectado!'}
                        {instanceStatus === 'error' && 'Erro na Conexão'}
                        {instanceStatus === 'disconnected' && 'WhatsApp Desconectado'}
                      </h3>
                      <p className="text-gray-600">
                        {instanceStatus === 'creating' && 'Aguarde enquanto criamos sua instância...'}
                        {instanceStatus === 'qr_ready' && 'Escaneie o QR Code com seu WhatsApp'}
                        {instanceStatus === 'connected' && 'Sua instância está ativa e funcionando'}
                        {instanceStatus === 'error' && 'Ocorreu um erro durante a conexão'}
                        {instanceStatus === 'disconnected' && 'A conexão foi perdida'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* QR Code Section */}
                  {(instanceStatus === 'qr_ready' || (instanceCreated && instanceStatus !== 'connected')) && qrCode && (
                    <div className="text-center space-y-6">
                      {/* Timer de expiração */}
                      {!isQrExpired && (
                        <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl shadow-sm">
                          <Clock className="h-5 w-5 text-yellow-600" />
                          <span className="text-lg font-semibold text-yellow-700">
                            QR Code expira em: <strong className="text-2xl">{timeRemaining}s</strong>
                          </span>
                        </div>
                      )}
                      
                      {/* QR Code expirado */}
                      {isQrExpired && (
                        <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-sm">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <span className="text-lg font-semibold text-red-700">
                            QR Code expirado! Clique em "Gerar Novo QR Code"
                          </span>
                        </div>
                      )}
                      
                      {/* QR Code Image */}
                      <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-lg inline-block">
                        <img 
                          src={qrCode} 
                          alt="QR Code WhatsApp" 
                          className={`w-56 h-56 ${isQrExpired ? 'opacity-50 grayscale' : ''} transition-all duration-300`}
                        />
                      </div>
                      
                      {/* Instruções */}
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">📱 Como Escanear:</h4>
                          <ol className="text-sm text-blue-700 space-y-1 text-left">
                            <li>1. Abra o <strong>WhatsApp Business</strong></li>
                            <li>2. Vá em <strong>Configurações</strong></li>
                            <li>3. Toque em <strong>Dispositivos Vinculados</strong></li>
                            <li>4. Escaneie o QR Code acima</li>
                          </ol>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-600">
                            <strong>ID da Instância:</strong> {instanceId}
                          </p>
                        </div>
                      </div>
                      
                      {/* Botões de ação */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        {isQrExpired && (
                          <Button
                            onClick={regenerateQrCode}
                            variant="outline"
                            size="lg"
                            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 rounded-2xl px-8"
                          >
                            <QrCode className="h-5 w-5 mr-2" />
                            Gerar Novo QR Code
                          </Button>
                        )}
                        
                        <Button
                          onClick={checkInstanceStatus}
                          variant="outline"
                          size="lg"
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 rounded-2xl px-8"
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Verificar Status
                        </Button>
                        
                        <Button
                          onClick={() => {
                            console.log('🔍 Status atual:', instanceStatus);
                            console.log('🔍 Instance ID:', instanceId);
                            console.log('🔍 Instance Name:', formData.instanceName);
                            toast({
                              title: "Debug Info",
                              description: `Status: ${instanceStatus}, ID: ${instanceId}`,
                            });
                          }}
                          variant="ghost"
                          size="lg"
                          className="text-gray-600 hover:text-gray-800 rounded-2xl px-6"
                        >
                          📊 Debug
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Status Conectado */}
                  {instanceStatus === 'connected' && (
                    <div className="text-center space-y-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6 shadow-lg">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-green-600">
                          🎉 WhatsApp Conectado!
                        </h3>
                        <p className="text-xl text-green-700 font-medium">
                          Instância Ativa e Funcionando
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-center gap-3 mb-4">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-lg font-semibold text-green-700">
                            Status: Conectado e Ativo
                          </span>
                        </div>
                        <p className="text-green-600 leading-relaxed">
                          Sua instância está pronta para receber e processar dados do WhatsApp.
                          Os dados serão coletados automaticamente e estarão disponíveis no dashboard.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 max-w-md mx-auto">
                        <p className="text-sm text-gray-500 mb-2">ID da Instância:</p>
                        <code className="text-sm bg-white px-3 py-2 rounded-xl border font-mono text-gray-700 break-all">
                          {instanceId}
                        </code>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 max-w-lg mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <span className="text-lg font-semibold text-green-700">
                            Conexão Estabelecida com Sucesso!
                          </span>
                        </div>
                        <p className="text-green-600">
                          Você pode fechar esta página. A instância continuará funcionando e coletando dados automaticamente.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status Desconectado */}
                  {instanceStatus === 'disconnected' && (
                    <div className="text-center space-y-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-6 shadow-lg">
                        <WifiOff className="h-12 w-12 text-orange-600" />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-orange-600">
                          ⚠️ WhatsApp Desconectado
                        </h3>
                        <p className="text-xl text-orange-700 font-medium">
                          A conexão foi perdida
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-3xl p-6 shadow-sm">
                        <p className="text-orange-700 leading-relaxed">
                          Sua instância foi desconectada ou removida da API. 
                          Gere um novo QR Code para reconectar e continuar coletando dados.
                        </p>
                      </div>
                      
                      <Button
                        onClick={regenerateQrCode}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-2xl px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        size="lg"
                      >
                        <Wifi className="h-6 w-6 mr-3" />
                        Reconectar WhatsApp
                      </Button>
                    </div>
                  )}

                  {/* Botão para nova instância */}
                  {instanceStatus === 'connected' && (
                    <div className="text-center pt-6">
                      <Button
                        onClick={() => {
                          setInstanceStatus('idle');
                          setInstanceCreated(false);
                          setQrCode('');
                          setInstanceId('');
                          setFormData({ instanceName: '' });
                          localStorage.removeItem('whatsapp-connect-state');
                          console.log('🗑️ Estado limpo do localStorage');
                        }}
                        variant="outline"
                        size="lg"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-2xl px-8 py-3"
                      >
                        <Smartphone className="h-5 w-5 mr-2" />
                        Criar Nova Instância
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar com apenas o card de ajuda */}
          <div className="space-y-6">
            {/* Card de Ajuda */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-green-800">
                    Como Funciona
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p>Digite o nome da instância (apenas letras e números)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p>Clique em "Conectar WhatsApp" para gerar o QR Code</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <p>Escaneie o QR Code com seu WhatsApp Business</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    <p>A instância será criada e conectada automaticamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
