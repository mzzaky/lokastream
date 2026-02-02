'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Settings,
  ArrowLeft,
  Gamepad2,
  DollarSign,
  Users,
  Trophy,
  Bell,
  Palette,
  Save,
  Loader2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Check,
  Plus,
  X,
  Crown,
  Power,
  Gift
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMabarSettings,
  updateMabarSettings,
  createMabarSettings,
  Database
} from '@/lib/supabase';
import { cn, formatCurrency, getGameTypeLabel, getGameTypeEmoji, getRoleEmoji } from '@/lib/utils';
import { toast } from 'sonner';

type MabarSettings = Database['public']['Tables']['mabar_settings']['Row'];

// Settings Section Card Component
const SettingsSection = ({
  icon: Icon,
  title,
  description,
  color,
  children
}: {
  icon: any;
  title: string;
  description: string;
  color: 'pink' | 'purple' | 'blue' | 'yellow' | 'green' | 'orange';
  children: React.ReactNode;
}) => {
  const colorClasses = {
    pink: 'border-candy-pink bg-pastel-pink',
    purple: 'border-candy-purple bg-pastel-purple',
    blue: 'border-candy-blue bg-pastel-blue',
    yellow: 'border-candy-yellow bg-pastel-yellow',
    green: 'border-candy-green bg-pastel-mint',
    orange: 'border-candy-orange bg-pastel-peach',
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
    <div className="card-cartoon bg-white overflow-hidden">
      <div className={cn('p-4 border-b-2', colorClasses[color])}>
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconColors[color])}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-cartoon-dark">{title}</h3>
            <p className="font-body text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
};

