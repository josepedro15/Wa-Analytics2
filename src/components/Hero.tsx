import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transforme seus atendimentos do{" "}
            <span className="text-primary">WhatsApp</span> em{" "}
            <span className="text-primary">insights poderosos</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Analise conversas, identifique oportunidades e otimize suas vendas com 
            inteligência artificial. Aumente sua conversão em até 40%.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <a href="/auth">Começar Análise Grátis</a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Ver Demo ao Vivo
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">+40%</div>
            <div className="text-sm text-muted-foreground">Conversão</div>
          </Card>
          <Card className="p-6 text-center">
            <Zap className="h-8 w-8 text-chart-orange mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">-60%</div>
            <div className="text-sm text-muted-foreground">Tempo de Resposta</div>
          </Card>
          <Card className="p-6 text-center">
            <Users className="h-8 w-8 text-chart-blue mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">+25%</div>
            <div className="text-sm text-muted-foreground">Satisfação</div>
          </Card>
          <Card className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-chart-purple mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">10x</div>
            <div className="text-sm text-muted-foreground">Insights</div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Hero;