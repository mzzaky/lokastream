'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Gamepad2, 
  Users, 
  Trophy, 
  Settings,
  Play,
  Pause,
  Crown,
  History,
  BarChart3,
  Copy,
  ExternalLink,
  Check,
  X,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  Zap,
  Star,
  Gift,
  Bell,
  ChevronRight,
  LogOut,
  Loader2,
  AlertCircle,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMabarSettings,
  getQueueEntries,
  getDashboardStats,
  updateQueueEntry,
  deleteQueueEntry,
  createGameSession,
  updateGameSession,
  getGameSessions,
  getNextSessionNumber,
  subscribeToQueue,
  getDonorCustomerStats,
  Database
} from '@/lib/supabase';
import { cn, formatCurrency, getRoleEmoji, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';

type QueueEntry = Database['public']['Tables']['queue_entries']['Row'];
type MabarSettings = Database['public']['Tables']['mabar_settings']['Row'];

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, color }: { icon: any; label: string; value: string; trend?: string; color: 'pink' | 'purple' | 'blue' | 'yellow' }) => {
  const colorClasses = {
    pink: 'border-candy-pink shadow-cartoon-pink bg-pastel-pink',
    purple: 'border-candy-purple shadow-cartoon-purple bg-pastel-purple',
    blue: 'border-candy-blue shadow-cartoon-blue bg-pastel-blue',
    yellow: 'border-candy-yellow shadow-[6px_6px_0_0_#FEE440] bg-pastel-yellow',
  };

  const iconColors = {
    pink: 'text-candy-pink bg-white',
    purple: 'text-candy-purple bg-white',
    blue: 'text-candy-blue bg-white',
    yellow: 'text-yellow-600 bg-white',
  };

  return (
    <div className={cn('card-cartoon p-5 transition-all hover:-translate-y-1', colorClasses[color])}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-sm font-semibold text-green-500">+{trend}</span>
        )}
      </div>
      <div className="font-display text-2xl font-bold text-cartoon-dark">{value}</div>
      <div className="font-body text-sm text-gray-600">{label}</div>
    </div>
  );
};

// Queue Item Component
const QueueItem = ({ 
  entry, 
  onSelect, 
  onRemove, 
  isSelected 
}: { 
  entry: QueueEntry; 
  onSelect: (id: string) => void; 
  onRemove: (id: string) => void;
  isSelected: boolean;
}) => {
  return (
    <div 
      className={cn(
        'relative flex items-center gap-4 p-4 rounded-2xl border-3 transition-all queue-item',
        isSelected 
          ? 'bg-pastel-pink border-candy-pink shadow-cartoon-pink' 
          : 'bg-white border-cartoon-dark/20 hover:border-candy-purple'
      )}
    >
      {/* Position Badge */}
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-candy-purple rounded-full flex items-center justify-center font-display font-bold text-white text-sm shadow-cartoon">
        #{entry.queue_position}
      </div>
      
      {/* Avatar */}
      <div className="w-14 h-14 bg-gradient-to-br from-candy-pink to-candy-purple rounded-xl flex items-center justify-center text-2xl shadow-cartoon">
        {getRoleEmoji(entry.selected_role)}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-cartoon-dark truncate">{entry.player_name}</span>
          {entry.payment_status === 'completed' && (
            <span className="badge-green text-xs">
              <Check className="w-3 h-3 mr-1" />
              Paid
            </span>
          )}
        </div>
        <div className="font-body text-sm text-gray-500">
          {entry.game_nickname} • ID: {entry.game_id}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="badge-purple text-xs">{entry.selected_role}</span>
          <span className={cn('badge-cartoon text-xs', getStatusColor(entry.status))}>
            {getStatusLabel(entry.status)}
          </span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelect(entry.id)}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
            isSelected 
              ? 'bg-candy-pink text-white' 
              : 'bg-pastel-purple text-candy-purple hover:bg-candy-purple hover:text-white'
          )}
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          onClick={() => onRemove(entry.id)}
          className="w-10 h-10 rounded-xl bg-pastel-pink text-candy-red hover:bg-candy-red hover:text-white transition-all flex items-center justify-center"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Selected Player Card
