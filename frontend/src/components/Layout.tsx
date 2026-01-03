import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  Map,
  AlertTriangle,
  MapPin,
  TrendingUp,
  FileText,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'District Map', href: '/districts', icon: Map },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Stations', href: '/stations', icon: MapPin },
  { name: 'Forecast', href: '/forecast', icon: TrendingUp },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'About', href: '/about', icon: Info },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-700">
                🌊 JalDrishti
              </h1>
              <span className="ml-3 text-sm text-gray-600 hidden sm:inline">
                Groundwater Intelligence System
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">CGWB Data 2015-2024</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-white border-r border-gray-200">
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="px-4 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Production-ready groundwater monitoring and early warning system
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <nav className="flex justify-around py-2">
            {navigation.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center px-3 py-2 text-xs font-medium',
                    isActive ? 'text-primary-700' : 'text-gray-600'
                  )}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
