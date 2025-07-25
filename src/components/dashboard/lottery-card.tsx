import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Clock, Users, Trophy, Eye, MoreVertical, Edit, Trash2, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Lottery, LotteryNumber } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { deleteLottery, getNumbers } from '@/lib/firestore';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { EditLotteryDialog } from './edit-lottery-dialog';

interface LotteryCardProps {
  lottery: Lottery;
  onLotteryDeleted?: () => Promise<void>;
  onLotteryUpdated?: () => Promise<void>;
}

export function LotteryCard({ lottery, onLotteryDeleted, onLotteryUpdated }: LotteryCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [numberRange, setNumberRange] = useState<string>('');

  useEffect(() => {
    const fetchNumberRange = async () => {
      if (user && lottery.numberCount && lottery.numberCount > 0) {
        try {
          const numbers = await getNumbers(user.uid, lottery.id);
          if (numbers.length > 0) {
            const numericNumbers = numbers
              .map(n => parseInt(n.number))
              .filter(n => !isNaN(n))
              .sort((a, b) => a - b);
            
            if (numericNumbers.length > 0) {
              const min = numericNumbers[0];
              const max = numericNumbers[numericNumbers.length - 1];
              setNumberRange(`${min} - ${max}`);
            }
          }
        } catch (error) {
          console.error('Error fetching number range:', error);
        }
      }
    };

    fetchNumberRange();
  }, [user, lottery.id, lottery.numberCount]);

  const handleDeleteLottery = async () => {
    if (!user || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await deleteLottery(user.uid, lottery.id);
      toast({
        title: 'Éxito',
        description: 'Lista eliminada correctamente.',
      });
      if (onLotteryDeleted) {
        await onLotteryDeleted();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar la lista.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{lottery.name}</CardTitle>
            <CardDescription className="mt-1">
              {lottery.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {lottery.status && (
              <Badge className={getStatusColor(lottery.status)}>
                {getStatusText(lottery.status)}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EditLotteryDialog 
                  lottery={lottery} 
                  onLotteryUpdated={onLotteryUpdated || (() => Promise.resolve())}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                </EditLotteryDialog>
                <DropdownMenuItem 
                  onClick={handleDeleteLottery}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Hash className="h-4 w-4" />
              <span>{lottery.numberCount || 0} números</span>
            </div>
            {numberRange && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>Rango: {numberRange}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link to={`/lottery/${lottery.id}`}>
              <Button variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}