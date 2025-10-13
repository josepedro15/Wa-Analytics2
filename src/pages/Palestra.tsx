import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePalestraLead } from '@/hooks/usePalestraLead';
import { Sparkles, User, Mail, Phone, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const leadSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email muito curto'),
  telefone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone muito longo')
    .regex(/^[0-9+\s()-]+$/, 'Apenas números, +, espaços, () e -')
});

type LeadFormData = z.infer<typeof leadSchema>;

export default function Palestra() {
  const navigate = useNavigate();
  const { createLead, isCreating, setLeadId } = usePalestraLead();
  
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    email: '',
    telefone: ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LeadFormData, boolean>>>({});

  const validateForm = (): boolean => {
    try {
      leadSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof LeadFormData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LeadFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof LeadFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos os campos como touched
    setTouched({
      nome: true,
      email: true,
      telefone: true
    });

    if (!validateForm()) {
      return;
    }

    createLead(formData, {
      onSuccess: (leadId) => {
        // Salvar dados no sessionStorage para usar na próxima página
        sessionStorage.setItem('palestraLeadData', JSON.stringify({
          ...formData,
          leadId
        }));
        
        // Redirecionar para página de gatilhos
        navigate('/palestra/gatilhos');
      }
    });
  };

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Formata (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

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
                Transforme seus atendimentos em resultados
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Coluna Esquerda - Informações */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Palestra Exclusiva
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Descubra Como
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  IA Pode Revolucionar
                </span>
                Seus Atendimentos
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Aprenda a transformar conversas do WhatsApp em insights poderosos 
                e automações que aumentam suas vendas.
              </p>
            </div>

            {/* Benefícios */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                O que você vai descobrir:
              </h3>
              
              <div className="space-y-3">
                {[
                  'Como analisar milhares de conversas em segundos',
                  'Identificar padrões de comportamento dos clientes',
                  'Automatizar respostas e aumentar conversões',
                  'Métricas que realmente importam para o seu negócio'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-foreground leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Direita - Formulário */}
          <div>
            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardHeader className="space-y-3 pb-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">
                  Garanta Sua Vaga
                </CardTitle>
                <CardDescription className="text-center text-base">
                  Preencha os dados abaixo para acessar conteúdo exclusivo
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-base font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Nome Completo
                    </Label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      onBlur={() => handleBlur('nome')}
                      className={`h-12 text-base ${
                        touched.nome && errors.nome 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-border'
                      }`}
                      disabled={isCreating}
                    />
                    {touched.nome && errors.nome && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.nome}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
                      onBlur={() => handleBlur('email')}
                      className={`h-12 text-base ${
                        touched.email && errors.email 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-border'
                      }`}
                      disabled={isCreating}
                    />
                    {touched.email && errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-base font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      WhatsApp
                    </Label>
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        handleInputChange('telefone', formatted);
                      }}
                      onBlur={() => handleBlur('telefone')}
                      className={`h-12 text-base ${
                        touched.telefone && errors.telefone 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-border'
                      }`}
                      disabled={isCreating}
                      maxLength={15}
                    />
                    {touched.telefone && errors.telefone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.telefone}
                      </p>
                    )}
                  </div>

                  {/* Botão de Envio */}
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isCreating ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span>Continuar</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>

                  {/* Política de Privacidade */}
                  <p className="text-xs text-center text-muted-foreground">
                    Ao continuar, você concorda com nossa{' '}
                    <a href="/privacy-policy" className="text-blue-600 hover:underline">
                      Política de Privacidade
                    </a>{' '}
                    e{' '}
                    <a href="/terms-of-service" className="text-blue-600 hover:underline">
                      Termos de Uso
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

