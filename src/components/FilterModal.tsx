import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FilterModalProps {
  onFilterChange?: (dateRange: { from: Date; to: Date }) => void;
  trigger?: React.ReactNode;
}

export function FilterModal({ onFilterChange, trigger }: FilterModalProps) {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primeiro dia do mês atual
    to: new Date(), // Hoje
  });

  const handleApplyFilter = () => {
    if (dateRange.from && dateRange.to && onFilterChange) {
      onFilterChange({
        from: dateRange.from,
        to: dateRange.to,
      });
    }
    setOpen(false);
  };

  const handleReset = () => {
    setDateRange({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Filtrar por Período</DialogTitle>
          <DialogDescription>
            Selecione o período para filtrar os dados do dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Período */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
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

          {/* Presets rápidos */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Períodos Rápidos</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange({
                  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                  to: new Date(),
                })}
              >
                Este Mês
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange({
                  from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                  to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
                })}
              >
                Mês Passado
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange({
                  from: new Date(new Date().getFullYear(), 0, 1),
                  to: new Date(),
                })}
              >
                Este Ano
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange({
                  from: new Date(new Date().setDate(new Date().getDate() - 7)),
                  to: new Date(),
                })}
              >
                Últimos 7 dias
              </Button>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              Resetar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleApplyFilter} disabled={!dateRange.from || !dateRange.to}>
                Aplicar Filtro
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
