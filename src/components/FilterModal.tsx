import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Filter, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FilterModalProps {
  onFilterChange?: (dateRange: { from: Date; to: Date } | null) => void;
  trigger?: React.ReactNode;
  currentFilter?: { from: Date; to: Date } | null;
}

export function FilterModal({ onFilterChange, trigger, currentFilter }: FilterModalProps) {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: currentFilter?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: currentFilter?.to || new Date(),
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
    if (onFilterChange) {
      onFilterChange(null); // Remove o filtro
    }
  };

  const handleClearFilter = () => {
    if (onFilterChange) {
      onFilterChange(null); // Remove o filtro
    }
    setOpen(false);
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
            <label className="text-sm font-medium">Filtrar por Data de Criação</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Data Inicial</label>
                <div className="mt-1 p-2 border rounded-md bg-muted/50">
                  {dateRange.from ? format(dateRange.from, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Data Final</label>
                <div className="mt-1 p-2 border rounded-md bg-muted/50">
                  {dateRange.to ? format(dateRange.to, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                </div>
              </div>
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

          {/* Status do filtro atual */}
          {currentFilter && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary">Filtro Ativo</p>
              <p className="text-xs text-muted-foreground">
                {format(currentFilter.from, "dd/MM/yyyy", { locale: ptBR })} a {format(currentFilter.to, "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClearFilter}>
              Limpar Filtro
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
