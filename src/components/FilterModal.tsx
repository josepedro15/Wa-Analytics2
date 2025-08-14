import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
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
          <div className="text-center text-muted-foreground">
            <p>Funcionalidade de filtro em desenvolvimento.</p>
            <p className="text-sm">Em breve você poderá filtrar os dados por período.</p>
          </div>

          {/* Botões */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
