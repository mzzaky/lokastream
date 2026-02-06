'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Gamepad2,
  ArrowLeft,
  Loader2,
  RefreshCw,
  LogOut,
  Search,
  Filter,
  X,
  Crown,
  Star,
  Trophy,
  TrendingUp,
  Heart,
  ChevronLeft,
  ChevronRight,
  Gem,
  Shield,
  Ban,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  SortAsc,
  SortDesc,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getDonorCustomers,
  getDonorCustomerStats,
  updateDonorCustomer,
  Database
} from '@/lib/supabase';
import { cn, formatCurrency, formatDate, formatShortDate, getRoleEmoji } from '@/lib/utils';

type DonorCustomer = Database['public']['Tables']['donor_customers']['Row'];

// Tier configuration
const TIER_CONFIG: Record<string, { label: string; emoji: string; color: string; bgColor: string; borderColor: string; minAmount: number }> = {
  diamond: { label: 'Diamond', emoji: '💎', color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-400', minAmount: 2000000 },
  platinum: { label: 'Platinum', emoji: '👑', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-400', minAmount: 1000000 },
  gold: { label: 'Gold', emoji: '🥇', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-400', minAmount: 500000 },
  silver: { label: 'Silver', emoji: '🥈', color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-400', minAmount: 200000 },
  bronze: { label: 'Bronze', emoji: '🥉', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-400', minAmount: 0 },
};

// Tier Badge Component
const TierBadge = ({ tier }: { tier: string }) => {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.bronze;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border-2',
      config.bgColor, config.color, config.borderColor
    )}>
      {config.emoji} {config.label}
    </span>
  );
};

// Stat Card Component
const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  subValue?: string;
  color: 'pink' | 'purple' | 'blue' | 'yellow' | 'green' | 'orange';
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
    <div className={cn('card-cartoon p-5 transition-all hover:-translate-y-1', colorClasses[color])}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="font-display text-2xl font-bold text-cartoon-dark">{value}</div>
      <div className="font-body text-sm text-gray-600">{label}</div>
      {subValue && <div className="font-body text-xs text-gray-400 mt-1">{subValue}</div>}
    </div>
  );
};

