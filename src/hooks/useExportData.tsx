import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DashboardData } from './useDashboardData';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  includeMetrics?: boolean;
  includeIntentions?: boolean;
  includeInsights?: boolean;
  includeHighlights?: boolean;
  includeAutomation?: boolean;
  includeActions?: boolean;
  includeGoals?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = async (data: DashboardData, options: ExportOptions) => {
    const csvData: string[][] = [];
    
    // Header
    csvData.push(['Relatório WhatsApp Analytics']);
    csvData.push(['Período:', `${options.dateRange?.start || data.periodo_inicio} a ${options.dateRange?.end || data.periodo_fim}`]);
    csvData.push(['Gerado em:', new Date().toLocaleString('pt-BR')]);
    csvData.push([]);

    if (options.includeMetrics) {
      csvData.push(['MÉTRICAS PRINCIPAIS']);
      csvData.push(['Métrica', 'Valor', 'Unidade']);
      csvData.push(['Total de Atendimentos', data.total_atendimentos?.toString() || '0', 'atendimentos']);
      csvData.push(['Taxa de Conversão', `${data.taxa_conversao?.toFixed(1) || 0}%`, 'percentual']);
      csvData.push(['Tempo Médio de Resposta', `${Math.floor((data.tempo_medio_resposta || 0) / 60)}m ${(data.tempo_medio_resposta || 0) % 60}s`, 'tempo']);
      csvData.push(['Nota Média de Qualidade', `${data.nota_media_qualidade?.toFixed(1) || 0}/5`, 'pontos']);
      csvData.push([]);
    }

    if (options.includeIntentions) {
      csvData.push(['INTENÇÕES DOS CLIENTES']);
      csvData.push(['Intenção', 'Percentual']);
      csvData.push(['Compra', `${data.intencao_compra?.toFixed(1) || 0}%`]);
      csvData.push(['Dúvida Geral', `${data.intencao_duvida_geral?.toFixed(1) || 0}%`]);
      csvData.push(['Reclamação', `${data.intencao_reclamacao?.toFixed(1) || 0}%`]);
      csvData.push(['Suporte', `${data.intencao_suporte?.toFixed(1) || 0}%`]);
      csvData.push(['Orçamento', `${data.intencao_orcamento?.toFixed(1) || 0}%`]);
      csvData.push([]);
    }

    if (options.includeInsights && data.insights_funcionou?.length) {
      csvData.push(['INSIGHTS - O QUE FUNCIONOU']);
      data.insights_funcionou.forEach(insight => {
        csvData.push([insight]);
      });
      csvData.push([]);
    }

    if (options.includeInsights && data.insights_atrapalhou?.length) {
      csvData.push(['INSIGHTS - O QUE ATRAPALHOU']);
      data.insights_atrapalhou.forEach(insight => {
        csvData.push([insight]);
      });
      csvData.push([]);
    }

    if (options.includeHighlights) {
      csvData.push(['DESTAQUES DO PERÍODO']);
      if (data.melhor_atendimento_cliente) {
        csvData.push(['Melhor Atendimento']);
        csvData.push(['Cliente', data.melhor_atendimento_cliente]);
        csvData.push(['Nota', `${data.melhor_atendimento_nota?.toFixed(1) || 0}/5`]);
        csvData.push(['Observação', data.melhor_atendimento_observacao || '']);
        csvData.push([]);
      }
      if (data.atendimento_critico_cliente) {
        csvData.push(['Atendimento Crítico']);
        csvData.push(['Cliente', data.atendimento_critico_cliente]);
        csvData.push(['Nota', `${data.atendimento_critico_nota?.toFixed(1) || 0}/5`]);
        csvData.push(['Observação', data.atendimento_critico_observacao || '']);
        csvData.push([]);
      }
    }

    if (options.includeAutomation && data.automacao_sugerida?.length) {
      csvData.push(['AUTOMAÇÃO SUGERIDA']);
      data.automacao_sugerida.forEach(automacao => {
        csvData.push([automacao]);
      });
      csvData.push([]);
    }

    if (options.includeActions && data.proximas_acoes?.length) {
      csvData.push(['PRÓXIMAS AÇÕES']);
      data.proximas_acoes.forEach(acao => {
        csvData.push([acao]);
      });
      csvData.push([]);
    }

    if (options.includeGoals) {
      csvData.push(['METAS E PROGRESSO']);
      csvData.push(['Meta', 'Progresso']);
      csvData.push(['Taxa de Conversão', data.meta_taxa_conversao || '']);
      csvData.push(['Tempo de Resposta', data.meta_tempo_resposta || '']);
      csvData.push(['Nota de Qualidade', data.meta_nota_qualidade || '']);
    }

    // Converter para CSV
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell?.replace(/"/g, '""') || ''}"`).join(',')
    ).join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `whatsapp-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = async (data: DashboardData, options: ExportOptions) => {
    // Para Excel, vamos usar uma biblioteca externa
    // Por enquanto, vamos simular com CSV
    toast({
      title: "Exportação Excel",
      description: "Funcionalidade em desenvolvimento. Exportando como CSV...",
    });
    await exportToCSV(data, options);
  };

  const exportToPDF = async (data: DashboardData, options: ExportOptions) => {
    // Para PDF, vamos usar uma abordagem mais simples
    try {
      // Criar conteúdo HTML para PDF
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório WhatsApp Analytics</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #25D366; text-align: center; }
            h2 { color: #333; border-bottom: 2px solid #25D366; padding-bottom: 5px; }
            .metric { margin: 10px 0; }
            .metric strong { color: #25D366; }
            .insight { background: #f5f5f5; padding: 10px; margin: 5px 0; border-left: 4px solid #25D366; }
            .highlight { background: #e8f5e8; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .critical { background: #ffe8e8; padding: 15px; margin: 10px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #25D366; color: white; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>📊 Relatório WhatsApp Analytics</h1>
          <p><strong>Período:</strong> ${options.dateRange?.start || data.periodo_inicio} a ${options.dateRange?.end || data.periodo_fim}</p>
          <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      `;

      if (options.includeMetrics) {
        htmlContent += `
          <h2>📈 Métricas Principais</h2>
          <div class="metric"><strong>Total de Atendimentos:</strong> ${data.total_atendimentos?.toLocaleString() || 0}</div>
          <div class="metric"><strong>Taxa de Conversão:</strong> ${data.taxa_conversao?.toFixed(1) || 0}%</div>
          <div class="metric"><strong>Tempo Médio de Resposta:</strong> ${Math.floor((data.tempo_medio_resposta || 0) / 60)}m ${(data.tempo_medio_resposta || 0) % 60}s</div>
          <div class="metric"><strong>Nota Média de Qualidade:</strong> ${data.nota_media_qualidade?.toFixed(1) || 0}/5</div>
        `;
      }

      if (options.includeIntentions) {
        htmlContent += `
          <h2>🎯 Intenções dos Clientes</h2>
          <table>
            <tr><th>Intenção</th><th>Percentual</th></tr>
            <tr><td>Compra</td><td>${data.intencao_compra?.toFixed(1) || 0}%</td></tr>
            <tr><td>Dúvida Geral</td><td>${data.intencao_duvida_geral?.toFixed(1) || 0}%</td></tr>
            <tr><td>Reclamação</td><td>${data.intencao_reclamacao?.toFixed(1) || 0}%</td></tr>
            <tr><td>Suporte</td><td>${data.intencao_suporte?.toFixed(1) || 0}%</td></tr>
            <tr><td>Orçamento</td><td>${data.intencao_orcamento?.toFixed(1) || 0}%</td></tr>
          </table>
        `;
      }

      if (options.includeInsights && data.insights_funcionou?.length) {
        htmlContent += `
          <h2>✅ O que Funcionou</h2>
        `;
        data.insights_funcionou.forEach(insight => {
          htmlContent += `<div class="insight">${insight}</div>`;
        });
      }

      if (options.includeInsights && data.insights_atrapalhou?.length) {
        htmlContent += `
          <h2>❌ O que Atrapalhou</h2>
        `;
        data.insights_atrapalhou.forEach(insight => {
          htmlContent += `<div class="insight">${insight}</div>`;
        });
      }

      if (options.includeHighlights) {
        htmlContent += `<h2>🏆 Destaques do Período</h2>`;
        if (data.melhor_atendimento_cliente) {
          htmlContent += `
            <div class="highlight">
              <h3>Melhor Atendimento</h3>
              <p><strong>Cliente:</strong> ${data.melhor_atendimento_cliente}</p>
              <p><strong>Nota:</strong> ${data.melhor_atendimento_nota?.toFixed(1) || 0}/5</p>
              <p><strong>Observação:</strong> ${data.melhor_atendimento_observacao || ''}</p>
            </div>
          `;
        }
        if (data.atendimento_critico_cliente) {
          htmlContent += `
            <div class="critical">
              <h3>Atendimento Crítico</h3>
              <p><strong>Cliente:</strong> ${data.atendimento_critico_cliente}</p>
              <p><strong>Nota:</strong> ${data.atendimento_critico_nota?.toFixed(1) || 0}/5</p>
              <p><strong>Observação:</strong> ${data.atendimento_critico_observacao || ''}</p>
            </div>
          `;
        }
      }

      if (options.includeAutomation && data.automacao_sugerida?.length) {
        htmlContent += `
          <h2>🤖 Automação Sugerida</h2>
        `;
        data.automacao_sugerida.forEach(automacao => {
          htmlContent += `<div class="insight">${automacao}</div>`;
        });
      }

      if (options.includeActions && data.proximas_acoes?.length) {
        htmlContent += `
          <h2>📋 Próximas Ações</h2>
        `;
        data.proximas_acoes.forEach(acao => {
          htmlContent += `<div class="insight">${acao}</div>`;
        });
      }

      if (options.includeGoals) {
        htmlContent += `
          <h2>🎯 Metas e Progresso</h2>
          <table>
            <tr><th>Meta</th><th>Progresso</th></tr>
            <tr><td>Taxa de Conversão</td><td>${data.meta_taxa_conversao || ''}</td></tr>
            <tr><td>Tempo de Resposta</td><td>${data.meta_tempo_resposta || ''}</td></tr>
            <tr><td>Nota de Qualidade</td><td>${data.meta_nota_qualidade || ''}</td></tr>
          </table>
        `;
      }

      htmlContent += `
          <div class="footer">
            <p>Relatório gerado automaticamente pelo WhatsApp Analytics</p>
            <p>© 2024 MetricaWhats - Todos os direitos reservados</p>
          </div>
        </body>
        </html>
      `;

      // Criar blob e download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `whatsapp-analytics-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Exportado",
        description: "O relatório foi exportado como HTML. Você pode abrir no navegador e imprimir como PDF.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const exportData = async (data: DashboardData, options: ExportOptions) => {
    setIsExporting(true);
    
    try {
      switch (options.format) {
        case 'csv':
          await exportToCSV(data, options);
          break;
        case 'excel':
          await exportToExcel(data, options);
          break;
        case 'pdf':
          await exportToPDF(data, options);
          break;
        default:
          throw new Error('Formato não suportado');
      }

      toast({
        title: "Exportação concluída!",
        description: `Relatório exportado em ${options.format.toUpperCase()} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting
  };
}
