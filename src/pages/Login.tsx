import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FerrisWheel, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { User as UserType } from '@shared/types';
import { cn } from '@/lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const { login, fetchUsers } = useAppStore();
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchUsers();
        if (mounted) setUsers(data);
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchUsers]);

  const handleLogin = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await login(selectedUser);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-navy-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-teal/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-teal to-accent-purple shadow-glow-teal mb-4">
            <FerrisWheel className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">智游乐园</h1>
          <p className="text-metal-400">智能运营分析平台</p>
        </div>

        <div className="bg-navy-800/80 backdrop-blur-xl rounded-2xl border border-navy-600/50 p-6 shadow-card-dark">
          <h2 className="text-xl font-semibold text-white mb-2">选择账号登录</h2>
          <p className="text-metal-400 text-sm mb-6">演示环境，请选择您要使用的角色</p>

          <div className="space-y-2 mb-6 min-h-[200px]">
            {loadingUsers ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-full flex items-center gap-3 p-3 rounded-xl bg-navy-700/40 border border-navy-600/40">
                    <div className="w-10 h-10 rounded-full bg-metal-600/50 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-metal-600/50 rounded animate-pulse" />
                      <div className="h-3 w-32 bg-metal-600/30 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
                    selectedUser === user.id
                      ? 'bg-accent-teal/10 border-accent-teal/50 shadow-glow-teal/20'
                      : 'bg-navy-700/40 border-navy-600/40 hover:border-navy-500/60 hover:bg-navy-700/60'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-orange to-accent-gold flex items-center justify-center text-xl flex-shrink-0">
                    {user.avatar || <User className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-metal-400 text-sm">{user.roleName}</div>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      selectedUser === user.id ? 'border-accent-teal bg-accent-teal' : 'border-metal-500'
                    )}
                  >
                    {selectedUser === user.id && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedUser || loading}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-200',
              selectedUser && !loading
                ? 'bg-gradient-to-r from-accent-teal to-accent-purple text-white shadow-glow-teal hover:shadow-lg hover:scale-[1.02]'
                : 'bg-navy-700/60 text-metal-500 cursor-not-allowed'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>登录中...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>登录系统</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-metal-500 text-xs mt-6">
          © 2025 智游乐园智能运营平台 · 保留所有权利
        </p>
      </div>
    </div>
  );
}
