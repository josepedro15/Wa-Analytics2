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
    try {
      // Criar conteúdo HTML para PDF com design moderno
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório WhatsApp Analytics</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6;
              color: #1f2937;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              min-height: 100vh;
            }
            
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 40px 20px;
              background: white;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
              border-radius: 16px;
              margin-top: 20px;
              margin-bottom: 20px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 30px;
              border-bottom: 3px solid #25D366;
              background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
              color: white;
              padding: 30px;
              border-radius: 12px;
              margin: -40px -20px 40px -20px;
            }
            
            .header h1 {
              font-size: 2.5rem;
              font-weight: 700;
              margin-bottom: 10px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .header .subtitle {
              font-size: 1.1rem;
              opacity: 0.9;
              font-weight: 400;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 40px;
              background: #f8fafc;
              padding: 20px;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
            }
            
            .info-item {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .info-item strong {
              color: #25D366;
              font-weight: 600;
            }
            
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            
            .section-title {
              font-size: 1.5rem;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #25D366;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .metric-card {
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              transition: transform 0.2s ease;
            }
            
            .metric-card:hover {
              transform: translateY(-2px);
            }
            
            .metric-title {
              font-size: 0.875rem;
              font-weight: 500;
              color: #6b7280;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .metric-value {
              font-size: 2rem;
              font-weight: 700;
              color: #25D366;
              margin-bottom: 5px;
            }
            
            .metric-description {
              font-size: 0.875rem;
              color: #9ca3af;
            }
            
            .table-container {
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              border: 1px solid #e2e8f0;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.875rem;
            }
            
            th {
              background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
              color: white;
              font-weight: 600;
              padding: 15px 20px;
              text-align: left;
              font-size: 0.875rem;
            }
            
            td {
              padding: 15px 20px;
              border-bottom: 1px solid #e2e8f0;
              font-weight: 500;
            }
            
            tr:nth-child(even) {
              background: #f8fafc;
            }
            
            tr:hover {
              background: #f1f5f9;
            }
            
            .insights-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
            }
            
            .insight-card {
              background: white;
              border-radius: 12px;
              padding: 20px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              border: 1px solid #e2e8f0;
              border-left: 4px solid #25D366;
            }
            
            .insight-card.positive {
              border-left-color: #10b981;
              background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            }
            
            .insight-card.negative {
              border-left-color: #ef4444;
              background: linear-gradient(135deg, #fef2f2 0%, #fef2f2 100%);
            }
            
            .insight-title {
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .insight-content {
              color: #6b7280;
              font-size: 0.875rem;
              line-height: 1.5;
            }
            
            .highlights-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
            }
            
            .highlight-card {
              background: white;
              border-radius: 12px;
              padding: 20px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              border: 1px solid #e2e8f0;
            }
            
            .highlight-card.best {
              border-left: 4px solid #10b981;
              background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            }
            
            .highlight-card.critical {
              border-left: 4px solid #ef4444;
              background: linear-gradient(135deg, #fef2f2 0%, #fef2f2 100%);
            }
            
            .highlight-header {
              display: flex;
              justify-content: between;
              align-items: center;
              margin-bottom: 15px;
            }
            
            .highlight-title {
              font-weight: 600;
              color: #1f2937;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .highlight-badge {
              background: #25D366;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 0.75rem;
              font-weight: 600;
            }
            
            .highlight-badge.critical {
              background: #ef4444;
            }
            
            .highlight-info {
              margin-bottom: 10px;
            }
            
            .highlight-info strong {
              color: #25D366;
              font-weight: 600;
            }
            
            .highlight-description {
              color: #6b7280;
              font-size: 0.875rem;
              line-height: 1.5;
            }
            
            .progress-bar {
              width: 100%;
              height: 8px;
              background: #e2e8f0;
              border-radius: 4px;
              overflow: hidden;
              margin: 10px 0;
            }
            
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #25D366 0%, #128C7E 100%);
              border-radius: 4px;
              transition: width 0.3s ease;
            }
            
            .footer {
              margin-top: 60px;
              padding-top: 30px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #6b7280;
              font-size: 0.875rem;
            }
            
            .footer-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 20px;
            }
            
                         .footer-logo {
               font-weight: 600;
               color: #25D366;
             }
             
             .status-badge {
               padding: 4px 12px;
               border-radius: 20px;
               font-size: 0.75rem;
               font-weight: 600;
               text-transform: uppercase;
               letter-spacing: 0.05em;
             }
             
             .status-badge.positive {
               background: #10b981;
               color: white;
             }
             
             .status-badge.negative {
               background: #ef4444;
               color: white;
             }
             
             .status-badge.neutral {
               background: #6b7280;
               color: white;
             }
            
            @media print {
              body {
                background: white;
              }
              .container {
                box-shadow: none;
                margin: 0;
                padding: 20px;
              }
              .header {
                margin: 0 0 30px 0;
                border-radius: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Relatório WhatsApp Analytics</h1>
              <div class="subtitle">Análise completa dos atendimentos e performance</div>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <strong>📅 Período:</strong> ${options.dateRange?.start || data.periodo_inicio} a ${options.dateRange?.end || data.periodo_fim}
              </div>
              <div class="info-item">
                <strong>🕒 Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}
              </div>
            </div>
      `;

      if (options.includeMetrics) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">📈 Métricas Principais</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-title">Total de Atendimentos</div>
                <div class="metric-value">${data.total_atendimentos?.toLocaleString() || 0}</div>
                <div class="metric-description">Conversas realizadas no período</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Taxa de Conversão</div>
                <div class="metric-value">${data.taxa_conversao?.toFixed(1) || 0}%</div>
                <div class="metric-description">Percentual de vendas realizadas</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Tempo Médio de Resposta</div>
                <div class="metric-value">${Math.floor((data.tempo_medio_resposta || 0) / 60)}m ${(data.tempo_medio_resposta || 0) % 60}s</div>
                <div class="metric-description">Velocidade média de resposta</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Nota Média de Qualidade</div>
                <div class="metric-value">${data.nota_media_qualidade?.toFixed(1) || 0}/5</div>
                <div class="metric-description">Satisfação média dos clientes</div>
              </div>
            </div>
          </div>
        `;
      }

      if (options.includeIntentions) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">🎯 Intenções dos Clientes</h2>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Intenção</th>
                    <th>Percentual</th>
                    <th>Progresso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🛒 Compra</td>
                    <td>${data.intencao_compra?.toFixed(1) || 0}%</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.intencao_compra || 0}%"></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>❓ Dúvida Geral</td>
                    <td>${data.intencao_duvida_geral?.toFixed(1) || 0}%</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.intencao_duvida_geral || 0}%"></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>⚠️ Reclamação</td>
                    <td>${data.intencao_reclamacao?.toFixed(1) || 0}%</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.intencao_reclamacao || 0}%"></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>🛠️ Suporte</td>
                    <td>${data.intencao_suporte?.toFixed(1) || 0}%</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.intencao_suporte || 0}%"></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>💰 Orçamento</td>
                    <td>${data.intencao_orcamento?.toFixed(1) || 0}%</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.intencao_orcamento || 0}%"></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      if (options.includeInsights && (data.insights_funcionou?.length || data.insights_atrapalhou?.length)) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">💡 Insights de Performance</h2>
            <div class="insights-grid">
        `;
        
        if (data.insights_funcionou?.length) {
          htmlContent += `
            <div class="insight-card positive">
              <div class="insight-title">✅ O que Funcionou</div>
          `;
          data.insights_funcionou.forEach(insight => {
            const [title, description] = insight.split(': ');
            htmlContent += `
              <div class="insight-content">
                <strong>${title}:</strong> ${description}
              </div>
            `;
          });
          htmlContent += `</div>`;
        }
        
        if (data.insights_atrapalhou?.length) {
          htmlContent += `
            <div class="insight-card negative">
              <div class="insight-title">❌ O que Atrapalhou</div>
          `;
          data.insights_atrapalhou.forEach(insight => {
            const [title, description] = insight.split(': ');
            htmlContent += `
              <div class="insight-content">
                <strong>${title}:</strong> ${description}
              </div>
            `;
          });
          htmlContent += `</div>`;
        }
        
        htmlContent += `
            </div>
          </div>
        `;
      }

      if (options.includeHighlights) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">🏆 Destaques do Período</h2>
            <div class="highlights-grid">
        `;
        
        if (data.melhor_atendimento_cliente) {
          htmlContent += `
            <div class="highlight-card best">
              <div class="highlight-header">
                <div class="highlight-title">⭐ Melhor Atendimento</div>
                <div class="highlight-badge">${data.melhor_atendimento_nota?.toFixed(1) || 0}/5</div>
              </div>
              <div class="highlight-info">
                <strong>Cliente:</strong> ${data.melhor_atendimento_cliente}
              </div>
              <div class="highlight-description">
                ${data.melhor_atendimento_observacao || ''}
              </div>
            </div>
          `;
        }
        
        if (data.atendimento_critico_cliente) {
          htmlContent += `
            <div class="highlight-card critical">
              <div class="highlight-header">
                <div class="highlight-title">⚠️ Atendimento Crítico</div>
                <div class="highlight-badge critical">${data.atendimento_critico_nota?.toFixed(1) || 0}/5</div>
              </div>
              <div class="highlight-info">
                <strong>Cliente:</strong> ${data.atendimento_critico_cliente}
              </div>
              <div class="highlight-description">
                ${data.atendimento_critico_observacao || ''}
              </div>
            </div>
          `;
        }
        
        if (!data.melhor_atendimento_cliente && !data.atendimento_critico_cliente) {
          htmlContent += `
            <div class="highlight-card">
              <div class="highlight-title">📊 Nenhum destaque registrado</div>
              <div class="highlight-description">
                Os destaques aparecerão conforme os dados forem analisados e registrados.
              </div>
            </div>
          `;
        }
        
        htmlContent += `
            </div>
          </div>
        `;
      }

      if (options.includeAutomation && data.automacao_sugerida?.length) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">🤖 Automação Sugerida</h2>
            <div class="insights-grid">
        `;
        data.automacao_sugerida.forEach(automacao => {
          const [title, description] = automacao.split(': ');
          htmlContent += `
            <div class="insight-card">
              <div class="insight-title">⚡ ${title}</div>
              <div class="insight-content">${description}</div>
            </div>
          `;
        });
        htmlContent += `
            </div>
          </div>
        `;
      }

      if (options.includeActions && data.proximas_acoes?.length) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">📋 Próximas Ações</h2>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ação</th>
                    <th>Status</th>
                    <th>Prazo</th>
                  </tr>
                </thead>
                <tbody>
        `;
        data.proximas_acoes.forEach(acao => {
          const match = acao.match(/^(.*?)\s*–\s*(.*?)\s*\((\d{4}-\d{2}-\d{2})\)$/);
          if (match) {
            const [, title, status, deadline] = match;
            const statusClass = status === 'Feito' ? 'positive' : status === 'Em andamento' ? 'neutral' : 'negative';
            htmlContent += `
              <tr>
                <td>${title}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>${deadline}</td>
              </tr>
            `;
          } else {
            htmlContent += `
              <tr>
                <td>${acao}</td>
                <td><span class="status-badge neutral">Pendente</span></td>
                <td>-</td>
              </tr>
            `;
          }
        });
        htmlContent += `
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      if (options.includeGoals) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">🎯 Metas e Progresso</h2>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Meta</th>
                    <th>Progresso Atual</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>📈 Taxa de Conversão</td>
                    <td>${data.meta_taxa_conversao || 'Não definida'}</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((data.taxa_conversao || 0) / 30) * 100}%"></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>⏱️ Tempo de Resposta</td>
                    <td>${data.meta_tempo_resposta || 'Não definida'}</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.max(0, 100 - ((data.tempo_medio_resposta || 0) / 120) * 100)}%"></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>⭐ Nota de Qualidade</td>
                    <td>${data.meta_nota_qualidade || 'Não definida'}</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((data.nota_media_qualidade || 0) / 4.5) * 100}%"></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      htmlContent += `
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <div class="footer-logo">MetricaWhats Analytics</div>
              <div>
                <p>Relatório gerado automaticamente</p>
                <p>© 2024 MetricaWhats - Todos os direitos reservados</p>
              </div>
            </div>
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
