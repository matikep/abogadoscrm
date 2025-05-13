import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';

// Placeholder function for sign out - replace with actual auth logic
async function handleSignOut() {
  'use server';
  console.log('Signing out...');
  // Add actual sign-out logic here (e.g., Firebase sign out)
}

export function UserNav() {
  // Placeholder user data - replace with actual user data from auth context
  const user = {
    name: 'Abogado Ejemplo',
    email: 'abogado@ejemplo.com',
    avatarUrl: '', // Add a placeholder or actual avatar URL
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0];
    return names[0][0] + names[names.length - 1][0];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="lawyer avatar"/>
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
         <form action={handleSignOut}>
           <DropdownMenuItem asChild>
             <button type="submit" className="w-full text-left">
               <LogOut className="mr-2 h-4 w-4" />
               <span>Cerrar sesión</span>
               <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
             </button>
           </DropdownMenuItem>
         </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
