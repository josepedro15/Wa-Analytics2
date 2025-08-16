import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Zap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

// Schema de validação
const connectSchema = z.object({
  instanceName: z.string().min(3).max(20).regex(/^[a-z0-9]+$/, 'Apenas letras minúsculas e números são permitidos')
});

type InstanceStatus = 'idle' | 'creating' | 'qr_ready' | 'connected' | 'error' | 'disconnected';

export default function WhatsAppConnect() {
  const navigate = useNavigate();
  
  // Estados
  const [formData, setFormData] = useState({ instanceName: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [instanceStatus, setInstanceStatus] = useState<InstanceStatus>('idle');
  const [instanceCreated, setInstanceCreated] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [qrExpirationTime, setQrExpirationTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isQrExpired, setIsQrExpired] = useState(false);

  // Carregar estado salvo
  useEffect(() => {
    const savedState = localStorage.getItem('whatsapp-connect-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setFormData({ instanceName: parsed.instanceName || '' });
        setInstanceId(parsed.instanceId || '');
        setInstanceStatus(parsed.status || 'idle');
        setQrCode(parsed.qrCode || '');
        setInstanceCreated(!!parsed.instanceId);
      } catch (error) {
        console.error('Erro ao carregar estado salvo:', error);
      }
    }
  }, []);

  // Salvar estado
  useEffect(() => {
    if (formData.instanceName || instanceId || instanceStatus !== 'idle' || qrCode) {
      const stateToSave = {
        instanceName: formData.instanceName,
        instanceId,
        status: instanceStatus,
        qrCode
      };
      localStorage.setItem('whatsapp-connect-state', JSON.stringify(stateToSave));
    }
  }, [formData.instanceName, instanceId, instanceStatus, qrCode]);

  // Timer do QR Code
  useEffect(() => {
    let interval: number;
    
    if (qrExpirationTime && timeRemaining > 0) {
      interval = setInterval(() => {
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
      if (interval) clearInterval(interval);
    };
  }, [qrExpirationTime, timeRemaining]);

  // Polling do status
  useEffect(() => {
    let interval: number;
    
    if (instanceStatus === 'qr_ready') {
      interval = setInterval(() => {
        checkInstanceStatus();
      }, 5000);
    } else if (instanceStatus === 'connected') {
      interval = setInterval(() => {
        checkInstanceStatus();
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [instanceStatus]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    try {
      connectSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const generateUniqueName = (baseName: string) => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${baseName}${timestamp}${randomSuffix}`;
  };

  const handleConnect = async () => {
    if (!validateForm()) return;

    setIsCreatingInstance(true);
    setInstanceStatus('creating');
    setErrors({});

    try {
      const apiKey = 'd3050208ba862ee87302278ac4370cb9';
      const endpoints = [
        'https://api.aiensed.com/instance/create',
        'https://api.aiensed.com/instance/connect',
        'https://api.aiensed.com/instance/connect/'
      ];

      let success = false;
      let responseData: any = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Tentando endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': apiKey
            },
            body: JSON.stringify({
              instanceName: formData.instanceName,
              qrcode: true,
              integration: "WHATSAPP-BAILEYS"
            })
          });

          console.log(`📡 Resposta do ${endpoint}:`, response.status, response.statusText);

          if (response.ok) {
            responseData = await response.json();
            console.log('✅ Resposta completa:', responseData);
            success = true;
            break;
          } else if (response.status === 403) {
            const errorText = await response.text();
            console.log('❌ Erro 403:', errorText);
            
            if (errorText.includes('already in use')) {
              const newName = generateUniqueName(formData.instanceName);
              setFormData(prev => ({ ...prev, instanceName: newName }));
              toast.info(`Nome já em uso. Tentando com: ${newName}`);
              continue;
            }
          }
        } catch (error) {
          console.log(`❌ Erro no endpoint ${endpoint}:`, error);
          continue;
        }
      }

      if (success && responseData) {
        // Extrair dados da resposta
        let qrCodeData = '';
        let instanceIdData = '';

        if (responseData.qrcode) {
          qrCodeData = responseData.qrcode;
        } else if (responseData.data?.qrcode) {
          qrCodeData = responseData.data.qrcode;
        } else if (responseData.data?.qrcode?.base64) {
          qrCodeData = responseData.data.qrcode.base64;
        }

        if (responseData.instanceId) {
          instanceIdData = responseData.instanceId;
        } else if (responseData.data?.instance?.instanceId) {
          instanceIdData = responseData.data.instance.instanceId;
        } else if (responseData.data?.instanceId) {
          instanceIdData = responseData.data.instanceId;
        }

        if (qrCodeData) {
          setQrCode(qrCodeData);
          setInstanceId(instanceIdData);
          setInstanceStatus('qr_ready');
          setInstanceCreated(true);
          setQrExpirationTime(Date.now() + 60000);
          setTimeRemaining(60);
          setIsQrExpired(false);
          toast.success('QR Code gerado com sucesso!');
        } else {
          throw new Error('QR Code não encontrado na resposta');
        }
      } else {
        throw new Error('Falha ao criar instância em todos os endpoints');
      }
    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      setInstanceStatus('error');
      toast.error('Erro ao conectar WhatsApp. Tente novamente.');
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const checkInstanceStatus = async () => {
    if (!instanceId) return;

    try {
      const apiKey = 'd3050208ba862ee87302278ac4370cb9';
      
      // Tentar recriar a instância com qrcode: false para verificar status
      const response = await fetch('https://api.aiensed.com/instance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          instanceName: formData.instanceName,
          qrcode: false,
          integration: "WHATSAPP-BAILEYS"
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Se não retornou QR code, significa que está conectado
        if (!data.qrcode && !data.data?.qrcode) {
          if (instanceStatus !== 'connected') {
            setInstanceStatus('connected');
            setQrCode('');
            toast.success('WhatsApp conectado com sucesso!');
          }
        } else {
          // Se retornou QR code, está desconectado
          if (instanceStatus === 'connected') {
            setInstanceStatus('disconnected');
            toast.warning('WhatsApp foi desconectado');
          }
        }
      } else {
        // Se a API retornou erro (ex: 404), a instância foi deletada
        if (instanceStatus === 'connected') {
          setInstanceStatus('disconnected');
          toast.warning('WhatsApp foi desconectado');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      // Se não conseguiu conectar na API, considerar desconectado
      if (instanceStatus === 'connected') {
        setInstanceStatus('disconnected');
        toast.warning('WhatsApp foi desconectado');
      }
    }
  };

  const regenerateQrCode = async () => {
    if (!instanceId) return;

    try {
      const apiKey = 'd3050208ba862ee87302278ac4370cb9';
      
      const response = await fetch('https://api.aiensed.com/instance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          instanceName: formData.instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS"
        })
      });

      if (response.ok) {
        const data = await response.json();
        let qrCodeData = '';

        if (data.qrcode) {
          qrCodeData = data.qrcode;
        } else if (data.data?.qrcode) {
          qrCodeData = data.data.qrcode;
        } else if (data.data?.qrcode?.base64) {
          qrCodeData = data.data.qrcode.base64;
        }

        if (qrCodeData) {
          setQrCode(qrCodeData);
          setInstanceStatus('qr_ready');
          setQrExpirationTime(Date.now() + 60000);
          setTimeRemaining(60);
          setIsQrExpired(false);
          toast.success('Novo QR Code gerado!');
        }
      }
    } catch (error) {
      console.error('Erro ao regenerar QR Code:', error);
      toast.error('Erro ao gerar novo QR Code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 text-white p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Smartphone className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Conectar WhatsApp</h1>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="w-20"></div> {/* Espaçador para centralizar */}
        
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mb-4">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-4xl font-bold text-gray-800 mb-4">
                Conectar WhatsApp Business
              </CardTitle>
              <CardDescription className="text-xl text-gray-600">
                Crie uma instância e conecte seu WhatsApp para começar a coletar dados
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Formulário */}
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

                  {/* URL Preview */}
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

              {/* Botão principal */}
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
              <div className="mt-6 p-6 border rounded-xl bg-white/50">
                <div className="flex items-center gap-2 mb-4">
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

                {/* QR Code */}
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
                    
                    {/* Botão para gerar novo QR Code */}
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
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
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
                      
                      <h3 className="text-2xl font-bold text-green-600 mb-2">
                        ✅ WhatsApp Conectado!
                      </h3>
                      <p className="text-lg text-green-700 font-medium">
                        Conexão estabelecida com sucesso
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-600">
                        Sua instância está funcionando. Você pode fechar esta página.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500 mb-1">ID da Instância:</p>
                      <code className="text-xs bg-white px-2 py-1 rounded border font-mono">
                        {instanceId}
                      </code>
                    </div>
                  </div>
                )}

                {/* Status Desconectado */}
                {instanceStatus === 'disconnected' && (
                  <div className="text-center">
                    <div className="mb-4">
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
  );
}
