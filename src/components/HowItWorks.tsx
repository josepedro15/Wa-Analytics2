import { Card } from "@/components/ui/card";
import { ArrowRight, Download, BarChart3, Settings, Zap } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Download,
      number: "01",
      title: "Conecte seu WhatsApp",
      description: "Integração simples e segura com o WhatsApp Business para importar suas conversas automaticamente.",
      color: "text-chart-blue"
    },
    {
      icon: BarChart3,
      number: "02", 
      title: "Análise Inteligente",
      description: "Nossa IA processa todas as conversas identificando padrões, intenções e oportunidades de melhoria.",
      color: "text-chart-green"
    },
    {
      icon: Settings,
      number: "03",
      title: "Receba Insights",
      description: "Dashboard completo com métricas detalhadas, sugestões de automação e pontos de otimização.",
      color: "text-chart-orange"
    },
    {
      icon: Zap,
      number: "04",
      title: "Otimize e Converta",
      description: "Aplique as melhorias sugeridas e acompanhe o aumento da conversão em tempo real.",
      color: "text-chart-purple"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-accent/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como funciona em 4 passos simples
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Configure em minutos e comece a ver resultados no mesmo dia. 
            Sem complicações técnicas ou integrações complexas.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-6 text-center h-full hover:shadow-lg transition-shadow">
                  <div className="relative mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent ${step.color} mb-4`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                      {step.number}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </Card>

                {/* Arrow connector (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Pronto para transformar seus atendimentos em resultados?
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Começar Agora - É Grátis
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;