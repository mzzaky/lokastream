'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Users,
  Gamepad2,
  Gift,
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Target,
  TrendingUp,
  Sparkles,
  Award,
  Check,
  Clock,
  Search,
  Filter,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMvpRecords,
  getMabarSettings,
  Database
} from '@/lib/supabase';
import { cn, formatDate, formatShortDate } from '@/lib/utils';

type MVPRecord = Database['public']['Tables']['mvp_records']['Row'];
type MabarSettings = Database['public']['Tables']['mabar_settings']['Row'];

// Leaderboard Position Badge
const PositionBadge = ({ position }: { position: number }) => {
  const positionStyles: Record<number, { bg: string; border: string; text: string; emoji: string }> = {
    1: { bg: 'bg-gradient-to-br from-yellow-300 to-yellow-500', border: 'border-yellow-400', text: 'text-yellow-900', emoji: '' },
    2: { bg: 'bg-gradient-to-br from-gray-300 to-gray-400', border: 'border-gray-400', text: 'text-gray-700', emoji: '' },
    3: { bg: 'bg-gradient-to-br from-orange-300 to-orange-500', border: 'border-orange-400', text: 'text-orange-900', emoji: '' },
  };

  const style = positionStyles[position] || {
    bg: 'bg-gradient-to-br from-candy-purple to-candy-pink',
    border: 'border-candy-purple',
    text: 'text-white',
    emoji: ''
  };

  return (
    <div className={cn(
      'w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg shadow-cartoon border-2',
      style.bg,
      style.border,
      style.text
    )}>
      {position <= 3 ? (
        <span className="text-2xl">{style.emoji}</span>
      ) : (
        `#${position}`
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  emoji
}: {
  icon: any;
  label: string;
  value: string;
  subValue?: string;
  color: 'pink' | 'purple' | 'blue' | 'yellow' | 'green' | 'orange';
  emoji?: string;
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
          {emoji ? (
            <span className="text-xl">{emoji}</span>
          ) : (
            <Icon className="w-5 h-5" />
          )}
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

// MVP Player Card Component
const MVPPlayerCard = ({
  record,
  position,
  mvpWinCount,
  mvpRewardDescription,
  onClaimReward
}: {
  record: MVPRecord;
  position: number;
  mvpWinCount: number;
  mvpRewardDescription?: string;
  onClaimReward: (recordId: string) => void;
}) => {
  const mvpProgress = Math.min((record.total_mvp_wins / mvpWinCount) * 100, 100);
  const canClaimReward = record.total_mvp_wins >= mvpWinCount;
  const rewardsClaimed = record.rewards_claimed as any[] || [];
  const totalRewardsClaimed = rewardsClaimed.length;

  // Calculate how many rewards can be claimed
  const rewardsEarned = Math.floor(record.total_mvp_wins / mvpWinCount);
  const pendingRewards = rewardsEarned - totalRewardsClaimed;

  return (
    <div className={cn(
      'card-cartoon bg-white p-0 overflow-hidden transition-all hover:-translate-y-1',
      position === 1 && 'border-yellow-400 shadow-[6px_6px_0_0_#FEE440]',
      position === 2 && 'border-gray-400 shadow-[6px_6px_0_0_#9CA3AF]',
      position === 3 && 'border-orange-400 shadow-[6px_6px_0_0_#FB923C]'
    )}>
      {/* Top Decoration for Top 3 */}
      {position <= 3 && (
        <div className={cn(
          'py-2 px-4 text-center font-display font-bold text-sm',
          position === 1 && 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900',
          position === 2 && 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700',
          position === 3 && 'bg-gradient-to-r from-orange-300 to-orange-500 text-orange-900'
        )}>
          {position === 1 && 'CHAMPION MVP'}
          {position === 2 && 'RUNNER UP'}
          {position === 3 && 'THIRD PLACE'}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Position Badge */}
          <PositionBadge position={position} />

          {/* Player Avatar */}
          <div className={cn(
            'w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-cartoon',
            position === 1 && 'bg-gradient-to-br from-yellow-200 to-yellow-400',
            position === 2 && 'bg-gradient-to-br from-gray-200 to-gray-300',
            position === 3 && 'bg-gradient-to-br from-orange-200 to-orange-400',
            position > 3 && 'bg-gradient-to-br from-candy-pink to-candy-purple'
          )}>
            {position <= 3 ? <Crown className={cn(
              'w-8 h-8',
              position === 1 && 'text-yellow-700',
              position === 2 && 'text-gray-600',
              position === 3 && 'text-orange-700'
            )} /> : ''}
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-bold text-cartoon-dark text-lg truncate">
                {record.player_name}
              </span>
              {position === 1 && (
                <span className="text-lg animate-bounce">👑</span>
              )}
            </div>
            <div className="flex items-center gap-3 font-body text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-candy-yellow" />
                {record.total_mvp_wins} MVP
              </span>
              <span className="flex items-center gap-1">
                <Gamepad2 className="w-4 h-4 text-candy-purple" />
                {record.total_games_played} Games
              </span>
            </div>
            <div className="font-body text-xs text-gray-400 mt-1">
              ID: {record.player_identifier}
            </div>
          </div>

          {/* Stats */}
          <div className="text-right hidden sm:block">
            <div className="font-display text-2xl font-bold text-candy-purple">
              {record.total_games_played > 0
                ? Math.round((record.total_mvp_wins / record.total_games_played) * 100)
                : 0}%
            </div>
            <div className="font-body text-xs text-gray-500">MVP Rate</div>
          </div>
        </div>

        {/* MVP Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-sm text-gray-600">
              Progress Reward ({record.total_mvp_wins % mvpWinCount}/{mvpWinCount} MVP)
            </span>
            {pendingRewards > 0 && (
              <span className="badge-cartoon bg-pastel-yellow text-yellow-700 border-candy-yellow text-xs flex items-center gap-1">
                <Gift className="w-3 h-3" />
                {pendingRewards} Reward Tersedia!
              </span>
            )}
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                canClaimReward
                  ? 'bg-gradient-to-r from-candy-yellow to-yellow-500 animate-pulse'
                  : 'bg-gradient-to-r from-candy-pink to-candy-purple'
              )}
              style={{ width: `${mvpProgress}%` }}
            />
          </div>
        </div>

        {/* Reward Section */}
        {(pendingRewards > 0 || totalRewardsClaimed > 0) && (
          <div className="mt-4 p-3 bg-pastel-yellow rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-yellow-600" />
                  <span className="font-display font-bold text-yellow-800">
                    Reward: {mvpRewardDescription || 'MVP Reward'}
                  </span>
                </div>
                <div className="font-body text-xs text-yellow-700">
                  Total diklaim: {totalRewardsClaimed}x | Tersedia: {pendingRewards}x
                </div>
              </div>
              {pendingRewards > 0 && (
                <button
                  onClick={() => onClaimReward(record.id)}
                  className="px-4 py-2 bg-candy-yellow text-yellow-900 font-display font-bold rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-cartoon-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Klaim
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="card-cartoon bg-white p-12 text-center">
    <div className="text-7xl mb-4 animate-bounce-slow">🏆</div>
    <h3 className="font-display text-2xl font-bold text-cartoon-dark mb-2">
      Belum Ada MVP
    </h3>
    <p className="font-body text-gray-500 mb-6 max-w-md mx-auto">
      Mulai sesi mabar dan pilih MVP di setiap game untuk mengisi leaderboard ini!
    </p>
    <Link href="/dashboard" className="btn-cartoon-purple inline-flex items-center">
      <ArrowLeft className="w-5 h-5 mr-2" />
      Kembali ke Dashboard
    </Link>
  </div>
);

export default function MVPLeaderboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, profileError } = useAuth();

  // State
  const [mvpRecords, setMvpRecords] = useState<MVPRecord[]>([]);
  const [mabarSettings, setMabarSettings] = useState<MabarSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Calculated stats
  const totalMVPs = mvpRecords.reduce((sum, r) => sum + r.total_mvp_wins, 0);
  const totalGamesPlayed = mvpRecords.reduce((sum, r) => sum + r.total_games_played, 0);
  const uniquePlayers = mvpRecords.length;
  const topPlayer = mvpRecords[0];

  // Filter records by search
  const filteredRecords = mvpRecords.filter(record =>
    record.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.player_identifier.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        // Fetch MVP records
        const { data: records, error: recordsError } = await getMvpRecords(user.id);
        if (recordsError) throw recordsError;
        setMvpRecords(records || []);

        // Fetch mabar settings for MVP reward info
        const { data: settings } = await getMabarSettings(user.id);
        setMabarSettings(settings);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data leaderboard');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Handle claim reward
  const handleClaimReward = async (recordId: string) => {
    // In a real app, this would update the database
    alert('Fitur klaim reward akan segera hadir! Untuk saat ini, catat manual pemain yang berhak mendapat reward.');
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: records } = await getMvpRecords(user.id);
      setMvpRecords(records || []);
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (authLoading || (user && !profile && !profileError)) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-candy-purple animate-spin mx-auto mb-4" />
          <p className="font-body text-gray-600">Memuat MVP Leaderboard...</p>
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
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-4 border-candy-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Back & Logo */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl bg-pastel-yellow text-yellow-600 hover:bg-candy-yellow hover:text-yellow-900 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-candy-yellow to-yellow-500 rounded-2xl flex items-center justify-center shadow-cartoon">
                  <Trophy className="w-7 h-7 text-yellow-900" />
                </div>
                <div>
                  <span className="font-display text-2xl font-bold text-gradient">MVP Leaderboard</span>
                  <p className="font-body text-sm text-gray-500">Top players & rewards</p>
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
        {/* Hero Section */}
        <div className="relative mb-8 p-8 bg-gradient-to-r from-candy-yellow via-yellow-400 to-candy-orange rounded-2xl text-white overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-4 right-8 text-5xl animate-bounce">🏆</div>
          <div className="absolute bottom-4 left-8 text-4xl floating-delay-1">⭐</div>
          <div className="absolute top-1/2 right-1/4 text-3xl floating-delay-2">👑</div>

          <div className="relative z-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-yellow-900 mb-2">
              MVP Leaderboard
            </h1>
            <p className="font-body text-yellow-800 text-lg mb-4">
              Pemain terbaik yang sering menjadi MVP di sesi mabar kamu!
            </p>

            {mabarSettings?.mvp_reward_enabled && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 rounded-xl backdrop-blur-sm">
                <Gift className="w-5 h-5 text-yellow-900" />
                <span className="font-display font-bold text-yellow-900">
                  Reward: {mabarSettings.mvp_reward_description || 'Free Mabar'} setiap {mabarSettings.mvp_win_count}x MVP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Trophy}
            label="Total MVP Awards"
            value={totalMVPs.toString()}
            emoji="🏆"
            color="yellow"
          />
          <StatCard
            icon={Users}
            label="Pemain Unik"
            value={uniquePlayers.toString()}
            emoji="👥"
            color="purple"
          />
          <StatCard
            icon={Gamepad2}
            label="Total Games"
            value={totalGamesPlayed.toString()}
            emoji="🎮"
            color="blue"
          />
          <StatCard
            icon={Crown}
            label="Top MVP"
            value={topPlayer?.player_name || '-'}
            subValue={topPlayer ? `${topPlayer.total_mvp_wins} MVP` : undefined}
            emoji="👑"
            color="orange"
          />
        </div>

        {/* Top 3 Podium (if we have data) */}
        {mvpRecords.length >= 3 && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold text-cartoon-dark mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-candy-yellow" />
              Hall of Fame
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {/* Second Place */}
              <div className="order-1 md:order-1">
                <div className="card-cartoon bg-gradient-to-b from-gray-100 to-gray-200 border-gray-400 p-6 text-center h-full flex flex-col justify-end">
                  <div className="text-5xl mb-3">🥈</div>
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-3xl mb-3 shadow-cartoon">
                    🎮
                  </div>
                  <div className="font-display font-bold text-cartoon-dark truncate">
                    {mvpRecords[1]?.player_name}
                  </div>
                  <div className="font-body text-sm text-gray-600">
                    {mvpRecords[1]?.total_mvp_wins} MVP
                  </div>
                </div>
              </div>

              {/* First Place */}
              <div className="order-0 md:order-0 -mt-4">
                <div className="card-cartoon bg-gradient-to-b from-yellow-100 to-yellow-200 border-yellow-400 shadow-[6px_6px_0_0_#FEE440] p-6 text-center h-full flex flex-col justify-end">
                  <div className="text-6xl mb-3 animate-bounce-slow">🥇</div>
                  <div className="relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce">👑</div>
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-4xl mb-3 shadow-cartoon">
                      🎮
                    </div>
                  </div>
                  <div className="font-display font-bold text-cartoon-dark text-lg truncate">
                    {mvpRecords[0]?.player_name}
                  </div>
                  <div className="font-body text-sm text-yellow-700">
                    {mvpRecords[0]?.total_mvp_wins} MVP - CHAMPION!
                  </div>
                </div>
              </div>

              {/* Third Place */}
              <div className="order-2 md:order-2">
                <div className="card-cartoon bg-gradient-to-b from-orange-100 to-orange-200 border-orange-400 p-6 text-center h-full flex flex-col justify-end">
                  <div className="text-5xl mb-3">🥉</div>
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-300 to-orange-400 rounded-full flex items-center justify-center text-3xl mb-3 shadow-cartoon">
                    🎮
                  </div>
                  <div className="font-display font-bold text-cartoon-dark truncate">
                    {mvpRecords[2]?.player_name}
                  </div>
                  <div className="font-body text-sm text-orange-700">
                    {mvpRecords[2]?.total_mvp_wins} MVP
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-cartoon-dark flex items-center gap-2">
            <Medal className="w-6 h-6 text-candy-purple" />
            Semua MVP ({filteredRecords.length})
          </h2>
          <div className="flex items-center gap-3">
            {showSearch ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pemain..."
                    className="input-cartoon pl-10 pr-4 py-2 w-48"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  className="p-2 rounded-xl bg-pastel-pink text-candy-pink hover:bg-candy-pink hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-xl bg-pastel-purple text-candy-purple hover:bg-candy-purple hover:text-white transition-all"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-pastel-yellow text-yellow-600 hover:bg-candy-yellow hover:text-yellow-900 transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Leaderboard List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-candy-purple animate-spin mx-auto mb-4" />
            <p className="font-body text-gray-600">Memuat leaderboard...</p>
          </div>
        ) : error ? (
          <div className="card-cartoon bg-red-50 border-red-400 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="font-display text-lg font-bold text-red-600 mb-2">Terjadi Kesalahan</p>
            <p className="font-body text-red-500">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 btn-cartoon-pink"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Coba Lagi
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          searchQuery ? (
            <div className="card-cartoon bg-white p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <p className="font-display text-xl text-gray-500 mb-2">Tidak ditemukan</p>
              <p className="font-body text-gray-400">
                Tidak ada pemain dengan nama &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 btn-cartoon-purple"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record, index) => (
              <MVPPlayerCard
                key={record.id}
                record={record}
                position={index + 1}
                mvpWinCount={mabarSettings?.mvp_win_count || 3}
                mvpRewardDescription={mabarSettings?.mvp_reward_description}
                onClaimReward={handleClaimReward}
              />
            ))}
          </div>
        )}

        {/* Info Card */}
        {mabarSettings?.mvp_reward_enabled && (
          <div className="mt-8 card-cartoon bg-pastel-blue border-candy-blue p-6">
            <h3 className="font-display text-lg font-bold text-candy-blue mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Tentang MVP Reward
            </h3>
            <div className="font-body text-gray-600 space-y-2">
              <p>
                <strong>Cara Kerja:</strong> Setiap pemain yang menjadi MVP di sesi mabar akan mendapat poin MVP.
              </p>
              <p>
                <strong>Reward:</strong> Setiap mencapai {mabarSettings.mvp_win_count}x MVP, pemain berhak mendapat reward: <span className="font-bold text-candy-purple">{mabarSettings.mvp_reward_description || 'Free Mabar'}</span>
              </p>
              <p>
                <strong>Tips:</strong> Pilih MVP di akhir setiap sesi game melalui halaman dashboard!
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
