'use client';

import { Footer } from '@/components/blocks/footer/footer';
import { NavbarWrapper } from '@/components/blocks/navbar/navbar-wrapper';
import { cn } from '@/lib/utils';
import type { ProtectedContainerProps } from '@/types';
import { useState } from 'react';
import { ProtectedSidebar } from './protected-sidebar';

export function ProtectedContainer({ children, sidebarGroups }: ProtectedContainerProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Main Navbar */}
      <NavbarWrapper />

      <div className="flex flex-1">
        {/* Sidebar */}
        <ProtectedSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarGroups={sidebarGroups}
        />

        {/* Main Content */}
        <div
          className={cn(
            'flex flex-1 flex-col transition-all duration-300',
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          )}
        >
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default ProtectedContainer;
