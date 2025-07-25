import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Trash2 } from 'lucide-react';
import { AddNumberDialog } from './add-number-dialog';
import { useAuth } from '@/contexts/auth-context';
import { getNumbers, deleteNumber } from '@/lib/firestore';
import type { LotteryNumber } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface NumberManagementProps {
  lotteryId: string;
}

export function NumberManagement({ lotteryId }: NumberManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [numbers, setNumbers] = useState<LotteryNumber[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const loadNumbers = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const fetchedNumbers = await getNumbers(user.uid, lotteryId);
      setNumbers(fetchedNumbers);
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

  const handleDeleteNumber = async (numberId: string) => {
    if (!user) return;
    try {
      await deleteNumber(user.uid, lotteryId, numberId);
      toast({ title: 'Éxito', description: 'Número eliminado.' });
      loadNumbers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el número.',
      });
    }
  };

  const filteredNumbers = numbers.filter(number =>
    number.number.toString().endsWith(searchTerm) ||
    number.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para encontrar terminaciones similares
  const getSimilarEndings = (searchTerm: string, allNumbers: LotteryNumber[]) => {
    if (!searchTerm.trim()) return [];
    
    const uniqueEndings = new Set<string>();
    const searchNum = parseInt(searchTerm);
    
    allNumbers.forEach(number => {
      const numStr = number.number.toString();
      
      // Obtener todas las posibles terminaciones del número
      for (let i = 1; i <= numStr.length; i++) {
        const ending = numStr.slice(-i);
        if (ending === searchTerm) continue; // Excluir coincidencias exactas
        
        const endingNum = parseInt(ending);
        
        // Incluir si:
        // 1. Contiene el término buscado como substring
        // 2. Es numéricamente cercano (diferencia <= 2)
        // 3. Comparte dígitos significativos
        const containsSearch = ending.includes(searchTerm);
        const isNumericallyClose = Math.abs(endingNum - searchNum) <= 2;
        const sharesSameLength = ending.length === searchTerm.length;
        
        if (containsSearch || (isNumericallyClose && sharesSameLength)) {
          uniqueEndings.add(ending);
        }
      }
    });
    
    return Array.from(uniqueEndings)
      .sort((a, b) => {
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        
        // Priorizar por:
        // 1. Proximidad numérica
        // 2. Longitud similar
        // 3. Contiene el término buscado
        const aDistance = Math.abs(aNum - searchNum);
        const bDistance = Math.abs(bNum - searchNum);
        const aLengthDiff = Math.abs(a.length - searchTerm.length);
        const bLengthDiff = Math.abs(b.length - searchTerm.length);
        const aContains = a.includes(searchTerm) ? 0 : 1;
        const bContains = b.includes(searchTerm) ? 0 : 1;
        
        // Puntuación compuesta
        const aScore = aDistance + aLengthDiff * 2 + aContains * 5;
        const bScore = bDistance + bLengthDiff * 2 + bContains * 5;
        
        return aScore - bScore;
      })
      .slice(0, 5);
  };

  const similarEndings = searchTerm.trim() && filteredNumbers.length === 0 
    ? getSimilarEndings(searchTerm, numbers) 
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Números</h2>
          <p className="text-muted-foreground">Administra tus números de lotería</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Número
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por terminación (ej: 5, 87, 123)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando números...</p>
        </div>
      ) : filteredNumbers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron números que terminen exactamente en "' + searchTerm + '".' : 'No hay números agregados aún.'}
              </p>
              {searchTerm && similarEndings.length > 0 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Como alternativa, tienes números que terminan en:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {similarEndings.map((ending) => (
                      <button
                        key={ending}
                        onClick={() => setSearchTerm(ending)}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                      >
                        {ending}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar tu primer número
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNumbers.map((number) => (
            <Card key={number.id} className="relative">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {number.number}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNumber(number.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {(number.name || number.description) && (
                  <div className="space-y-1">
                    {number.name && (
                      <p className="text-sm font-medium text-foreground">
                        {number.name}
                      </p>
                    )}
                    {number.description && (
                      <p className="text-xs text-muted-foreground">
                        {number.description}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddNumberDialog
        lotteryId={lotteryId}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onNumberAdded={loadNumbers}
      />
    </div>
  );
}