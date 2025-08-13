/**
 * Layout Component - Main application layout with sidebar navigation
 * 
 * This component provides the main layout structure for the application
 * including a responsive sidebar navigation and main content area.
 * 
 * Features:
 * - Responsive sidebar navigation
 * - Mobile-friendly hamburger menu
 * - Active route highlighting
 * - Clean, modern design using shadcn/ui components
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  BarChart3, 
  Workflow, 
  Menu,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';

/**
 * Navigation items configuration
 */
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
];

/**
 * Sidebar navigation component
 * @param {Object} props - Component props
 * @param {Function} props.onNavigate - Optional callback when navigation occurs
 * @returns {JSX.Element} Sidebar navigation
 */
function SidebarNav({ onNavigate }) {
  const location = useLocation();

  return (
    <nav className="sidebar-nav">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={isActive ? 'active' : ''}
            onClick={onNavigate}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Main layout component with responsive sidebar
 * @param {Object} props - Component props  
 * @param {React.ReactNode} props.children - Child components to render in main content
 * @returns {JSX.Element} Layout wrapper component
 */
function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Handle mobile navigation and close sidebar
   */
  const handleMobileNavigate = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-card border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <Workflow className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-foreground">
              ProjectHub
            </span>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <div className="px-3">
              <SidebarNav />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Workflow className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">ProjectHub</span>
              </div>
            </div>
            <div className="flex-1 px-3 py-4">
              <SidebarNav onNavigate={handleMobileNavigate} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mobile-responsive">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;