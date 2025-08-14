import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useExportData, ExportFormat } from '@/hooks/useExportData';
import { DashboardData } from '@/hooks/useDashboardData';

interface ExportModalProps {
  data: DashboardData | null;
  trigger?: React.ReactNode;
}

export function ExportModal({ data, trigger }: ExportModalProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: data ? new Date(data.periodo_inicio) : undefined,
    to: data ? new Date(data.periodo_fim) : undefined,
  });
  
  const [options, setOptions] = useState({
    includeMetrics: true,
    includeIntentions: true,
    includeInsights: true,
    includeHighlights: true,
    includeAutomation: true,
    includeActions: true,
    includeGoals: true,
  });

  const { exportData, isExporting } = useExportData();

  const handleExport = async () => {
    if (!data) return;

    await exportData(data, {
      format,
      dateRange: {
        start: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : data.periodo_inicio,
        end: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : data.periodo_fim,
      },
      ...options,
    });

    setOpen(false);
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: FileText },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
    { value: 'pdf', label: 'PDF', icon: File },
  ];

  const getFormatIcon = (formatValue: ExportFormat) => {
    const option = formatOptions.find(opt => opt.value === formatValue);
    return option ? <option.icon className="h-4 w-4" /> : null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar Relatório</DialogTitle>
          <DialogDescription>
            Configure as opções de exportação do seu relatório de analytics.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formato */}
          <div className="space-y-2">
            <Label>Formato de Exportação</Label>
            <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label>Período do Relatório</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "dd/MM/yyyy", { locale: ptBR }) : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "dd/MM/yyyy", { locale: ptBR }) : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Seções a incluir */}
          <div className="space-y-3">
            <Label>Seções a Incluir</Label>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metrics"
                  checked={options.includeMetrics}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeMetrics: checked as boolean }))
                  }
                />
                <Label htmlFor="metrics" className="text-sm font-normal">
                  Métricas Principais
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="intentions"
                  checked={options.includeIntentions}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeIntentions: checked as boolean }))
                  }
                />
                <Label htmlFor="intentions" className="text-sm font-normal">
                  Intenções dos Clientes
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insights"
                  checked={options.includeInsights}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeInsights: checked as boolean }))
                  }
                />
                <Label htmlFor="insights" className="text-sm font-normal">
                  Insights de Performance
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="highlights"
                  checked={options.includeHighlights}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeHighlights: checked as boolean }))
                  }
                />
                <Label htmlFor="highlights" className="text-sm font-normal">
                  Destaques do Período
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="automation"
                  checked={options.includeAutomation}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeAutomation: checked as boolean }))
                  }
                />
                <Label htmlFor="automation" className="text-sm font-normal">
                  Automação Sugerida
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="actions"
                  checked={options.includeActions}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeActions: checked as boolean }))
                  }
                />
                <Label htmlFor="actions" className="text-sm font-normal">
                  Próximas Ações
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goals"
                  checked={options.includeGoals}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeGoals: checked as boolean }))
                  }
                />
                <Label htmlFor="goals" className="text-sm font-normal">
                  Metas e Progresso
                </Label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || !data}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exportando...
                </>
              ) : (
                <>
                  {getFormatIcon(format)}
                  <span className="ml-2">Exportar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
