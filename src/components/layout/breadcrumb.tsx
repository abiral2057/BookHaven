
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItem[];
}

export function Breadcrumb({ className, items, ...props }: BreadcrumbProps) {
  const pathname = usePathname();

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathParts = pathname.split('/').filter(part => part);
    const breadcrumbItems: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    pathParts.forEach((part, index) => {
      const href = '/' + pathParts.slice(0, index + 1).join('/');
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      breadcrumbItems.push({ label, href });
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-muted-foreground', className)} {...props}>
      <ol className="flex items-center space-x-1.5">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mr-1.5" />}
            {item.href && index < breadcrumbItems.length - 1 ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
