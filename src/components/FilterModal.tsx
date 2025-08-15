import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Filter, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';

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
          {/* Seleção de Data com Calendário */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecionar Data do Relatório</label>
            <div className="p-3 border rounded-md bg-muted/50">
              <div className="text-center mb-3">
                <div className="text-lg font-semibold">
                  {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedDate ? format(selectedDate, "EEEE", { locale: ptBR }) : ""}
                </div>
              </div>
              
              {/* Calendário */}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date)}
                className="rounded-md border-0"
                locale={ptBR}
                showOutsideDays={true}
                classNames={{
                  months: "flex flex-col space-y-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border rounded"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded"
                  ),
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_hidden: "invisible",
                }}
              />
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
