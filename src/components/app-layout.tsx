import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, List, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Logo } from './logo';

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Mis Listas', href: '/lists', icon: List },
  { name: 'Búsqueda', href: '/search', icon: Search },
  { name: 'Perfil', href: '/profile', icon: User },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const NavItems = ({ mobile = false }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => mobile && setIsOpen(false)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <Logo className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                Ampi Lotería
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <NavItems />
            </nav>
          </div>
          
          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link
                to="/"
                className="flex items-center space-x-2"
                onClick={() => setIsOpen(false)}
              >
                <Logo className="h-6 w-6" />
                <span className="font-bold">Ampi Lotería</span>
              </Link>
              <nav className="mt-6 flex flex-col space-y-3">
                <NavItems mobile />
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Link to="/" className="flex items-center space-x-2 md:hidden">
                <Logo className="h-6 w-6" />
                <span className="font-bold">Ampi Lotería</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-2">
              {user && (
                <div className="flex items-center space-x-2">
                  <span className="hidden text-sm text-muted-foreground sm:inline-block">
                    {user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Cerrar sesión</span>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}