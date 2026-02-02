'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Users,
  User,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Crown,
  Star,
  AlertCircle,
  Loader2,
  Shield,
  Clock,
  Zap,
  Gift,
  Copy,
  CheckCircle2,
  XCircle,
  RefreshCw,
  QrCode,
  Wallet,
  Building2,
  Smartphone,
  ArrowRight,
  Timer,
  Info,
  TrendingUp,
  Heart
} from 'lucide-react';
import { cn, formatCurrency, getRoleEmoji } from '@/lib/utils';
import { FloatingShapes, SectionIcons } from '@/components/CartoonElements';
import {
  getMabarSettingsByUsername,
  getQueueEntries,
  addToQueue,
  getNextQueuePosition,
  subscribeToQueue,
  supabase
} from '@/lib/supabase';
import { toast } from 'sonner';

// Types
interface StreamerData {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface MabarSettingsData {
  id: string;
  streamer_id: string;
  game_type: string;
  price_per_slot: number;
  currency: string;
  max_queue_size: number;
  roles: { id: string; name: string; icon: string; max_count: number }[];
  mvp_reward_enabled: boolean;
  mvp_reward_description: string;
  mvp_win_count: number;
  is_active: boolean;
}

interface QueueEntryData {
  id: string;
  player_name: string;
  game_nickname: string;
  selected_role: string;
  queue_position: number;
  status: string;
  payment_status: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'ewallet' | 'qris' | 'bank' | 'convenience';
  color: string;
  description: string;
  processingTime: string;
}

// Payment Methods Configuration
const paymentMethods: PaymentMethod[] = [
  {
    id: 'qris',
    name: 'QRIS',
    icon: <QrCode className="w-6 h-6" />,
    type: 'qris',
    color: 'from-blue-500 to-purple-600',
    description: 'Scan QR dengan aplikasi apapun',
    processingTime: 'Instan'
  },
  {
    id: 'gopay',
    name: 'GoPay',
    icon: <Wallet className="w-6 h-6" />,
    type: 'ewallet',
    color: 'from-green-400 to-green-600',
    description: 'Bayar via GoPay',
    processingTime: 'Instan'
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    icon: <Wallet className="w-6 h-6" />,
    type: 'ewallet',
    color: 'from-orange-400 to-red-500',
    description: 'Bayar via ShopeePay',
    processingTime: 'Instan'
  },
  {
    id: 'dana',
    name: 'DANA',
    icon: <Wallet className="w-6 h-6" />,
    type: 'ewallet',
    color: 'from-blue-400 to-blue-600',
    description: 'Bayar via DANA',
    processingTime: 'Instan'
  },
  {
    id: 'ovo',
    name: 'OVO',
    icon: <Wallet className="w-6 h-6" />,
    type: 'ewallet',
    color: 'from-purple-400 to-purple-600',
    description: 'Bayar via OVO',
    processingTime: 'Instan'
  },
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    icon: <Building2 className="w-6 h-6" />,
    type: 'bank',
    color: 'from-blue-600 to-blue-800',
    description: 'Transfer via BCA',
    processingTime: '1-5 menit'
  },
  {
    id: 'bni_va',
    name: 'BNI Virtual Account',
    icon: <Building2 className="w-6 h-6" />,
    type: 'bank',
    color: 'from-orange-500 to-orange-700',
    description: 'Transfer via BNI',
    processingTime: '1-5 menit'
  },
  {
    id: 'mandiri_va',
    name: 'Mandiri Virtual Account',
    icon: <Building2 className="w-6 h-6" />,
    type: 'bank',
    color: 'from-blue-700 to-yellow-500',
    description: 'Transfer via Mandiri',
    processingTime: '1-5 menit'
  },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

// Role Selection Card Component
const RoleCard = ({
  role,
  selected,
  onSelect,
  disabled
}: {
  role: { id: string; name: string; icon: string; max_count: number };
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) => (
  <motion.button
    onClick={onSelect}
    disabled={disabled}
    whileHover={!disabled ? { scale: 1.02, y: -4 } : {}}
    whileTap={!disabled ? { scale: 0.98 } : {}}
    className={cn(
      'p-5 rounded-[24px] border-4 transition-all text-left w-full relative overflow-hidden group',
      selected
        ? 'bg-gradient-to-br from-[var(--accent-pink)] from-opacity-20 to-[var(--accent-purple)] to-opacity-20 border-[var(--accent-pink)] shadow-[8px_8px_0_var(--accent-pink)]'
        : disabled
          ? 'bg-[var(--bg-secondary)] border-[var(--border-color)] border-opacity-20 opacity-50 cursor-not-allowed'
          : 'bg-[var(--bg-card)] border-[var(--border-color)] border-opacity-20 hover:border-[var(--accent-purple)] hover:shadow-[6px_6px_0_var(--accent-purple)]'
    )}
  >
    {/* Shine effect */}
    {!disabled && (
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>
    )}

    <div className="flex items-center gap-4 relative z-10">
      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-3 border-[var(--border-color)] transition-all shadow-[4px_4px_0_rgba(0,0,0,0.1)]',
        selected
          ? 'bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)] shadow-lg'
          : 'bg-gradient-to-br from-[var(--accent-purple)] from-opacity-20 to-[var(--accent-blue)] to-opacity-20'
      )}>
        {role.icon}
      </div>
      <div className="flex-1">
        <div className="font-display font-bold text-lg text-[var(--text-primary)]">{role.name}</div>
        <div className="font-hand text-sm text-[var(--text-secondary)] flex items-center gap-2">
          <Users className="w-4 h-4" />
          {role.max_count} slot tersedia
        </div>
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-12 h-12 bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)] rounded-full flex items-center justify-center text-white border-3 border-[var(--border-color)] shadow-lg"
        >
          <Check className="w-6 h-6" />
        </motion.div>
      )}
    </div>
  </motion.button>
);

