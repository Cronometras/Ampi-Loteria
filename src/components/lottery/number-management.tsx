import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Trophy, Calendar, Upload, Download, X, Loader2 } from 'lucide-react';
import type { LotteryNumber } from '@/lib/types';
import { addNumber, getNumbers, updateNumber, deleteNumber } from '@/lib/firestore';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { AddNumberDialog } from './add-number-dialog';
import { EditNumberDialog } from './edit-number-dialog';

interface NumberManagementProps {
  lotteryId: string;
  onNumberCountChange?: (count: number) => void;
}

export function NumberManagement({ lotteryId, onNumberCountChange }: NumberManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [numbers, setNumbers] = useState<LotteryNumber[]>([]);
  const [filteredNumbers, setFilteredNumbers] = useState<LotteryNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadNumbers = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const lotteryNumbers = await getNumbers(user.uid, lotteryId);
      setNumbers(lotteryNumbers);
      setFilteredNumbers(lotteryNumbers);
      onNumberCountChange?.(lotteryNumbers.length);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los números.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNumbers();
  }, [user, lotteryId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNumbers(numbers);
    } else {
      const filtered = numbers.filter(number =>
        number.number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNumbers(filtered);
    }
  }, [searchTerm, numbers]);

  const handleAddNumber = async (numberData: Omit<LotteryNumber, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      await addNumber(user.uid, lotteryId, numberData);
      await loadNumbers();
      toast({
        title: 'Éxito',
        description: 'Número agregado correctamente.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo agregar el número.',
      });
    }
  };

  const handleUpdateNumber = async (numberId: string, updates: Partial<LotteryNumber>) => {
    if (!user) return;
    
    try {
      await updateNumber(user.uid, lotteryId, numberId, updates);
      await loadNumbers();
      toast({
        title: 'Éxito',
        description: 'Número actualizado correctamente.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el número.',
      });
    }
  };

  const handleDeleteNumber = async (numberId: string) => {
    if (!user) return;
    
    try {
      await deleteNumber(user.uid, lotteryId, numberId);
      await loadNumbers();
      toast({
        title: 'Éxito',
        description: 'Número eliminado correctamente.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el número.',
      });
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const number = line.trim();
        if (number) {
          await addNumber(user.uid, lotteryId, {
            number: number,
            isWinner: false,
            drawnAt: null
          });
        }
      }

      await loadNumbers();
      toast({
        title: 'Éxito',
        description: `Se importaron ${lines.length} números correctamente.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo importar el archivo CSV.',
      });
    } finally {
      setIsImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleExportCSV = () => {
    if (numbers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No hay números para exportar.',
      });
      return;
    }

    const csvContent = numbers.map(num => num.number).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `numeros_${lotteryId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Éxito',
      description: 'Números exportados correctamente.',
    });
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const winnerNumbers = numbers.filter(num => num.isWinner);
  const totalNumbers = numbers.length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Números</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNumbers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Números Ganadores</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winnerNumbers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Números Restantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNumbers - winnerNumbers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar números..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <Button variant="outline" size="sm" disabled={isImporting}>
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isImporting ? 'Importando...' : 'Importar CSV'}
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <AddNumberDialog onNumberAdded={handleAddNumber}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Número
            </Button>
          </AddNumberDialog>
        </div>
      </div>

      {/* Numbers List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNumbers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No se encontraron números' : 'No hay números agregados'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? `No hay números que coincidan con "${searchTerm}"`
                  : 'Agrega tu primer número para comenzar'
                }
              </p>
              {!searchTerm && (
                <AddNumberDialog onNumberAdded={handleAddNumber}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Primer Número
                  </Button>
                </AddNumberDialog>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNumbers.map((number) => (
            <Card key={number.id} className={number.isWinner ? 'border-yellow-200 bg-yellow-50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{number.number}</CardTitle>
                  <div className="flex items-center gap-2">
                    {number.isWinner && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Trophy className="mr-1 h-3 w-3" />
                        Ganador
                      </Badge>
                    )}
                    <EditNumberDialog
                      number={number}
                      onNumberUpdated={(updates) => handleUpdateNumber(number.id, updates)}
                      onNumberDeleted={() => handleDeleteNumber(number.id)}
                    />
                  </div>
                </div>
                {number.drawnAt && (
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Sorteado: {formatDate(number.drawnAt)}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}