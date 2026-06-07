import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  LineChart,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCog,
  FerrisWheel,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { User as UserType } from '@shared/types';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/dashboard', label: '核心看板', icon: LayoutDashboard },
  { path: '/alerts', label: '预警管理', icon: AlertTriangle },
  { path: '/forecast', label: '客流预测', icon: LineChart },
  { path: '/reports', label: '运营报告', icon: FileBarChart },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userList, setUserList] = useState<UserType[]>([]);
  const { user, login, logout, fetchUsers } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers().then(setUserList);
  }, [fetchUsers]);

  const handleSwitchRole = async (userId: string) => {
    await login(userId);
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'h-screen flex flex-col bg-navy-800/90 backdrop-blur-xl border-r border-navy-600/50 transition-all duration-300 relative',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-navy-700/50 via-transparent to-navy-900/50 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-30 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between px-4 py-5 border-b border-navy-600/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-teal to-accent-purple flex items-center justify-center flex-shrink-0 shadow-glow-teal">
            <FerrisWheel className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-white font-bold text-lg tracking-wide">智游乐园</span>
              <span className="text-metal-400 text-xs">智能运营平台</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 z-20 w-6 h-6 rounded-full bg-navy-700 border border-navy-500 flex items-center justify-center text-metal-300 hover:text-accent-teal hover:border-accent-teal transition-colors shadow-lg"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <nav className="relative z-10 flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-accent-teal/20 to-transparent text-accent-teal border border-accent-teal/30 shadow-glow-teal/20'
                  : 'text-metal-300 hover:text-white hover:bg-navy-700/60 border border-transparent hover:border-navy-500/50'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-teal rounded-r-full" />
                )}
                <item.icon className={cn('w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110', isActive && 'text-accent-teal')} />
                {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="relative z-10 border-t border-navy-600/40 p-3">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-navy-700/60',
              showUserMenu && 'bg-navy-700/60'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-orange to-accent-gold flex items-center justify-center text-lg flex-shrink-0 shadow-glow-orange/30">
              {user?.avatar || '👤'}
            </div>
            {!collapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-white text-sm font-medium truncate">{user?.name}</div>
                <div className="text-metal-400 text-xs truncate">{user?.roleName}</div>
              </div>
            )}
          </button>

          {showUserMenu && !collapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 py-2 bg-navy-800/95 backdrop-blur-xl rounded-xl border border-navy-600/50 shadow-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-navy-600/40">
                <p className="text-xs text-metal-400 mb-2">切换角色</p>
                <div className="space-y-1">
                  {userList.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchRole(u.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                        user?.id === u.id
                          ? 'bg-accent-teal/20 text-accent-teal'
                          : 'text-metal-300 hover:bg-navy-700/60 hover:text-white'
                      )}
                    >
                      <UserCog className="w-3.5 h-3.5" />
                      <span>{u.roleName}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-5 py-2 text-metal-300 hover:text-accent-red hover:bg-navy-700/40 text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