// Step Indicator Component
const StepIndicator = ({ currentStep, steps }: { currentStep: number; steps: { label: string; icon: React.ReactNode }[] }) => (
  <div className="flex items-center justify-center gap-1 md:gap-3 mb-8">
    {steps.map((step, index) => (
      <div key={index} className="flex items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-display font-bold text-lg transition-all border-3',
            index + 1 === currentStep
              ? 'bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] text-white border-[var(--border-color)] shadow-[6px_6px_0_var(--accent-purple)] scale-110'
              : index + 1 < currentStep
                ? 'bg-[var(--accent-green)] text-white border-[var(--border-color)] shadow-[4px_4px_0_rgba(0,0,0,0.1)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] border-opacity-30'
          )}
        >
          {index + 1 < currentStep ? <Check className="w-5 h-5" /> : step.icon}
        </motion.div>
        {index < steps.length - 1 && (
          <div className={cn(
            'w-8 md:w-16 h-2 mx-1 md:mx-2 rounded-full transition-colors border-2 border-[var(--border-color)] border-opacity-30',
            index + 1 < currentStep ? 'bg-[var(--accent-green)]' : 'bg-[var(--bg-secondary)]'
          )} />
        )}
      </div>
    ))}
  </div>
);

// Queue Preview Item Component
const QueuePreviewItem = ({ entry, index }: { entry: QueueEntryData; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-center gap-3 p-3 bg-[var(--bg-primary)] bg-opacity-60 rounded-2xl border-2 border-[var(--border-color)] border-opacity-20 backdrop-blur-sm"
  >
    <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] rounded-full flex items-center justify-center font-display font-bold text-white text-sm border-2 border-[var(--border-color)] shadow-md">
      {entry.queue_position}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-display font-semibold text-sm text-[var(--text-primary)] truncate">
        {entry.player_name}
      </div>
      <div className="font-hand text-xs text-[var(--text-secondary)] flex items-center gap-1">
        <span>{getRoleEmoji(entry.selected_role)}</span>
        <span className="truncate">{entry.selected_role}</span>
      </div>
    </div>
    {entry.payment_status === 'completed' && (
      <div className="w-6 h-6 bg-[var(--accent-green)] rounded-full flex items-center justify-center">
        <Check className="w-3 h-3 text-white" />
      </div>
    )}
  </motion.div>
);