const SelectedPlayerCard = ({ 
  entry, 
  slot, 
  onRemove 
}: { 
  entry: QueueEntry | null; 
  slot: number; 
  onRemove?: () => void;
}) => {
  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-2xl border-3 border-dashed border-gray-300 min-h-[120px]">
        <Plus className="w-8 h-8 text-gray-400 mb-2" />
        <span className="font-body text-sm text-gray-400">Slot {slot}</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center p-4 bg-pastel-purple rounded-2xl border-3 border-candy-purple shadow-cartoon">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-candy-red rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="w-16 h-16 bg-gradient-to-br from-candy-pink to-candy-purple rounded-xl flex items-center justify-center text-3xl shadow-cartoon mb-2">
        {getRoleEmoji(entry.selected_role)}
      </div>
      <span className="font-display font-bold text-cartoon-dark text-sm truncate max-w-full">
        {entry.player_name}
      </span>
      <span className="badge-purple text-xs mt-1">{entry.selected_role}</span>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, profileError } = useAuth();
  
  // State
  const [mabarSettings, setMabarSettings] = useState<MabarSettings | null>(null);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [stats, setStats] = useState({ queueCount: 0, gamesCompleted: 0, totalMvp: 0, totalRevenue: 0 });
  const [customerCount, setCustomerCount] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSessionStartedAt, setCurrentSessionStartedAt] = useState<string | null>(null);
  const [playingPlayerIds, setPlayingPlayerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [profileLoadTimeout, setProfileLoadTimeout] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Timeout for profile loading (10 seconds)
  useEffect(() => {
    if (user && !profile && !profileError) {
      const timeout = setTimeout(() => {
        setProfileLoadTimeout(true);
      }, 10000);
      return () => clearTimeout(timeout);
    } else {
      setProfileLoadTimeout(false);
    }
  }, [user, profile, profileError]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch mabar settings
        const { data: settings } = await getMabarSettings(user.id);
        setMabarSettings(settings);

        // Fetch queue entries
        const { data: entries } = await getQueueEntries(user.id, ['waiting', 'selected']);
        setQueueEntries(entries || []);

        // Fetch stats
        const dashStats = await getDashboardStats(user.id);
        setStats(dashStats);

        // Fetch customer count
        const customerStats = await getDonorCustomerStats(user.id);
        setCustomerCount(customerStats.totalCustomers);

        // Detect active game session (persist across refresh)
        const { data: activeSessions } = await getGameSessions(user.id, 1);
        if (activeSessions && activeSessions.length > 0 && activeSessions[0].status === 'in_progress') {
          const activeSession = activeSessions[0];
          setIsGameActive(true);
          setCurrentSessionId(activeSession.id);
          setCurrentSessionStartedAt(activeSession.started_at);
          // Find playing queue entries
          const { data: playingEntries } = await getQueueEntries(user.id, ['playing']);
          if (playingEntries) {
            setPlayingPlayerIds(playingEntries.map(e => e.id));
          }
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();

      // Subscribe to real-time updates
      const channel = subscribeToQueue(user.id, (payload) => {
        console.log('Queue update:', payload);
        // Refetch queue entries on changes
        getQueueEntries(user.id, ['waiting', 'selected']).then(({ data }) => {
          setQueueEntries(data || []);
        });
      });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  // Handle player selection
  const handleSelectPlayer = async (id: string) => {
    if (selectedPlayers.includes(id)) {
      // Deselect: update status back to 'waiting' in DB
      setSelectedPlayers(selectedPlayers.filter(p => p !== id));
      await updateQueueEntry(id, { status: 'waiting' });
      setQueueEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'waiting' } : e));
    } else if (selectedPlayers.length < 4) {
      // Select: update status to 'selected' in DB
      setSelectedPlayers([...selectedPlayers, id]);
      await updateQueueEntry(id, { status: 'selected' });
      setQueueEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'selected' } : e));
    }
  };

  // Handle remove from queue
  const handleRemoveFromQueue = async (id: string) => {
    if (!confirm('Hapus pemain ini dari antrian?')) return;
    
    const { error } = await deleteQueueEntry(id);
    if (!error) {
      setQueueEntries(queueEntries.filter(e => e.id !== id));
      setSelectedPlayers(selectedPlayers.filter(p => p !== id));
    }
  };

  // Handle start game
  const handleStartGame = async () => {
    if (selectedPlayers.length === 0) {
      alert('Pilih minimal 1 pemain untuk mulai game');
      return;
    }

    if (!user || !mabarSettings) return;

    // Validate all selected players have completed payment
    const selectedEntries = queueEntries.filter(e => selectedPlayers.includes(e.id));
    const unpaidPlayers = selectedEntries.filter(e => e.payment_status !== 'completed');
    if (unpaidPlayers.length > 0) {
      const names = unpaidPlayers.map(e => e.player_name).join(', ');
      alert(`Pemain berikut belum membayar: ${names}. Hapus dari seleksi atau tunggu pembayaran selesai.`);
      return;
    }

    try {
      // Get next session number
      const { sessionNumber } = await getNextSessionNumber(user.id);

      // Create game session
      const players = selectedEntries.map(e => ({
        id: e.id,
        player_name: e.player_name,
        game_id: e.game_id,
        game_nickname: e.game_nickname,
        selected_role: e.selected_role,
      }));

      const { data: session, error } = await createGameSession({
        streamer_id: user.id,
        mabar_settings_id: mabarSettings.id,
        session_number: sessionNumber,
        players,
        game_type: mabarSettings.game_type,
        status: 'in_progress',
        total_revenue: selectedEntries.reduce((sum, e) => sum + e.amount_paid, 0),
      });

      if (error) throw error;

      // Update all queue entries status to playing in parallel
      const updateResults = await Promise.all(
        selectedPlayers.map(id => updateQueueEntry(id, { status: 'playing' }))
      );

      // Check if any updates failed
      const failedUpdates = updateResults.filter(r => r.error);
      if (failedUpdates.length > 0) {
        console.error('Some queue entry updates failed:', failedUpdates);
      }

      // Track active session state
      setCurrentSessionId(session.id);
      setCurrentSessionStartedAt(session.started_at);
      setPlayingPlayerIds([...selectedPlayers]);
      setIsGameActive(true);

      // Refetch queue
      const { data: entries } = await getQueueEntries(user.id, ['waiting', 'selected']);
      setQueueEntries(entries || []);
      setSelectedPlayers([]);

    } catch (err) {
      console.error('Error starting game:', err);
      alert('Gagal memulai game');
    }
  };

  // Handle end game
  const handleEndGame = async () => {
    if (!currentSessionId || !user) return;

    try {
      // Calculate duration
      const startedAt = currentSessionStartedAt ? new Date(currentSessionStartedAt) : new Date();
      const durationMinutes = Math.round((Date.now() - startedAt.getTime()) / 60000);

      // Update game session in database
      const { error: sessionError } = await updateGameSession(currentSessionId, {
        status: 'completed',
        ended_at: new Date().toISOString(),
        duration_minutes: durationMinutes,
      });

      if (sessionError) {
        console.error('Error updating game session:', sessionError);
        alert('Gagal mengakhiri sesi game');
        return;
      }

      // Update all playing queue entries to completed in parallel
      if (playingPlayerIds.length > 0) {
        const updateResults = await Promise.all(
          playingPlayerIds.map(id => updateQueueEntry(id, { status: 'completed' }))
        );
        const failedUpdates = updateResults.filter(r => r.error);
        if (failedUpdates.length > 0) {
          console.error('Some queue entry updates failed:', failedUpdates);
        }
      }

      // Reset game state
      setIsGameActive(false);
      setCurrentSessionId(null);
      setCurrentSessionStartedAt(null);
      setPlayingPlayerIds([]);

      // Refetch queue and stats
      const { data: entries } = await getQueueEntries(user.id, ['waiting', 'selected']);
      setQueueEntries(entries || []);

      const dashStats = await getDashboardStats(user.id);
      setStats(dashStats);

    } catch (err) {
      console.error('Error ending game:', err);
      alert('Gagal mengakhiri game');
    }
  };

  // Copy mabar link
  const copyMabarLink = () => {
    if (!profile) return;
    const link = `${window.location.origin}/mabar/${profile.username}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Show loading state
  if (authLoading || loading || (user && !profile && !profileError && !profileLoadTimeout)) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-candy-purple animate-spin mx-auto mb-4" />
          <p className="font-body text-gray-600">Memuat dashboard...</p>
        </div>
      </main>
    );
  }

  // Show error state for profile loading issues
  if (user && (!profile || profileError || profileLoadTimeout)) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full card-cartoon bg-white">
          <div className="text-center mb-6">
            <AlertCircle className="w-16 h-16 text-candy-red mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-cartoon-dark mb-2">
              Gagal Memuat Profil
            </h1>
            <p className="font-body text-gray-600 mb-4">
              {profileError || 'Profil pengguna tidak dapat dimuat. Silakan coba lagi.'}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full btn-cartoon-purple"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Coba Lagi
            </button>
            <button
              onClick={handleLogout}
              className="w-full btn-cartoon-pink"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-pastel-pink rounded-xl">
            <p className="font-body text-sm text-gray-600">
              <strong>Tips:</strong> Jika masalah berlanjut, pastikan Anda telah mendaftar dengan benar dan data profil tersimpan di database.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Show error state
  if (!user || !profile) {
    return null; // Will redirect to login
  }

  const waitingQueue = queueEntries.filter(e => e.status === 'waiting');
  const selectedEntries = queueEntries.filter(e => selectedPlayers.includes(e.id));

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-4 border-candy-purple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-candy-pink to-candy-purple rounded-2xl flex items-center justify-center shadow-cartoon group-hover:animate-wiggle">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-gradient">LokaStream</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-display font-bold text-cartoon-dark">{profile.display_name}</p>
                <p className="font-body text-sm text-gray-500">@{profile.username}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-candy-pink to-candy-purple rounded-xl flex items-center justify-center text-xl shadow-cartoon">
                🎮
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
        {/* Mabar Link Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue rounded-2xl text-white relative overflow-hidden">
          <div className="absolute top-2 right-4 text-4xl animate-bounce">🎮</div>
          <div className="absolute bottom-2 left-4 text-3xl floating-delay-1">⭐</div>
          
          <h2 className="font-display text-xl font-bold mb-2">Link Mabar Kamu 🔗</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 bg-white/20 rounded-xl px-4 py-3 font-body text-sm sm:text-base truncate">
              {typeof window !== 'undefined' ? `${window.location.origin}/mabar/${profile.username}` : `lokastream.com/mabar/${profile.username}`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyMabarLink}
                className="flex-1 sm:flex-none px-4 py-3 bg-white text-candy-purple font-display font-bold rounded-xl hover:bg-pastel-purple transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Tersalin!' : 'Copy'}
              </button>
              <Link
                href={`/mabar/${profile.username}`}
                target="_blank"
                className="flex-1 sm:flex-none px-4 py-3 bg-white/20 hover:bg-white/30 font-display font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Preview
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Antrian Saat Ini"
            value={stats.queueCount.toString()}
            color="pink"
          />
          <StatCard
            icon={Gamepad2}
            label="Game Selesai"
            value={stats.gamesCompleted.toString()}
            color="purple"
          />
          <StatCard
            icon={Trophy}
            label="Total MVP"
            value={stats.totalMvp.toString()}
            color="blue"
          />
          <StatCard
            icon={Zap}
            label="Pendapatan"
            value={formatCurrency(stats.totalRevenue)}
            color="yellow"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Queue Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Players */}
            <div className="card-cartoon bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-cartoon-dark flex items-center gap-2">
                  <Star className="w-6 h-6 text-candy-yellow" />
                  Tim Mabar
                </h2>
                <span className="badge-purple">{selectedPlayers.length}/4 Pemain</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {[1, 2, 3, 4].map((slot) => (
                  <SelectedPlayerCard
                    key={slot}
                    entry={selectedEntries[slot - 1] || null}
                    slot={slot}
                    onRemove={selectedEntries[slot - 1] ? () => handleSelectPlayer(selectedEntries[slot - 1].id) : undefined}
                  />
                ))}
              </div>

              {/* Game Controls */}
              <div className="flex gap-3">
                <button
                  onClick={handleStartGame}
                  disabled={selectedPlayers.length === 0 || isGameActive}
                  className="flex-1 btn-cartoon-pink disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Mulai Game
                </button>
                {isGameActive && (
                  <button
                    onClick={handleEndGame}
                    className="btn-cartoon-blue"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Selesai
                  </button>
                )}
              </div>
            </div>

            {/* Queue List */}
            <div className="card-cartoon bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-cartoon-dark flex items-center gap-2">
                  <Users className="w-6 h-6 text-candy-purple" />
                  Antrian Mabar
                </h2>
                <button 
                  onClick={() => getQueueEntries(user.id, ['waiting', 'selected']).then(({ data }) => setQueueEntries(data || []))}
                  className="p-2 rounded-lg bg-pastel-purple text-candy-purple hover:bg-candy-purple hover:text-white transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {waitingQueue.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎮</div>
                  <p className="font-display text-xl text-gray-500 mb-2">Belum ada antrian</p>
                  <p className="font-body text-gray-400">Share link mabar ke viewers untuk mulai!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {waitingQueue.map((entry) => (
                    <QueueItem
                      key={entry.id}
                      entry={entry}
                      onSelect={handleSelectPlayer}
                      onRemove={handleRemoveFromQueue}
                      isSelected={selectedPlayers.includes(entry.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card-cartoon bg-white">
              <h2 className="font-display text-lg font-bold text-cartoon-dark mb-4">
                Quick Actions ⚡
              </h2>
              <div className="space-y-3">
                <Link
                  href={`/overlay/${profile.username}`}
                  target="_blank"
                  className="flex items-center gap-3 p-3 rounded-xl bg-pastel-blue hover:bg-candy-blue hover:text-white transition-all group"
                >
                  <Eye className="w-5 h-5 text-candy-blue group-hover:text-white" />
                  <div className="flex-1">
                    <p className="font-display font-bold">OBS Overlay</p>
                    <p className="font-body text-xs opacity-70">Buka di browser baru</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                
                <Link
                  href="/dashboard/history"
                  className="flex items-center gap-3 p-3 rounded-xl bg-pastel-purple hover:bg-candy-purple hover:text-white transition-all group"
                >
                  <History className="w-5 h-5 text-candy-purple group-hover:text-white" />
                  <div className="flex-1">
                    <p className="font-display font-bold">Riwayat Game</p>
                    <p className="font-body text-xs opacity-70">Lihat semua sesi</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                
                <Link
                  href="/dashboard/mvp"
                  className="flex items-center gap-3 p-3 rounded-xl bg-pastel-yellow hover:bg-candy-yellow transition-all group"
                >
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-display font-bold">MVP Leaderboard</p>
                    <p className="font-body text-xs opacity-70">Top players</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/dashboard/customers"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pastel-pink to-pastel-purple hover:from-candy-pink hover:to-candy-purple hover:text-white transition-all group"
                >
                  <Heart className="w-5 h-5 text-candy-pink group-hover:text-white" />
                  <div className="flex-1">
                    <p className="font-display font-bold">Daftar Pelanggan</p>
                    <p className="font-body text-xs opacity-70">{customerCount} pelanggan</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 p-3 rounded-xl bg-pastel-pink hover:bg-candy-pink hover:text-white transition-all group"
                >
                  <Settings className="w-5 h-5 text-candy-pink group-hover:text-white" />
                  <div className="flex-1">
                    <p className="font-display font-bold">Pengaturan Mabar</p>
                    <p className="font-body text-xs opacity-70">Harga, role, dll</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Mabar Settings Summary */}
            {mabarSettings && (
              <div className="card-cartoon bg-white">
                <h2 className="font-display text-lg font-bold text-cartoon-dark mb-4">
                  Pengaturan Mabar 🎯
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-pastel-pink rounded-xl">
                    <span className="font-body text-gray-600">Harga per Slot</span>
                    <span className="font-display font-bold text-candy-pink">
                      {formatCurrency(mabarSettings.price_per_slot)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-pastel-purple rounded-xl">
                    <span className="font-body text-gray-600">Game</span>
                    <span className="font-display font-bold text-candy-purple capitalize">
                      {mabarSettings.game_type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-pastel-blue rounded-xl">
                    <span className="font-body text-gray-600">Max Antrian</span>
                    <span className="font-display font-bold text-candy-blue">
                      {mabarSettings.max_queue_size} orang
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-pastel-yellow rounded-xl">
                    <span className="font-body text-gray-600">MVP Reward</span>
                    <span className="font-display font-bold text-yellow-600">
                      {mabarSettings.mvp_reward_enabled ? `${mabarSettings.mvp_win_count}x MVP` : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
