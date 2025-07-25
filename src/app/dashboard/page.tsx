import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Upload, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Lottery } from '@/lib/types';
import { getLotteries, createLottery, addNumber } from '@/lib/firestore';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { CreateLotteryDialog } from '@/components/dashboard/create-lottery-dialog';
import { LotteryCard } from '@/components/dashboard/lottery-card';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const fetchLotteries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userLotteries = await getLotteries(user.uid);
      setLotteries(userLotteries);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las listas.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotteries();
  }, [user]);

  const handleImportAllData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setImporting(true);
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'El archivo CSV está vacío.',
        });
        return;
      }

      // Parse CSV data
      const data: { [lotteryName: string]: string[] } = {};
      
      for (const line of lines) {
        const [lotteryName, number] = line.split(',').map(item => item.trim());
        if (lotteryName && number) {
          if (!data[lotteryName]) {
            data[lotteryName] = [];
          }
          data[lotteryName].push(number);
        }
      }

      // Create lotteries and add numbers
      for (const [lotteryName, numbers] of Object.entries(data)) {
        try {
          const newLottery = await createLottery(user.uid, {
            name: lotteryName,
            description: `Lista importada con ${numbers.length} números`,
            status: 'active'
          });

          // Add all numbers to the lottery
          for (const number of numbers) {
            await addNumber(user.uid, newLottery.id, {
              number: number,
              isWinner: false,
              drawnAt: null
            });
          }
        } catch (error) {
          console.error(`Error creating lottery ${lotteryName}:`, error);
        }
      }

      toast({
        title: 'Éxito',
        description: `Se importaron ${Object.keys(data).length} listas correctamente.`,
      });

      // Refresh the lotteries list
      await fetchLotteries();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo importar el archivo CSV.',
      });
    } finally {
      setImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleExportAllData = async () => {
    if (!user || lotteries.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No hay datos para exportar.',
      });
      return;
    }

    try {
      const { getNumbers } = await import('@/lib/firestore');
      let csvContent = '';
      
      for (const lottery of lotteries) {
        try {
          const numbers = await getNumbers(user.uid, lottery.id);
          for (const numberObj of numbers) {
            csvContent += `${lottery.name},${numberObj.number}\n`;
          }
        } catch (error) {
          console.error(`Error getting numbers for lottery ${lottery.name}:`, error);
        }
      }

      if (csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `todas_las_listas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Éxito',
          description: 'Datos exportados correctamente.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se encontraron datos para exportar.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar los datos.',
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Gestiona tus listas de lotería
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleImportAllData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={importing}
            />
            <Button variant="outline" disabled={importing}>
              {importing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {importing ? 'Importando...' : 'Importar Todos los Datos'}
            </Button>
          </div>
          <Button variant="outline" onClick={handleExportAllData}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Todos los Datos
          </Button>
          <CreateLotteryDialog onLotteryCreated={fetchLotteries}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Lista
            </Button>
          </CreateLotteryDialog>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : lotteries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No hay listas creadas</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera lista de lotería para comenzar
              </p>
              <CreateLotteryDialog onLotteryCreated={fetchLotteries}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Lista
                </Button>
              </CreateLotteryDialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lotteries.map((lottery) => (
            <LotteryCard
              key={lottery.id}
              lottery={lottery}
              onLotteryDeleted={fetchLotteries}
              onLotteryUpdated={fetchLotteries}
            />
          ))}
        </div>
      )}
    </div>
  );
}