// Payment Method Card Component
const PaymentMethodCard = ({
  method,
  selected,
  onSelect
}: {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}) => (
  <motion.button
    onClick={onSelect}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      'w-full flex items-center gap-4 p-4 rounded-2xl border-3 transition-all text-left relative overflow-hidden group',
      selected
        ? 'border-[var(--accent-pink)] bg-gradient-to-r from-[var(--accent-pink)]/10 to-[var(--accent-purple)]/10 shadow-[6px_6px_0_var(--accent-pink)]'
        : 'border-[var(--border-color)] border-opacity-20 bg-[var(--bg-card)] hover:border-[var(--accent-purple)] hover:shadow-[4px_4px_0_var(--accent-purple)]'
    )}
  >
    <div className={cn(
      'w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg',
      method.color
    )}>
      {method.icon}
    </div>
    <div className="flex-1">
      <div className="font-display font-bold text-[var(--text-primary)]">{method.name}</div>
      <div className="font-hand text-sm text-[var(--text-secondary)] flex items-center gap-2">
        <Clock className="w-3 h-3" />
        {method.processingTime}
      </div>
    </div>
    {selected && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-8 h-8 bg-[var(--accent-pink)] rounded-full flex items-center justify-center"
      >
        <Check className="w-4 h-4 text-white" />
      </motion.div>
    )}
  </motion.button>
);

// Live Badge Component
const LiveBadge = () => (
  <motion.div
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ repeat: Infinity, duration: 2 }}
    className="flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full"
  >
    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
    <span className="font-display font-bold text-xs text-white">LIVE</span>
  </motion.div>
);

