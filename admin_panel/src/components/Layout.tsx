import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { api } from '../lib/api';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
  ];

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const Icon = item.icon;
    const active = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
        }`}
      >
        <Icon className="w-5 h-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-secondary">
      {/* ── Desktop Sidebar (lg+) ── */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-serif text-primary">Dr. Luci Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => <NavLink key={item.path} item={item} />)}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Header (< lg) ── */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border shrink-0">
          <h1 className="text-lg font-serif text-primary">Dr. Luci Admin</h1>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Drawer Overlay (< lg) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-card border-l border-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-primary text-lg">Menu</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => <NavLink key={item.path} item={item} />)}
            </nav>
            <div className="p-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
