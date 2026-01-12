import { ReactNode } from 'react';
import { LogOut } from 'lucide-react';

interface SidebarLayoutProps {
  children: ReactNode;
  menuItems: Array<{
    icon: ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
  }>;
  userName: string;
  userRole: string;
  onLogout: () => void;
  logo?: ReactNode;
}

export default function SidebarLayout({
  children,
  menuItems,
  userName,
  userRole,
  onLogout,
  logo
}: SidebarLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-[#0a3d5c] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#0b4d6f]">
          {logo || (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0b8fac] rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">DC</span>
              </div>
              <span className="text-xl font-bold">Dental Clinic</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? 'bg-[#0b8fac] text-white'
                  : 'text-gray-300 hover:bg-[#0b4d6f] hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-[#0b4d6f]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-gray-400">{userRole}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
