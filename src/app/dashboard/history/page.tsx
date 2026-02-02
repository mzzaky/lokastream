'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  History,
  Trophy,
  Gamepad2,
  Users,
  Clock,
  Zap,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Crown,
  Target,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogOut,
  X,
  Search,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getGameSessionsPaginated,
  getGameHistoryStats,
  subscribeToSessions,
  Database
} from '@/lib/supabase';
import {
  cn,
  formatCurrency,
  formatDate,
  formatShortDate,
  formatTime,
  formatDuration,
  getRoleEmoji,
  getGameResultColor,
  getGameResultLabel,
  getGameResultEmoji,
  getSessionStatusColor,
  getSessionStatusLabel,
  getGameTypeLabel,
  getGameTypeEmoji
} from '@/lib/utils';

type GameSession = Database['public']['Tables']['game_sessions']['Row'];

// Stat Card Component
const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  color
}: {
  icon: any;
  label: string;
  value: string;
  subValue?: string;
  color: 'pink' | 'purple' | 'blue' | 'yellow' | 'green' | 'orange'
}) => {
  const colorClasses = {
    pink: 'border-candy-pink shadow-cartoon-pink bg-pastel-pink',
    purple: 'border-candy-purple shadow-cartoon-purple bg-pastel-purple',
    blue: 'border-candy-blue shadow-cartoon-blue bg-pastel-blue',
    yellow: 'border-candy-yellow shadow-[6px_6px_0_0_#FEE440] bg-pastel-yellow',
    green: 'border-candy-green shadow-[6px_6px_0_0_#6BCB77] bg-pastel-mint',
    orange: 'border-candy-orange shadow-[6px_6px_0_0_#FF8C42] bg-pastel-peach',
  };

  const iconColors = {
    pink: 'text-candy-pink bg-white',
    purple: 'text-candy-purple bg-white',
    blue: 'text-candy-blue bg-white',
    yellow: 'text-yellow-600 bg-white',
    green: 'text-green-600 bg-white',
    orange: 'text-orange-600 bg-white',
  };

  return (
    <div className={cn('card-cartoon p-4 transition-all hover:-translate-y-1', colorClasses[color])}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconColors[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="font-display text-2xl font-bold text-cartoon-dark">{value}</div>
      <div className="font-body text-sm text-gray-600">{label}</div>
      {subValue && (
        <div className="font-body text-xs text-gray-500 mt-1">{subValue}</div>
      )}
    </div>
  );
};

// Game Session Card Component
const GameSessionCard = ({ session }: { session: GameSession }) => {
  const [expanded, setExpanded] = useState(false);
  const players = session.players as any[] || [];

  return (
    <div className="card-cartoon bg-white p-0 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Session Number */}
            <div className="w-14 h-14 bg-gradient-to-br from-candy-pink to-candy-purple rounded-xl flex items-center justify-center shadow-cartoon">
              <span className="font-display font-bold text-white text-lg">#{session.session_number}</span>
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{getGameTypeEmoji(session.game_type)}</span>
                <span className="font-display font-bold text-cartoon-dark">
                  {getGameTypeLabel(session.game_type)}
                </span>
                <span className={cn('badge-cartoon text-xs border', getSessionStatusColor(session.status))}>
                  {getSessionStatusLabel(session.status)}
                </span>
              </div>
              <div className="flex items-center gap-3 font-body text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatShortDate(session.started_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(session.started_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {players.length} pemain
                </span>
              </div>
            </div>
          </div>

          {/* Result & Revenue */}
          <div className="flex items-center gap-4">
            {session.game_result && (
              <div className={cn('px-4 py-2 rounded-xl border-2 flex items-center gap-2', getGameResultColor(session.game_result))}>
                <span className="text-xl">{getGameResultEmoji(session.game_result)}</span>
                <span className="font-display font-bold">{getGameResultLabel(session.game_result)}</span>
              </div>
            )}
            <div className="text-right">
              <div className="font-display font-bold text-candy-purple">
                {formatCurrency(session.total_revenue)}
              </div>
              {session.duration_minutes && (
                <div className="font-body text-xs text-gray-500">
                  {formatDuration(session.duration_minutes)}
                </div>
              )}
            </div>
            <ChevronRight className={cn('w-5 h-5 text-gray-400 transition-transform', expanded && 'rotate-90')} />
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t-2 border-gray-100 p-4 bg-gray-50">
          <h4 className="font-display font-bold text-cartoon-dark mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-candy-purple" />
            Pemain dalam Sesi
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {players.map((player: any, index: number) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-xl border-2 bg-white',
                  session.mvp_player_id === player.id
                    ? 'border-candy-yellow bg-pastel-yellow'
                    : 'border-gray-200'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{getRoleEmoji(player.selected_role || player.role)}</span>
                  <span className="font-display font-bold text-sm truncate">{player.player_name}</span>
                  {session.mvp_player_id === player.id && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="font-body text-xs text-gray-500">
                  {player.game_nickname}
                </div>
                <div className="badge-purple text-xs mt-1 inline-block">
                  {player.selected_role || player.role}
                </div>
              </div>
            ))}
          </div>

          {session.notes && (
            <div className="mt-4 p-3 bg-pastel-blue rounded-xl">
              <span className="font-body text-sm text-gray-600">
                <strong>Catatan:</strong> {session.notes}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Filter Panel Component
const FilterPanel = ({
  filters,
  onFilterChange,
  onClose
}: {
  filters: any;
  onFilterChange: (filters: any) => void;
  onClose: () => void;
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      gameType: 'all',
      result: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    onClose();
  };

  return (
    <div className="card-cartoon bg-white p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-cartoon-dark flex items-center gap-2">
          <Filter className="w-5 h-5 text-candy-purple" />
          Filter Riwayat
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Game Type */}
        <div>
          <label className="font-body text-sm font-medium text-gray-700 mb-1 block">
            Jenis Game
          </label>
          <select
            value={localFilters.gameType}
            onChange={(e) => setLocalFilters({ ...localFilters, gameType: e.target.value })}
            className="input-cartoon w-full"
          >
            <option value="all">Semua Game</option>
            <option value="mobile_legends">Mobile Legends</option>
            <option value="pubg_mobile">PUBG Mobile</option>
            <option value="free_fire">Free Fire</option>
            <option value="valorant">Valorant</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        {/* Result */}
        <div>
          <label className="font-body text-sm font-medium text-gray-700 mb-1 block">
            Hasil
          </label>
          <select
            value={localFilters.result}
            onChange={(e) => setLocalFilters({ ...localFilters, result: e.target.value })}
            className="input-cartoon w-full"
          >
            <option value="all">Semua Hasil</option>
            <option value="win">Menang</option>
            <option value="lose">Kalah</option>
            <option value="draw">Seri</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="font-body text-sm font-medium text-gray-700 mb-1 block">
            Status
          </label>
          <select
            value={localFilters.status}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
            className="input-cartoon w-full"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="in_progress">Berlangsung</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="font-body text-sm font-medium text-gray-700 mb-1 block">
            Dari Tanggal
          </label>
          <input
            type="date"
            value={localFilters.dateFrom}
            onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
            className="input-cartoon w-full"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="font-body text-sm font-medium text-gray-700 mb-1 block">
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={localFilters.dateTo}
            onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
            className="input-cartoon w-full"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={handleReset} className="btn-cartoon-pink">
          Reset
        </button>
        <button onClick={handleApply} className="btn-cartoon-purple">
          Terapkan Filter
        </button>
      </div>
    </div>
  );
};

export default function HistoryPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, profileError } = useAuth();

  // State
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    winRate: 0,
    totalRevenue: 0,
    averageDuration: 0,
    totalPlayers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gameType: 'all',
    result: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    totalPages: 1,
    total: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch stats
        const historyStats = await getGameHistoryStats(user.id);
        setStats(historyStats);

        // Fetch sessions with pagination
        const { data, totalPages, count } = await getGameSessionsPaginated(user.id, {
          page: pagination.page,
          perPage: pagination.perPage,
          gameType: filters.gameType,
          result: filters.result,
          status: filters.status,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });

        setSessions(data || []);
        setPagination(prev => ({
          ...prev,
          totalPages,
          total: count
        }));

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data riwayat');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();

      // Subscribe to real-time updates
      const channel = subscribeToSessions(user.id, () => {
        fetchData();
      });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user, pagination.page, filters]);

  // Handle filter change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Show loading state
  if (authLoading || (user && !profile && !profileError)) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-candy-purple animate-spin mx-auto mb-4" />
          <p className="font-body text-gray-600">Memuat riwayat game...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (!user || !profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-4 border-candy-purple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Back & Logo */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl bg-pastel-purple text-candy-purple hover:bg-candy-purple hover:text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-candy-pink to-candy-purple rounded-2xl flex items-center justify-center shadow-cartoon">
                  <History className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="font-display text-2xl font-bold text-gradient">Riwayat Game</span>
                  <p className="font-body text-sm text-gray-500">Lihat semua sesi mabar</p>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-display font-bold text-cartoon-dark">{profile.display_name}</p>
                <p className="font-body text-sm text-gray-500">@{profile.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-3 rounded-xl bg-pastel-pink text-candy-red hover:bg-candy-red hover:text-white transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Gamepad2}
            label="Total Game"
            value={stats.totalGames.toString()}
            color="purple"
          />
          <StatCard
            icon={Trophy}
            label="Kemenangan"
            value={stats.totalWins.toString()}
            subValue={`Win Rate: ${stats.winRate}%`}
            color="green"
          />
          <StatCard
            icon={Users}
            label="Total Pemain"
            value={stats.totalPlayers.toString()}
            color="blue"
          />
          <StatCard
            icon={Zap}
            label="Total Pendapatan"
            value={formatCurrency(stats.totalRevenue)}
            subValue={stats.averageDuration > 0 ? `Avg: ${formatDuration(stats.averageDuration)}` : undefined}
            color="yellow"
          />
        </div>

        {/* Win/Loss Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-cartoon bg-green-50 border-green-400 p-4 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-display text-2xl font-bold text-green-600">{stats.totalWins}</div>
            <div className="font-body text-sm text-green-700">Menang</div>
          </div>
          <div className="card-cartoon bg-red-50 border-red-400 p-4 text-center">
            <div className="text-3xl mb-2">😢</div>
            <div className="font-display text-2xl font-bold text-red-600">{stats.totalLosses}</div>
            <div className="font-body text-sm text-red-700">Kalah</div>
          </div>
          <div className="card-cartoon bg-yellow-50 border-yellow-400 p-4 text-center">
            <div className="text-3xl mb-2">🤝</div>
            <div className="font-display text-2xl font-bold text-yellow-600">{stats.totalDraws}</div>
            <div className="font-body text-sm text-yellow-700">Seri</div>
          </div>
        </div>

        {/* Filter Toggle & Search */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-cartoon-dark flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-candy-purple" />
            Daftar Sesi ({pagination.total})
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'px-4 py-2 rounded-xl border-2 font-display font-bold transition-all flex items-center gap-2',
                showFilters
                  ? 'bg-candy-purple text-white border-candy-purple'
                  : 'bg-white text-candy-purple border-candy-purple hover:bg-pastel-purple'
              )}
            >
              <Filter className="w-5 h-5" />
              Filter
            </button>
            <button
              onClick={() => handleFilterChange(filters)}
              className="p-2 rounded-xl bg-pastel-purple text-candy-purple hover:bg-candy-purple hover:text-white transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Sessions List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-candy-purple animate-spin mx-auto mb-4" />
            <p className="font-body text-gray-600">Memuat riwayat...</p>
          </div>
        ) : error ? (
          <div className="card-cartoon bg-red-50 border-red-400 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="font-display text-lg font-bold text-red-600 mb-2">Terjadi Kesalahan</p>
            <p className="font-body text-red-500">{error}</p>
            <button
              onClick={() => handleFilterChange(filters)}
              className="mt-4 btn-cartoon-pink"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Coba Lagi
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="card-cartoon bg-white p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <p className="font-display text-xl text-gray-500 mb-2">Belum ada riwayat game</p>
            <p className="font-body text-gray-400 mb-4">Mulai sesi mabar pertamamu!</p>
            <Link href="/dashboard" className="btn-cartoon-purple inline-flex items-center">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali ke Dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {sessions.map((session) => (
                <GameSessionCard key={session.id} session={session} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-xl bg-pastel-purple text-candy-purple hover:bg-candy-purple hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const current = pagination.page;
                      return page === 1 || page === pagination.totalPages ||
                             (page >= current - 1 && page <= current + 1);
                    })
                    .map((page, index, arr) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && arr[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            'w-10 h-10 rounded-xl font-display font-bold transition-all',
                            page === pagination.page
                              ? 'bg-candy-purple text-white shadow-cartoon'
                              : 'bg-pastel-purple text-candy-purple hover:bg-candy-purple hover:text-white'
                          )}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-xl bg-pastel-purple text-candy-purple hover:bg-candy-purple hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
