'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react'; // Import all icons from lucide-react
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

// Define the type for the icon mapping
type IconName = keyof typeof Icons;

// Update NavItem to use iconName string
export interface NavItem {
  href: string;
  label: string;
  iconName: IconName; // Use string for icon name
}

interface MainNavProps {
  items: NavItem[];
}

// Helper component to render the icon dynamically
const DynamicIcon = ({ name, ...props }: { name: IconName } & Icons.LucideProps) => {
  const LucideIcon = Icons[name];

  if (!LucideIcon) {
    // Fallback or error handling
    console.error(`Icon "${name}" not found in lucide-react`);
    return <Icons.HelpCircle {...props} />; // Return a fallback icon
  }

  return <LucideIcon {...props} />;
};


export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <a> {/* Link needs an anchor child for legacyBehavior */}
                    <DynamicIcon name={item.iconName} /> {/* Use DynamicIcon component */}
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </nav>
  );
}