// Main Page Component
export default function MabarPage({ params }: { params: { streamer: string } }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    player_name: '',
    game_id: '',
    game_nickname: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  // Data states
  const [streamerData, setStreamerData] = useState<StreamerData | null>(null);
  const [mabarSettings, setMabarSettings] = useState<MabarSettingsData | null>(null);
  const [queueEntries, setQueueEntries] = useState<QueueEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment states
  const [paymentData, setPaymentData] = useState<{
    payment_url?: string;
    va_number?: string;
    qr_code_url?: string;
    order_id?: string;
    expiry_time?: string;
  } | null>(null);
  const [paymentCountdown, setPaymentCountdown] = useState<number>(0);

  // Fetch streamer and mabar settings data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: settings, error: settingsError, user } = await getMabarSettingsByUsername(params.streamer);

        if (settingsError || !settings || !user) {
          setError('Streamer tidak ditemukan atau belum mengaktifkan mabar');
          setIsLoading(false);
          return;
        }

        setStreamerData({
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url
        });

        setMabarSettings(settings);

        // Fetch queue entries
        const { data: queueData } = await getQueueEntries(user.id, ['waiting', 'selected', 'playing']);
        if (queueData) {
          setQueueEntries(queueData);
        }
      } catch (err) {
        setError('Terjadi kesalahan saat memuat data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.streamer]);

  // Subscribe to queue updates
  useEffect(() => {
    if (!streamerData?.id) return;

    const channel = subscribeToQueue(streamerData.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        setQueueEntries(prev => [...prev, payload.new as QueueEntryData].sort((a, b) => a.queue_position - b.queue_position));
      } else if (payload.eventType === 'UPDATE') {
        setQueueEntries(prev => prev.map(entry =>
          entry.id === payload.new.id ? payload.new as QueueEntryData : entry
        ));
      } else if (payload.eventType === 'DELETE') {
        setQueueEntries(prev => prev.filter(entry => entry.id !== payload.old.id));
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamerData?.id]);

  // Payment countdown timer
  useEffect(() => {
    if (paymentCountdown > 0) {
      const timer = setTimeout(() => setPaymentCountdown(paymentCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [paymentCountdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!mabarSettings || !streamerData || !selectedPaymentMethod) {
      toast.error('Silakan pilih metode pembayaran');
      return;
    }

    setIsSubmitting(true);
    setPaymentStatus('processing');

    try {
      // Get next queue position
      const { position } = await getNextQueuePosition(mabarSettings.id);

      // Create payment transaction
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamer_id: streamerData.id,
          mabar_settings_id: mabarSettings.id,
          player_name: formData.player_name,
          game_id: formData.game_id,
          game_nickname: formData.game_nickname,
          selected_role: selectedRole,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          amount: mabarSettings.price_per_slot,
          payment_method: selectedPaymentMethod,
          queue_position: position
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal membuat transaksi');
      }

      setPaymentData(result.data);
      setQueuePosition(position);
      setPaymentCountdown(15 * 60); // 15 minutes countdown
      setPaymentStatus('success');
      setIsSuccess(true);
      setCurrentStep(4); // Go to payment instruction step

      toast.success('Transaksi berhasil dibuat!');
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast.error(error instanceof Error ? error.message : 'Gagal memproses pembayaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = selectedRole !== null;
  const canProceedStep2 = formData.player_name && formData.game_id && formData.game_nickname;
  const canProceedStep3 = selectedPaymentMethod !== null;

  const steps = [
    { label: 'Pilih Role', icon: <Gamepad2 className="w-5 h-5" /> },
    { label: 'Data Diri', icon: <User className="w-5 h-5" /> },
    { label: 'Pembayaran', icon: <CreditCard className="w-5 h-5" /> },
  ];

  // Format countdown time
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <FloatingShapes />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-cartoon text-center p-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Loader2 className="w-16 h-16 text-[var(--accent-purple)] mx-auto" />
          </motion.div>
          <p className="font-display text-xl text-[var(--text-primary)] mt-6">Memuat data...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
        <FloatingShapes />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-cartoon text-center max-w-md w-full p-8"
        >
          <div className="text-6xl mb-6">😢</div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">
            Oops!
          </h1>
          <p className="font-hand text-lg text-[var(--text-secondary)] mb-6">
            {error}
          </p>
          <Link href="/" className="btn-cartoon-purple">
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </motion.div>
      </div>
    );
  }

  // Payment Success/Instructions Page
  if (currentStep === 4 && paymentData) {
    return (
      <div className="min-h-screen pb-12 bg-[var(--bg-primary)] relative overflow-hidden">
        <FloatingShapes />

        {/* Header */}
        <header className="navbar !rounded-none !top-0 !left-0 !right-0 !mx-0 !mt-0 !border-t-0 !rounded-b-[30px]">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)] rounded-2xl flex items-center justify-center shadow-cartoon group-hover:rotate-12 transition-transform border-3 border-[var(--border-color)]">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-[var(--text-primary)]">LokaStream</span>
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 pt-28 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Success Header */}
            <div className="card-cartoon text-center bg-gradient-to-br from-[var(--accent-green)]/10 to-[var(--accent-blue)]/10 border-[var(--accent-green)]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
                Transaksi Berhasil Dibuat!
              </h1>
              <p className="font-hand text-lg text-[var(--text-secondary)]">
                Segera selesaikan pembayaran untuk masuk ke antrian
              </p>
            </div>

            {/* Payment Timer */}
            <div className="card-cartoon bg-gradient-to-br from-[var(--accent-orange)]/10 to-[var(--accent-yellow)]/10 border-[var(--accent-orange)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer className="w-8 h-8 text-[var(--accent-orange)]" />
                  <div>
                    <div className="font-hand text-sm text-[var(--text-secondary)]">Batas Waktu Pembayaran</div>
                    <div className="font-display text-2xl font-bold text-[var(--accent-orange)]">
                      {formatCountdown(paymentCountdown)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-hand text-sm text-[var(--text-secondary)]">Total Bayar</div>
                  <div className="font-display text-xl font-bold text-[var(--text-primary)]">
                    {formatCurrency(mabarSettings?.price_per_slot || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="card-cartoon">
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-[var(--accent-blue)]" />
                Instruksi Pembayaran
              </h2>

              {/* QRIS */}
              {selectedPaymentMethod === 'qris' && paymentData.qr_code_url && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl border-3 border-[var(--border-color)]">
                    <img
                      src={paymentData.qr_code_url}
                      alt="QRIS Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <ol className="space-y-3 font-hand text-[var(--text-secondary)]">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[var(--accent-purple)] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">1</span>
                      <span>Buka aplikasi e-wallet atau mobile banking kamu</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[var(--accent-purple)] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">2</span>
                      <span>Pilih menu "Scan QR" atau "QRIS"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[var(--accent-purple)] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">3</span>
                      <span>Scan QR code di atas dan konfirmasi pembayaran</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Virtual Account */}
              {paymentData.va_number && (
                <div className="space-y-4">
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-2xl border-3 border-[var(--border-color)]">
                    <div className="font-hand text-sm text-[var(--text-secondary)] mb-2">Nomor Virtual Account</div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-wider">
                        {paymentData.va_number}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(paymentData.va_number || '');
                          toast.success('Nomor VA berhasil disalin!');
                        }}
                        className="p-2 hover:bg-[var(--accent-purple)]/20 rounded-lg transition-colors"
                      >
                        <Copy className="w-5 h-5 text-[var(--accent-purple)]" />
                      </button>
                    </div>
                  </div>
                  <ol className="space-y-3 font-hand text-[var(--text-secondary)]">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[var(--accent-purple)] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">1</span>
                      <span>Buka aplikasi mobile banking atau ATM</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[var(--accent-purple)] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">2</span>
                      <span>Pilih menu "Transfer" kemudian "Virtual Account"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[var(--accent-purple)] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">3</span>
                      <span>Masukkan nomor VA di atas dan konfirmasi pembayaran</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* E-Wallet Deep Link */}
              {paymentData.payment_url && ['gopay', 'shopeepay', 'dana', 'ovo'].includes(selectedPaymentMethod || '') && (
                <div className="space-y-4">
                  <a
                    href={paymentData.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cartoon-pink w-full justify-center"
                  >
                    <Smartphone className="w-5 h-5" />
                    Buka Aplikasi {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                  </a>
                  <p className="font-hand text-sm text-[var(--text-secondary)] text-center">
                    Atau scan QRIS di bawah dengan aplikasi {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                  </p>
                </div>
              )}
            </div>

            {/* Queue Position Preview */}
            <div className="card-cartoon bg-gradient-to-br from-[var(--accent-purple)]/10 to-[var(--accent-pink)]/10 border-[var(--accent-purple)]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] rounded-2xl flex items-center justify-center text-white font-display text-2xl font-bold border-3 border-[var(--border-color)] shadow-lg">
                  #{queuePosition}
                </div>
                <div>
                  <div className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Posisi Antrian Kamu
                  </div>
                  <div className="font-hand text-[var(--text-secondary)]">
                    Perkiraan waktu: ~{(queuePosition || 1) * 15} menit
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="card-cartoon bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]">
              <h3 className="font-display font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[var(--accent-blue)]" />
                Catatan Penting
              </h3>
              <ul className="space-y-2 font-hand text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[var(--accent-green)] mt-1 shrink-0" />
                  <span>Pembayaran akan otomatis dikonfirmasi dalam 1-5 menit</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[var(--accent-green)] mt-1 shrink-0" />
                  <span>Posisi antrian akan muncul di stream setelah pembayaran dikonfirmasi</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[var(--accent-green)] mt-1 shrink-0" />
                  <span>Tetap pantau stream untuk mengetahui giliran bermainmu</span>
                </li>
              </ul>
            </div>

            {/* Back to Stream */}
            <Link
              href={`/mabar/${params.streamer}`}
              className="btn-cartoon-purple w-full justify-center"
            >
              <RefreshCw className="w-5 h-5" />
              Daftar Antrian Lagi
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-[var(--bg-primary)] relative overflow-hidden">
      <FloatingShapes />

      {/* Header */}
      <header className="navbar !rounded-none !top-0 !left-0 !right-0 !mx-0 !mt-0 !border-t-0 !rounded-b-[30px]">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)] rounded-2xl flex items-center justify-center shadow-cartoon group-hover:rotate-12 transition-transform border-3 border-[var(--border-color)]">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-[var(--text-primary)]">LokaStream</span>
          </Link>

          {/* Streamer Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="font-display font-bold text-[var(--text-primary)]">
                {streamerData?.display_name}
              </div>
              <div className="flex items-center gap-2 justify-end">
                <LiveBadge />
                <span className="font-hand text-sm text-[var(--text-secondary)]">
                  {mabarSettings?.game_type.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)] flex items-center justify-center text-2xl border-3 border-[var(--border-color)] shadow-cartoon overflow-hidden">
              {streamerData?.avatar_url ? (
                <img src={streamerData.avatar_url} alt={streamerData.display_name} className="w-full h-full object-cover" />
              ) : (
                '🎮'
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-28 relative z-10">
        <StepIndicator currentStep={currentStep} steps={steps} />

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Role Selection */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="card-cartoon"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)] rounded-2xl flex items-center justify-center shadow-lg">
                      <Gamepad2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                        Pilih Role
                      </h2>
                      <p className="font-hand text-[var(--text-secondary)]">
                        Pilih role yang ingin kamu mainkan
                      </p>
                    </div>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid sm:grid-cols-2 gap-4 mb-8 mt-6"
                  >
                    {mabarSettings?.roles.map((role) => (
                      <motion.div key={role.id} variants={itemVariants}>
                        <RoleCard
                          role={role}
                          selected={selectedRole === role.id}
                          onSelect={() => setSelectedRole(role.id)}
                          disabled={role.max_count === 0}
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.button
                    onClick={handleNextStep}
                    disabled={!canProceedStep1}
                    whileHover={canProceedStep1 ? { scale: 1.02 } : {}}
                    whileTap={canProceedStep1 ? { scale: 0.98 } : {}}
                    className={cn(
                      'w-full btn-cartoon-purple',
                      !canProceedStep1 && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span>Lanjut ke Data Diri</span>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2: Personal Info */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="card-cartoon"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                        Data Diri
                      </h2>
                      <p className="font-hand text-[var(--text-secondary)]">
                        Isi data untuk keperluan mabar
                      </p>
                    </div>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-5 mb-8"
                  >
                    <motion.div variants={itemVariants}>
                      <label className="font-display font-semibold text-[var(--text-primary)] block mb-2">
                        Nama Panggilan <span className="text-[var(--accent-pink)]">*</span>
                      </label>
                      <input
                        type="text"
                        name="player_name"
                        value={formData.player_name}
                        onChange={handleInputChange}
                        placeholder="Contoh: GamerPro"
                        className="input-cartoon"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="font-display font-semibold text-[var(--text-primary)] block mb-2">
                        ID Game <span className="text-[var(--accent-pink)]">*</span>
                      </label>
                      <input
                        type="text"
                        name="game_id"
                        value={formData.game_id}
                        onChange={handleInputChange}
                        placeholder="Contoh: 123456789"
                        className="input-cartoon"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="font-display font-semibold text-[var(--text-primary)] block mb-2">
                        Nickname In-Game <span className="text-[var(--accent-pink)]">*</span>
                      </label>
                      <input
                        type="text"
                        name="game_nickname"
                        value={formData.game_nickname}
                        onChange={handleInputChange}
                        placeholder="Contoh: ProPlayer"
                        className="input-cartoon"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="font-display font-semibold text-[var(--text-primary)] block mb-2">
                        Email (Opsional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Contoh: email@example.com"
                        className="input-cartoon"
                      />
                      <p className="font-hand text-sm text-[var(--text-secondary)] mt-2">
                        Untuk notifikasi dan bukti pembayaran
                      </p>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="font-display font-semibold text-[var(--text-primary)] block mb-2">
                        No. WhatsApp (Opsional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Contoh: 08123456789"
                        className="input-cartoon"
                      />
                    </motion.div>
                  </motion.div>

                  <div className="flex gap-4">
                    <motion.button
                      onClick={handlePrevStep}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-cartoon-blue !bg-[var(--bg-card)]"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Kembali</span>
                    </motion.button>
                    <motion.button
                      onClick={handleNextStep}
                      disabled={!canProceedStep2}
                      whileHover={canProceedStep2 ? { scale: 1.02 } : {}}
                      whileTap={canProceedStep2 ? { scale: 0.98 } : {}}
                      className={cn(
                        'flex-1 btn-cartoon-purple',
                        !canProceedStep2 && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span>Lanjut ke Pembayaran</span>
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="card-cartoon"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] rounded-2xl flex items-center justify-center shadow-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                        Pembayaran
                      </h2>
                      <p className="font-hand text-[var(--text-secondary)]">
                        Pilih metode pembayaran
                      </p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-br from-[var(--accent-purple)]/10 to-[var(--accent-pink)]/10 rounded-2xl p-5 mb-6 border-3 border-[var(--accent-purple)]/30">
                    <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[var(--accent-purple)]" />
                      Ringkasan Pesanan
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-hand text-[var(--text-secondary)]">Nama</span>
                        <span className="font-display font-semibold text-[var(--text-primary)]">{formData.player_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-hand text-[var(--text-secondary)]">Role</span>
                        <span className="font-display font-semibold text-[var(--text-primary)]">
                          {mabarSettings?.roles.find(r => r.id === selectedRole)?.icon} {mabarSettings?.roles.find(r => r.id === selectedRole)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-hand text-[var(--text-secondary)]">ID Game</span>
                        <span className="font-display font-semibold text-[var(--text-primary)]">{formData.game_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-hand text-[var(--text-secondary)]">Nickname</span>
                        <span className="font-display font-semibold text-[var(--text-primary)]">{formData.game_nickname}</span>
                      </div>
                      <hr className="border-[var(--accent-purple)]/30 my-3" />
                      <div className="flex justify-between items-center">
                        <span className="font-display font-bold text-lg text-[var(--text-primary)]">Total</span>
                        <span className="font-display text-2xl font-bold text-[var(--accent-pink)]">
                          {formatCurrency(mabarSettings?.price_per_slot || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-8">
                    <h3 className="font-display font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-[var(--accent-green)]" />
                      Pilih Metode Pembayaran
                    </h3>

                    {/* QRIS Section */}
                    <div className="mb-4">
                      <div className="font-hand text-sm text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        QRIS (Recommended)
                      </div>
                      <PaymentMethodCard
                        method={paymentMethods.find(m => m.id === 'qris')!}
                        selected={selectedPaymentMethod === 'qris'}
                        onSelect={() => setSelectedPaymentMethod('qris')}
                      />
                    </div>

                    {/* E-Wallet Section */}
                    <div className="mb-4">
                      <div className="font-hand text-sm text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        E-Wallet
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {paymentMethods.filter(m => m.type === 'ewallet').map((method) => (
                          <PaymentMethodCard
                            key={method.id}
                            method={method}
                            selected={selectedPaymentMethod === method.id}
                            onSelect={() => setSelectedPaymentMethod(method.id)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Bank Transfer Section */}
                    <div>
                      <div className="font-hand text-sm text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Virtual Account
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {paymentMethods.filter(m => m.type === 'bank').map((method) => (
                          <PaymentMethodCard
                            key={method.id}
                            method={method}
                            selected={selectedPaymentMethod === method.id}
                            onSelect={() => setSelectedPaymentMethod(method.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center gap-3 p-4 bg-[var(--accent-green)]/10 rounded-2xl border-2 border-[var(--accent-green)]/30 mb-6">
                    <Shield className="w-8 h-8 text-[var(--accent-green)]" />
                    <div>
                      <div className="font-display font-bold text-sm text-[var(--text-primary)]">Pembayaran Aman</div>
                      <div className="font-hand text-xs text-[var(--text-secondary)]">Dilindungi oleh Midtrans Payment Gateway</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      onClick={handlePrevStep}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-cartoon-blue !bg-[var(--bg-card)]"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Kembali</span>
                    </motion.button>
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !canProceedStep3}
                      whileHover={!isSubmitting && canProceedStep3 ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting && canProceedStep3 ? { scale: 0.98 } : {}}
                      className={cn(
                        'flex-1 btn-cartoon-pink',
                        (isSubmitting || !canProceedStep3) && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          <span>Bayar {formatCurrency(mabarSettings?.price_per_slot || 0)}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card-cartoon sticky top-28 bg-gradient-to-br from-[var(--accent-pink)]/10 to-[var(--accent-purple)]/10"
            >
              <div className="text-center mb-5">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-5xl mb-3"
                >
                  💰
                </motion.div>
                <div className="font-hand text-[var(--text-secondary)]">Harga per Slot</div>
                <div className="font-display text-4xl font-bold text-[var(--accent-pink)]">
                  {formatCurrency(mabarSettings?.price_per_slot || 0)}
                </div>
              </div>

              <hr className="border-[var(--accent-pink)]/30 my-5" />

              {/* Queue Info */}
              <div className="text-center mb-5">
                <div className="font-hand text-[var(--text-secondary)]">Antrian Saat Ini</div>
                <div className="font-display text-3xl font-bold text-[var(--text-primary)] flex items-center justify-center gap-2">
                  <Users className="w-7 h-7 text-[var(--accent-purple)]" />
                  {queueEntries.filter(e => e.payment_status === 'completed').length} Orang
                </div>
              </div>

              {/* Live Queue Preview */}
              {queueEntries.length > 0 && (
                <div className="space-y-2">
                  <div className="font-display font-bold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--accent-green)]" />
                    Dalam Antrian
                  </div>
                  {queueEntries.slice(0, 4).map((entry, index) => (
                    <QueuePreviewItem key={entry.id} entry={entry} index={index} />
                  ))}
                  {queueEntries.length > 4 && (
                    <div className="text-center font-hand text-sm text-[var(--text-secondary)] py-2">
                      + {queueEntries.length - 4} lainnya...
                    </div>
                  )}
                </div>
              )}

              {queueEntries.length === 0 && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🎮</div>
                  <div className="font-hand text-[var(--text-secondary)]">
                    Belum ada antrian. Jadilah yang pertama!
                  </div>
                </div>
              )}
            </motion.div>

            {/* MVP Reward Info */}
            {mabarSettings?.mvp_reward_enabled && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="card-cartoon bg-gradient-to-br from-[var(--accent-yellow)]/20 to-[var(--accent-orange)]/20 border-[var(--accent-yellow)]"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-4xl"
                  >
                    👑
                  </motion.div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">MVP Rewards!</h3>
                    <p className="font-hand text-[var(--text-secondary)] mt-1">
                      {mabarSettings.mvp_reward_description || `Dapatkan hadiah setelah ${mabarSettings.mvp_win_count}x MVP!`}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card-cartoon bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]"
            >
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-[var(--accent-blue)]" />
                Tips Penting
              </h3>
              <ul className="space-y-3 font-hand text-[var(--text-secondary)]">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--accent-green)] mt-0.5 shrink-0" />
                  <span>Pastikan ID Game kamu benar</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--accent-green)] mt-0.5 shrink-0" />
                  <span>Tetap di stream saat menunggu giliran</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--accent-green)] mt-0.5 shrink-0" />
                  <span>Siapkan device dan koneksi internet</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-[var(--accent-pink)] mt-0.5 shrink-0" />
                  <span>Jangan lupa follow dan support streamer!</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
