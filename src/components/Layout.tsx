import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogOut, Home, Users, GraduationCap, Settings, Activity, MessageSquare } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: `/${user?.role}`, icon: Home }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Users', href: '/admin/users', icon: Users },
          { name: 'Library', href: '/admin/library', icon: BookOpen },
          { name: 'Classes', href: '/admin/classes', icon: GraduationCap },
          { name: 'Activities', href: '/admin/activities', icon: Activity }
        ];
      case 'staff':
        return [
          ...baseItems,
          { name: 'Profile', href: '/staff/profile', icon: Users },
          { name: 'Classes', href: '/staff/classes', icon: GraduationCap },
          { name: 'Library', href: '/staff/library', icon: BookOpen }
        ];
      case 'student':
        return [
          ...baseItems,
          { name: 'Profile', href: '/student/profile', icon: Users },
          { name: 'Classes', href: '/student/classes', icon: GraduationCap },
          { name: 'Library', href: '/student/library', icon: BookOpen }
        ];
      case 'visitor':
        return [
          ...baseItems,
          { name: 'Library', href: '/visitor/library', icon: BookOpen }
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Ponts per la Pau
              </span>
              {user?.role && (
                <span className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium uppercase">
                  {user.role}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== `/${user?.role}` && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}