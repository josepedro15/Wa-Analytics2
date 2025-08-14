import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Filter, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FilterModalProps {
  onFilterChange?: (selectedDate: Date | null) => void;
  trigger?: React.ReactNode;
  currentDate?: Date | null;
}

export function FilterModal({ onFilterChange, trigger, currentDate }: FilterModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentDate || new Date()
  );

  const handleApplyFilter = () => {
    if (selectedDate && onFilterChange) {
      onFilterChange(selectedDate);
    }
    setOpen(false);
  };

  const handleReset = () => {
    setSelectedDate(new Date());
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
          {/* Seleção de Data */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecionar Data do Relatório</label>
            <div className="p-3 border rounded-md bg-muted/50">
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedDate ? format(selectedDate, "EEEE", { locale: ptBR }) : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Presets rápidos */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Datas Rápidas</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setSelectedDate(yesterday);
                }}
              >
                Ontem
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const lastWeek = new Date();
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  setSelectedDate(lastWeek);
                }}
              >
                Há 7 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const lastMonth = new Date();
                  lastMonth.setDate(lastMonth.getDate() - 30);
                  setSelectedDate(lastMonth);
                }}
              >
                Há 30 dias
              </Button>
            </div>
          </div>

          {/* Status do filtro atual */}
          {currentDate && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary">Data Selecionada</p>
              <p className="text-xs text-muted-foreground">
                {format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
              <Button onClick={handleApplyFilter} disabled={!selectedDate}>
                Aplicar Filtro
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