// Form Field Component
const FormField = ({
  label,
  hint,
  children,
  required
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div>
    <label className="font-body text-sm font-medium text-gray-700 mb-1 block">
      {label} {required && <span className="text-candy-red">*</span>}
    </label>
    {children}
    {hint && <p className="font-body text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

// Role Tag Component
const RoleTag = ({
  role,
  onRemove
}: {
  role: string;
  onRemove: () => void;
}) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-pastel-purple rounded-full border-2 border-candy-purple text-sm font-display font-bold text-candy-purple">
    <span>{getRoleEmoji(role)}</span>
    {role}
    <button
      onClick={onRemove}
      className="ml-1 w-4 h-4 rounded-full bg-candy-purple text-white flex items-center justify-center hover:bg-candy-red transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, profileError } = useAuth();

  // State
  const [settings, setSettings] = useState<MabarSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newRole, setNewRole] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    game_type: 'mobile_legends',
    price_per_slot: 10000,
    currency: 'IDR',
    max_queue_size: 50,
    min_players_to_start: 1,
    roles: ['Exp', 'Jungle', 'Mid', 'Gold', 'Roam'],
    mvp_reward_enabled: true,
    mvp_win_count: 3,
    mvp_reward_description: 'Gratis 1x mabar!',
    notification_sound: 'default',
    is_active: true,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await getMabarSettings(user.id);

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setSettings(data);
          setFormData({
            game_type: data.game_type || 'mobile_legends',
            price_per_slot: data.price_per_slot || 10000,
            currency: data.currency || 'IDR',
            max_queue_size: data.max_queue_size || 50,
            min_players_to_start: data.min_players_to_start || 1,
            roles: data.roles || ['Exp', 'Jungle', 'Mid', 'Gold', 'Roam'],
            mvp_reward_enabled: data.mvp_reward_enabled ?? true,
            mvp_win_count: data.mvp_win_count || 3,
            mvp_reward_description: data.mvp_reward_description || 'Gratis 1x mabar!',
            notification_sound: data.notification_sound || 'default',
            is_active: data.is_active ?? true,
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Gagal memuat pengaturan');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  // Handle form change
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle add role
  const handleAddRole = () => {
    if (newRole.trim() && !formData.roles.includes(newRole.trim())) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, newRole.trim()]
      }));
      setNewRole('');
    }
  };

  // Handle remove role
  const handleRemoveRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r !== role)
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const settingsData = {
        game_type: formData.game_type,
        price_per_slot: formData.price_per_slot,
        currency: formData.currency,
        max_queue_size: formData.max_queue_size,
        min_players_to_start: formData.min_players_to_start,
        roles: formData.roles,
        mvp_reward_enabled: formData.mvp_reward_enabled,
        mvp_win_count: formData.mvp_win_count,
        mvp_reward_description: formData.mvp_reward_description,
        notification_sound: formData.notification_sound,
        is_active: formData.is_active,
      };

      if (settings) {
        // Update existing settings
        const { data, error } = await updateMabarSettings(settings.id, settingsData);
        if (error) throw error;
        setSettings(data);
        toast.success('Pengaturan berhasil disimpan!');
      } else {
        // Create new settings
        const { data, error } = await createMabarSettings({
          streamer_id: user.id,
          ...settingsData
        });
        if (error) throw error;
        setSettings(data);
        toast.success('Pengaturan berhasil dibuat!');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
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
          <p className="font-body text-gray-600">Memuat pengaturan...</p>
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
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-4 border-candy-pink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Back & Logo */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl bg-pastel-pink text-candy-pink hover:bg-candy-pink hover:text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-candy-pink to-candy-purple rounded-2xl flex items-center justify-center shadow-cartoon">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="font-display text-2xl font-bold text-gradient">Pengaturan Mabar</span>
                  <p className="font-body text-sm text-gray-500">Kustomisasi pengalaman mabar</p>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-candy-purple animate-spin mx-auto mb-4" />
            <p className="font-body text-gray-600">Memuat pengaturan...</p>
          </div>
        ) : error ? (
          <div className="card-cartoon bg-red-50 border-red-400 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="font-display text-lg font-bold text-red-600 mb-2">Terjadi Kesalahan</p>
            <p className="font-body text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn-cartoon-pink"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            {/* Status Banner */}
            <div className={cn(
              'mb-6 p-4 rounded-2xl border-3 flex items-center justify-between',
              formData.is_active
                ? 'bg-pastel-mint border-candy-green'
                : 'bg-gray-100 border-gray-300'
            )}>
              <div className="flex items-center gap-3">
                <Power className={cn('w-6 h-6', formData.is_active ? 'text-green-600' : 'text-gray-500')} />
                <div>
                  <p className={cn('font-display font-bold', formData.is_active ? 'text-green-700' : 'text-gray-600')}>
                    {formData.is_active ? 'Mabar Aktif' : 'Mabar Nonaktif'}
                  </p>
                  <p className="font-body text-sm text-gray-500">
                    {formData.is_active ? 'Viewers dapat bergabung ke antrian' : 'Antrian ditutup sementara'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleChange('is_active', !formData.is_active)}
                className={cn(
                  'px-4 py-2 rounded-xl font-display font-bold transition-all',
                  formData.is_active
                    ? 'bg-candy-green text-white hover:bg-green-600'
                    : 'bg-gray-400 text-white hover:bg-gray-500'
                )}
              >
                {formData.is_active ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
              {/* Game Settings */}
              <SettingsSection
                icon={Gamepad2}
                title="Pengaturan Game"
                description="Pilih jenis game yang akan dimainkan"
                color="purple"
              >
                <FormField label="Jenis Game" required>
                  <select
                    value={formData.game_type}
                    onChange={(e) => handleChange('game_type', e.target.value)}
                    className="input-cartoon w-full"
                  >
                    <option value="mobile_legends">Mobile Legends</option>
                    <option value="pubg_mobile">PUBG Mobile</option>
                    <option value="free_fire">Free Fire</option>
                    <option value="valorant">Valorant</option>
                    <option value="other">Lainnya</option>
                  </select>
                </FormField>

                <div className="p-4 bg-pastel-purple rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getGameTypeEmoji(formData.game_type)}</span>
                    <div>
                      <p className="font-display font-bold text-candy-purple">
                        {getGameTypeLabel(formData.game_type)}
                      </p>
                      <p className="font-body text-sm text-gray-600">
                        Game yang dipilih saat ini
                      </p>
                    </div>
                  </div>
                </div>
              </SettingsSection>

              {/* Pricing Settings */}
              <SettingsSection
                icon={DollarSign}
                title="Pengaturan Harga"
                description="Tentukan biaya untuk bergabung mabar"
                color="yellow"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Harga per Slot" required hint="Harga dalam Rupiah">
                    <input
                      type="number"
                      value={formData.price_per_slot}
                      onChange={(e) => handleChange('price_per_slot', parseInt(e.target.value) || 0)}
                      className="input-cartoon w-full"
                      min="0"
                      step="1000"
                    />
                  </FormField>

                  <FormField label="Mata Uang">
                    <select
                      value={formData.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="input-cartoon w-full"
                    >
                      <option value="IDR">IDR - Rupiah Indonesia</option>
                      <option value="USD">USD - US Dollar</option>
                    </select>
                  </FormField>
                </div>

                <div className="p-4 bg-pastel-yellow rounded-xl">
                  <p className="font-body text-sm text-gray-600">Preview harga:</p>
                  <p className="font-display text-2xl font-bold text-yellow-700">
                    {formatCurrency(formData.price_per_slot, formData.currency)}
                  </p>
                </div>
              </SettingsSection>

              {/* Queue Settings */}
              <SettingsSection
                icon={Users}
                title="Pengaturan Antrian"
                description="Atur kapasitas dan batasan antrian"
                color="blue"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Maksimal Antrian" required hint="Jumlah maksimal pemain di antrian">
                    <input
                      type="number"
                      value={formData.max_queue_size}
                      onChange={(e) => handleChange('max_queue_size', parseInt(e.target.value) || 1)}
                      className="input-cartoon w-full"
                      min="1"
                      max="999"
                    />
                  </FormField>

                  <FormField label="Min. Pemain untuk Mulai" hint="Minimal pemain untuk mulai game">
                    <input
                      type="number"
                      value={formData.min_players_to_start}
                      onChange={(e) => handleChange('min_players_to_start', parseInt(e.target.value) || 1)}
                      className="input-cartoon w-full"
                      min="1"
                      max="10"
                    />
                  </FormField>
                </div>
              </SettingsSection>

              {/* Role Settings */}
              <SettingsSection
                icon={Crown}
                title="Pengaturan Role"
                description="Daftar role yang tersedia untuk pemain"
                color="pink"
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.roles.map((role) => (
                    <RoleTag
                      key={role}
                      role={role}
                      onRemove={() => handleRemoveRole(role)}
                    />
                  ))}
                  {formData.roles.length === 0 && (
                    <p className="font-body text-gray-500 text-sm">Belum ada role. Tambahkan role di bawah.</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Nama role baru..."
                    className="input-cartoon flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
                  />
                  <button
                    onClick={handleAddRole}
                    disabled={!newRole.trim()}
                    className="btn-cartoon-pink disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5 mr-1" />
                    Tambah
                  </button>
                </div>

                <p className="font-body text-xs text-gray-500">
                  Tekan Enter atau klik Tambah untuk menambah role baru
                </p>
              </SettingsSection>

              {/* MVP Reward Settings */}
              <SettingsSection
                icon={Trophy}
                title="Pengaturan MVP Reward"
                description="Hadiah untuk pemain terbaik"
                color="green"
              >
                <div className="flex items-center justify-between p-4 bg-pastel-mint rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <Gift className={cn('w-6 h-6', formData.mvp_reward_enabled ? 'text-green-600' : 'text-gray-400')} />
                    <div>
                      <p className="font-display font-bold text-cartoon-dark">MVP Reward</p>
                      <p className="font-body text-sm text-gray-500">
                        {formData.mvp_reward_enabled ? 'Hadiah aktif' : 'Hadiah nonaktif'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChange('mvp_reward_enabled', !formData.mvp_reward_enabled)}
                    className={cn(
                      'w-14 h-8 rounded-full transition-all relative',
                      formData.mvp_reward_enabled ? 'bg-candy-green' : 'bg-gray-300'
                    )}
                  >
                    <span className={cn(
                      'absolute w-6 h-6 bg-white rounded-full top-1 transition-all shadow-md',
                      formData.mvp_reward_enabled ? 'left-7' : 'left-1'
                    )} />
                  </button>
                </div>

                {formData.mvp_reward_enabled && (
                  <>
                    <FormField label="Jumlah MVP untuk Reward" hint="Berapa kali MVP untuk mendapat hadiah">
                      <input
                        type="number"
                        value={formData.mvp_win_count}
                        onChange={(e) => handleChange('mvp_win_count', parseInt(e.target.value) || 1)}
                        className="input-cartoon w-full"
                        min="1"
                        max="100"
                      />
                    </FormField>

                    <FormField label="Deskripsi Hadiah" hint="Jelaskan hadiah yang didapat">
                      <textarea
                        value={formData.mvp_reward_description}
                        onChange={(e) => handleChange('mvp_reward_description', e.target.value)}
                        className="input-cartoon w-full resize-none"
                        rows={3}
                        placeholder="Contoh: Gratis 1x mabar!"
                      />
                    </FormField>

                    <div className="p-4 bg-pastel-yellow rounded-xl border-2 border-candy-yellow">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <span className="font-display font-bold text-yellow-700">Preview Reward</span>
                      </div>
                      <p className="font-body text-gray-700">
                        Dapatkan <strong className="text-candy-pink">{formData.mvp_win_count}x MVP</strong> untuk mendapat: <strong className="text-candy-purple">{formData.mvp_reward_description}</strong>
                      </p>
                    </div>
                  </>
                )}
              </SettingsSection>

              {/* Notification Settings */}
              <SettingsSection
                icon={Bell}
                title="Pengaturan Notifikasi"
                description="Kustomisasi suara dan alert"
                color="orange"
              >
                <FormField label="Suara Notifikasi" hint="Suara yang diputar saat ada antrian baru">
                  <select
                    value={formData.notification_sound}
                    onChange={(e) => handleChange('notification_sound', e.target.value)}
                    className="input-cartoon w-full"
                  >
                    <option value="default">Default</option>
                    <option value="chime">Chime</option>
                    <option value="bell">Bell</option>
                    <option value="pop">Pop</option>
                    <option value="none">Tanpa Suara</option>
                  </select>
                </FormField>
              </SettingsSection>
            </div>

            {/* Save Button */}
            <div className="mt-8 sticky bottom-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full btn-cartoon-purple py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-cartoon-purple"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 mr-2" />
                    Simpan Pengaturan
                  </>
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-pastel-blue rounded-xl">
              <p className="font-body text-sm text-gray-600">
                <strong>Tips:</strong> Pengaturan akan langsung berlaku setelah disimpan. Viewers akan melihat perubahan saat halaman mabar di-refresh.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