// Customer Detail Modal
const CustomerDetailModal = ({
  customer,
  onClose,
  onUpdateNotes,
  onToggleBlock,
}: {
  customer: DonorCustomer;
  onClose: () => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onToggleBlock: (id: string, blocked: boolean) => void;
}) => {
  const [notes, setNotes] = useState(customer.notes || '');
  const tierConfig = TIER_CONFIG[customer.customer_tier] || TIER_CONFIG.bronze;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-3xl border-3 border-cartoon-dark shadow-cartoon max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue rounded-t-3xl text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg bg-white/20 hover:bg-white/30">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
              {tierConfig.emoji}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">{customer.player_name}</h2>
              <p className="text-white/80 font-body text-sm">{customer.game_nickname} &bull; ID: {customer.game_id}</p>
              <TierBadge tier={customer.customer_tier} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-pastel-pink rounded-xl text-center">
              <div className="font-display text-xl font-bold text-candy-pink">{customer.total_donations}</div>
              <div className="font-body text-xs text-gray-500">Total Donasi</div>
            </div>
            <div className="p-3 bg-pastel-purple rounded-xl text-center">
              <div className="font-display text-xl font-bold text-candy-purple">{formatCurrency(customer.total_amount_spent)}</div>
              <div className="font-body text-xs text-gray-500">Total Belanja</div>
            </div>
            <div className="p-3 bg-pastel-blue rounded-xl text-center">
              <div className="font-display text-xl font-bold text-candy-blue">{customer.total_games_played}</div>
              <div className="font-body text-xs text-gray-500">Game Dimainkan</div>
            </div>
            <div className="p-3 bg-pastel-yellow rounded-xl text-center">
              <div className="font-display text-xl font-bold text-yellow-600">{customer.total_mvp_wins}</div>
              <div className="font-body text-xs text-gray-500">MVP Wins</div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-cartoon-dark">Kontak</h3>
            {customer.email && (
              <div className="flex items-center gap-2 text-sm font-body text-gray-600">
                <Mail className="w-4 h-4 text-candy-purple" />
                {customer.email}
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm font-body text-gray-600">
                <Phone className="w-4 h-4 text-candy-blue" />
                {customer.phone}
              </div>
            )}
            {customer.favorite_role && (
              <div className="flex items-center gap-2 text-sm font-body text-gray-600">
                <Shield className="w-4 h-4 text-candy-pink" />
                Role Favorit: {getRoleEmoji(customer.favorite_role)} {customer.favorite_role}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-cartoon-dark">Riwayat</h3>
            {customer.first_donation_at && (
              <div className="flex items-center gap-2 text-sm font-body text-gray-600">
                <Calendar className="w-4 h-4 text-green-500" />
                Pertama donasi: {formatShortDate(customer.first_donation_at)}
              </div>
            )}
            {customer.last_donation_at && (
              <div className="flex items-center gap-2 text-sm font-body text-gray-600">
                <Calendar className="w-4 h-4 text-candy-blue" />
                Terakhir donasi: {formatShortDate(customer.last_donation_at)}
              </div>
            )}
            {customer.last_played_at && (
              <div className="flex items-center gap-2 text-sm font-body text-gray-600">
                <Gamepad2 className="w-4 h-4 text-candy-purple" />
                Terakhir bermain: {formatShortDate(customer.last_played_at)}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-cartoon-dark">Catatan</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan tentang pelanggan ini..."
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-candy-purple focus:ring-0 font-body text-sm resize-none h-20"
            />
            <button
              onClick={() => onUpdateNotes(customer.id, notes)}
              className="w-full btn-cartoon-purple text-sm py-2"
            >
              Simpan Catatan
            </button>
          </div>

          {/* Block Toggle */}
          <button
            onClick={() => onToggleBlock(customer.id, !customer.is_blocked)}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 font-display font-bold text-sm transition-all',
              customer.is_blocked
                ? 'bg-pastel-mint border-green-400 text-green-600 hover:bg-green-100'
                : 'bg-red-50 border-red-300 text-red-500 hover:bg-red-100'
            )}
          >
            {customer.is_blocked ? (
              <>
                <Shield className="w-4 h-4" />
                Unblock Pelanggan
              </>
            ) : (
              <>
                <Ban className="w-4 h-4" />
                Block Pelanggan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Customer Row Component
const CustomerRow = ({
  customer,
  rank,
  onClick,
}: {
  customer: DonorCustomer;
  rank: number;
  onClick: () => void;
}) => {
  const tierConfig = TIER_CONFIG[customer.customer_tier] || TIER_CONFIG.bronze;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-4 rounded-2xl border-3 transition-all cursor-pointer hover:-translate-y-0.5',
        customer.is_blocked
          ? 'bg-gray-50 border-gray-300 opacity-60'
          : 'bg-white border-cartoon-dark/20 hover:border-candy-purple hover:shadow-cartoon-purple'
      )}
    >
      {/* Rank */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm shadow-cartoon border-2',
        rank <= 3
          ? rank === 1
            ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-400 text-yellow-900'
            : rank === 2
              ? 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-400 text-gray-700'
              : 'bg-gradient-to-br from-orange-300 to-orange-500 border-orange-400 text-orange-900'
          : 'bg-gradient-to-br from-candy-purple to-candy-pink border-candy-purple text-white'
      )}>
        #{rank}
      </div>

      {/* Avatar */}
      <div className="w-12 h-12 bg-gradient-to-br from-candy-pink to-candy-purple rounded-xl flex items-center justify-center text-xl shadow-cartoon">
        {tierConfig.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-bold text-cartoon-dark truncate">{customer.player_name}</span>
          <TierBadge tier={customer.customer_tier} />
          {customer.is_blocked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-500 border border-red-300">
              <Ban className="w-3 h-3" /> Blocked
            </span>
          )}
        </div>
        <div className="font-body text-sm text-gray-500">
          {customer.game_nickname} &bull; ID: {customer.game_id}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {customer.favorite_role && (
            <span className="text-xs font-body text-gray-400">
              {getRoleEmoji(customer.favorite_role)} {customer.favorite_role}
            </span>
          )}
          {customer.last_donation_at && (
            <span className="text-xs font-body text-gray-400">
              Terakhir: {formatShortDate(customer.last_donation_at)}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6 text-center">
        <div>
          <div className="font-display font-bold text-candy-pink">{customer.total_donations}x</div>
          <div className="font-body text-xs text-gray-400">Donasi</div>
        </div>
        <div>
          <div className="font-display font-bold text-candy-purple text-sm">{formatCurrency(customer.total_amount_spent)}</div>
          <div className="font-body text-xs text-gray-400">Total</div>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );
};

export default function CustomersPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  // State
  const [customers, setCustomers] = useState<DonorCustomer[]>([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    avgSpentPerCustomer: 0,
    topTierCount: 0,
    newThisMonth: 0,
    repeatCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [sortBy, setSortBy] = useState('total_amount_spent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<DonorCustomer | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 15;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch data
  const fetchCustomers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, count, totalPages: tp } = await getDonorCustomers(user.id, {
        page: currentPage,
        perPage,
        search: searchQuery || undefined,
        tier: filterTier,
        sortBy,
        sortOrder,
      });
      setCustomers(data || []);
      setTotalCount(count);
      setTotalPages(tp);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    const s = await getDonorCustomerStats(user.id);
    setStats(s);
  };

  useEffect(() => {
    if (user) {
      fetchCustomers();
      fetchStats();
    }
  }, [user, currentPage, filterTier, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchCustomers();
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Handlers
  const handleUpdateNotes = async (id: string, notes: string) => {
    const { error } = await updateDonorCustomer(id, { notes });
    if (!error) {
      setCustomers(customers.map(c => c.id === id ? { ...c, notes } : c));
      if (selectedCustomer?.id === id) {
        setSelectedCustomer({ ...selectedCustomer, notes });
      }
    }
  };

  const handleToggleBlock = async (id: string, blocked: boolean) => {
    const { error } = await updateDonorCustomer(id, { is_blocked: blocked });
    if (!error) {
      setCustomers(customers.map(c => c.id === id ? { ...c, is_blocked: blocked } : c));
      if (selectedCustomer?.id === id) {
        setSelectedCustomer({ ...selectedCustomer, is_blocked: blocked });
      }
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Loading state
  if (authLoading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-candy-purple animate-spin mx-auto mb-4" />
          <p className="font-body text-gray-600">Memuat data pelanggan...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-4 border-candy-purple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl bg-pastel-purple text-candy-purple hover:bg-candy-purple hover:text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-cartoon-dark flex items-center gap-2">
                  <Heart className="w-6 h-6 text-candy-pink" />
                  Daftar Pelanggan
                </h1>
                <p className="font-body text-sm text-gray-500 hidden sm:block">
                  Semua donor dan pelanggan setia kamu
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {profile && (
                <div className="text-right hidden sm:block">
                  <p className="font-display font-bold text-cartoon-dark">{profile.display_name}</p>
                  <p className="font-body text-sm text-gray-500">@{profile.username}</p>
                </div>
              )}
              <button onClick={handleLogout} className="p-3 rounded-xl bg-pastel-pink text-candy-red hover:bg-candy-red hover:text-white transition-all" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Pelanggan"
            value={stats.totalCustomers.toString()}
            color="pink"
          />
          <StatCard
            icon={DollarSign}
            label="Total Pendapatan"
            value={formatCurrency(stats.totalRevenue)}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            label="Rata-rata / Orang"
            value={formatCurrency(stats.avgSpentPerCustomer)}
            color="blue"
          />
          <StatCard
            icon={Crown}
            label="Pelanggan VIP"
            value={stats.topTierCount.toString()}
            subValue="Gold, Platinum, Diamond"
            color="yellow"
          />
          <StatCard
            icon={Star}
            label="Baru Bulan Ini"
            value={stats.newThisMonth.toString()}
            color="green"
          />
          <StatCard
            icon={Heart}
            label="Pelanggan Setia"
            value={stats.repeatCustomers.toString()}
            subValue="Donasi > 1x"
            color="orange"
          />
        </div>

        {/* Tier Legend */}
        <div className="card-cartoon bg-white p-4 mb-6">
          <h3 className="font-display font-bold text-cartoon-dark mb-3 flex items-center gap-2">
            <Gem className="w-5 h-5 text-candy-purple" />
            Tier Pelanggan
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(TIER_CONFIG).map(([key, config]) => (
              <div key={key} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border-2', config.bgColor, config.borderColor)}>
                <span>{config.emoji}</span>
                <span className={cn('font-display font-bold text-sm', config.color)}>{config.label}</span>
                <span className="font-body text-xs text-gray-400">
                  {config.minAmount > 0 ? `${formatCurrency(config.minAmount)}+` : 'Start'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card-cartoon bg-white p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, game ID, atau nickname..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-candy-purple focus:ring-0 font-body text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'px-4 py-3 rounded-xl border-2 font-display font-bold text-sm transition-all flex items-center gap-2',
                showFilters
                  ? 'bg-candy-purple text-white border-candy-purple'
                  : 'bg-white text-candy-purple border-candy-purple hover:bg-pastel-purple'
              )}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            {/* Refresh */}
            <button
              onClick={() => { fetchCustomers(); fetchStats(); }}
              className="px-4 py-3 rounded-xl bg-pastel-blue text-candy-blue hover:bg-candy-blue hover:text-white transition-all border-2 border-candy-blue"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t-2 border-gray-100 flex flex-wrap gap-3">
              {/* Tier Filter */}
              <div className="flex items-center gap-2">
                <span className="font-body text-sm text-gray-500">Tier:</span>
                <div className="flex gap-1">
                  {['all', ...Object.keys(TIER_CONFIG)].map((t) => (
                    <button
                      key={t}
                      onClick={() => { setFilterTier(t); setCurrentPage(1); }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all',
                        filterTier === t
                          ? 'bg-candy-purple text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-pastel-purple hover:text-candy-purple'
                      )}
                    >
                      {t === 'all' ? 'Semua' : TIER_CONFIG[t].emoji + ' ' + TIER_CONFIG[t].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="font-body text-sm text-gray-500">Urutkan:</span>
                <div className="flex gap-1">
                  {[
                    { key: 'total_amount_spent', label: 'Total Belanja' },
                    { key: 'total_donations', label: 'Jumlah Donasi' },
                    { key: 'last_donation_at', label: 'Terakhir Donasi' },
                    { key: 'created_at', label: 'Terdaftar' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleSort(opt.key)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all flex items-center gap-1',
                        sortBy === opt.key
                          ? 'bg-candy-pink text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-pastel-pink hover:text-candy-pink'
                      )}
                    >
                      {opt.label}
                      {sortBy === opt.key && (
                        sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer List */}
        <div className="card-cartoon bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-cartoon-dark flex items-center gap-2">
              <Users className="w-6 h-6 text-candy-purple" />
              Pelanggan ({totalCount})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-candy-purple animate-spin" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💝</div>
              <p className="font-display text-xl text-gray-500 mb-2">
                {searchQuery || filterTier !== 'all' ? 'Tidak ada pelanggan ditemukan' : 'Belum ada pelanggan'}
              </p>
              <p className="font-body text-gray-400">
                {searchQuery || filterTier !== 'all'
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Pelanggan akan otomatis tersimpan saat mereka melakukan donasi mabar'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customers.map((customer, index) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  rank={(currentPage - 1) * perPage + index + 1}
                  onClick={() => setSelectedCustomer(customer)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t-2 border-gray-100">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-pastel-purple text-candy-purple hover:bg-candy-purple hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        'w-10 h-10 rounded-xl font-display font-bold text-sm transition-all',
                        currentPage === pageNum
                          ? 'bg-candy-purple text-white shadow-cartoon'
                          : 'bg-gray-100 text-gray-500 hover:bg-pastel-purple hover:text-candy-purple'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-pastel-purple text-candy-purple hover:bg-candy-purple hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdateNotes={handleUpdateNotes}
          onToggleBlock={handleToggleBlock}
        />
      )}
    </main>
  );
}
