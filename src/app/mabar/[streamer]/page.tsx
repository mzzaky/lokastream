'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Loader2
} from 'lucide-react';
import { cn, formatCurrency, getRoleEmoji } from '@/lib/utils';
import { FloatingShapes, SectionIcons } from '@/components/CartoonElements';

// Mock streamer data
const mockStreamer = {
  username: 'demo-streamer',
  display_name: 'Pro Gamer ID',
  avatar: '🎮',
  is_live: true,
  current_game: 'Mobile Legends',
};

const mockMabarSettings = {
  price_per_slot: 50000,
  roles: [
    { id: 'exp', name: 'EXP Laner', icon: '⚔️', available: 3 },
    { id: 'jungle', name: 'Jungler', icon: '🌲', available: 2 },
    { id: 'mid', name: 'Mid Laner', icon: '🎯', available: 4 },
    { id: 'gold', name: 'Gold Laner', icon: '💰', available: 1 },
    { id: 'roam', name: 'Roamer', icon: '🛡️', available: 5 },
  ],
  queue_count: 4,
  mvp_reward_enabled: true,
  mvp_reward_description: 'Dapatkan merchandise eksklusif setelah 3x MVP!',
};

// Role Selection Card
const RoleCard = ({ 
  role, 
  selected, 
  onSelect 
}: { 
  role: any; 
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    className={cn(
      'p-4 rounded-[20px] border-4 transition-all text-left w-full',
      selected 
        ? 'bg-[var(--accent-pink)] bg-opacity-20 border-[var(--accent-pink)] shadow-cartoon-pink scale-[1.02]' 
        : 'bg-[var(--bg-card)] border-[var(--border-color)] border-opacity-20 hover:border-[var(--accent-purple)] hover:-translate-y-1'
    )}
  >
    <div className="flex items-center gap-3">
      <div className={cn(
        'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-3 border-[var(--border-color)] transition-all',
        selected ? 'bg-[var(--accent-pink)] shadow-cartoon' : 'bg-[var(--accent-purple)] bg-opacity-20'
      )}>
        {role.icon}
      </div>
      <div className="flex-1">
        <div className="font-display font-bold text-[var(--text-primary)]">{role.name}</div>
        <div className="font-hand text-sm text-[var(--text-secondary)]">{role.available} slot tersedia</div>
      </div>
      {selected && (
        <div className="w-10 h-10 bg-[var(--accent-pink)] rounded-full flex items-center justify-center text-white border-3 border-[var(--border-color)] shadow-cartoon animate-[success-pop_0.3s_ease]">
          <Check className="w-5 h-5" />
        </div>
      )}
    </div>
  </button>
);

// Step Indicator
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {[1, 2, 3].map((step) => (
      <div key={step} className="flex items-center">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg transition-all border-3 border-[var(--border-color)]',
          step === currentStep 
            ? 'bg-[var(--accent-purple)] text-white shadow-cartoon-purple scale-110' 
            : step < currentStep 
              ? 'bg-[var(--accent-green)] text-white shadow-cartoon'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
        )}>
          {step < currentStep ? <Check className="w-5 h-5" /> : step}
        </div>
        {step < 3 && (
          <div className={cn(
            'w-16 h-2 mx-2 rounded-full transition-colors border-2 border-[var(--border-color)]',
            step < currentStep ? 'bg-[var(--accent-green)]' : 'bg-[var(--bg-secondary)]'
          )} />
        )}
      </div>
    ))}
  </div>
);

// Queue Preview Item
const QueuePreviewItem = ({ position, name, role }: { position: number; name: string; role: string }) => (
  <div className="flex items-center gap-3 p-3 bg-[var(--bg-primary)] bg-opacity-50 rounded-2xl border-2 border-[var(--border-color)] border-opacity-20">
    <div className="w-9 h-9 bg-[var(--accent-purple)] rounded-full flex items-center justify-center font-display font-bold text-white text-sm border-2 border-[var(--border-color)]">
      {position}
    </div>
    <div className="flex-1">
      <div className="font-display font-semibold text-sm text-[var(--text-primary)]">{name}</div>
      <div className="font-hand text-xs text-[var(--text-secondary)]">{role}</div>
    </div>
  </div>
);

export default function MabarPage({ params }: { params: { streamer: string } }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    player_name: '',
    game_id: '',
    game_nickname: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const canProceedStep1 = selectedRole !== null;
  const canProceedStep2 = formData.player_name && formData.game_id && formData.game_nickname;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)] relative overflow-hidden">
        <FloatingShapes />
        <div className="card-cartoon text-center max-w-md w-full py-12 relative z-10 bg-gradient-to-br from-[var(--accent-purple)] from-opacity-10 to-[var(--accent-pink)] to-opacity-10">
          <div className="text-8xl mb-6 animate-bounce-slow">🎉</div>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-4">
            Pendaftaran Berhasil!
          </h1>
          <p className="font-hand text-lg text-[var(--text-secondary)] mb-6">
            Kamu sudah masuk ke antrian mabar! Posisi kamu akan muncul di stream.
          </p>
          <div className="bg-[var(--accent-yellow)] bg-opacity-30 rounded-2xl p-6 border-4 border-[var(--accent-yellow)] mb-6">
            <div className="font-display font-bold text-xl text-[var(--text-primary)]">
              Posisi Antrian: #{mockMabarSettings.queue_count + 1}
            </div>
            <div className="font-hand text-[var(--text-secondary)]">
              Perkiraan waktu: ~{(mockMabarSettings.queue_count + 1) * 15} menit
            </div>
          </div>
          <p className="font-hand text-[var(--text-secondary)]">
            Pastikan kamu tetap di stream dan siap saat dipanggil ya! 💜
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 bg-[var(--bg-primary)] relative overflow-hidden">
      <FloatingShapes />
      
      {/* Header */}
      <header className="navbar !rounded-none !top-0 !left-0 !right-0 !mx-0 !mt-0 !border-t-0 !rounded-b-[30px]">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)] rounded-2xl flex items-center justify-center shadow-cartoon group-hover:rotate-12 transition-transform border-3 border-[var(--border-color)]">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-[var(--text-primary)]">MabarKuy</span>
          </Link>
          
          {/* Streamer Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="font-display font-bold text-[var(--text-primary)]">{mockStreamer.display_name}</div>
              <div className="flex items-center gap-2 justify-end">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                <span className="font-hand text-sm text-[var(--text-secondary)]">{mockStreamer.current_game}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)] flex items-center justify-center text-2xl border-3 border-[var(--border-color)] shadow-cartoon">
              {mockStreamer.avatar}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-28 relative z-10">
        <StepIndicator currentStep={currentStep} />
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <div className="card-cartoon">
                <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <span className="text-3xl">🎯</span>
                  Pilih Role
                </h2>
                <p className="font-hand text-lg text-[var(--text-secondary)] mb-6">
                  Pilih role yang ingin kamu mainkan bersama {mockStreamer.display_name}
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {mockMabarSettings.roles.map((role) => (
                    <RoleCard
                      key={role.id}
                      role={role}
                      selected={selectedRole === role.id}
                      onSelect={() => setSelectedRole(role.id)}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={!canProceedStep1}
                  className={cn(
                    'w-full btn-cartoon-purple',
                    !canProceedStep1 && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span>Lanjut ke Data Diri</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {currentStep === 2 && (
              <div className="card-cartoon">
                <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <span className="text-3xl">📝</span>
                  Data Diri
                </h2>
                <p className="font-hand text-lg text-[var(--text-secondary)] mb-6">
                  Isi data untuk keperluan mabar
                </p>
                
                <div className="space-y-5 mb-8">
                  <div>
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
                  </div>
                  
                  <div>
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
                  </div>
                  
                  <div>
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
                  </div>
                  
                  <div>
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
                      Untuk notifikasi dan riwayat mabar
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handlePrevStep}
                    className="btn-cartoon-blue !bg-[var(--bg-card)]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Kembali</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!canProceedStep2}
                    className={cn(
                      'flex-1 btn-cartoon-purple',
                      !canProceedStep2 && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span>Lanjut ke Pembayaran</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="card-cartoon">
                <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <span className="text-3xl">💳</span>
                  Pembayaran
                </h2>
                <p className="font-hand text-lg text-[var(--text-secondary)] mb-6">
                  Pilih metode pembayaran yang kamu mau
                </p>
                
                {/* Order Summary */}
                <div className="bg-[var(--accent-purple)] bg-opacity-15 rounded-2xl p-5 mb-6 border-3 border-[var(--accent-purple)] border-opacity-30">
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">📋 Ringkasan Pesanan</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-hand text-[var(--text-secondary)]">Nama</span>
                      <span className="font-display font-semibold text-[var(--text-primary)]">{formData.player_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-hand text-[var(--text-secondary)]">Role</span>
                      <span className="font-display font-semibold text-[var(--text-primary)]">
                        {mockMabarSettings.roles.find(r => r.id === selectedRole)?.icon} {mockMabarSettings.roles.find(r => r.id === selectedRole)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-hand text-[var(--text-secondary)]">ID Game</span>
                      <span className="font-display font-semibold text-[var(--text-primary)]">{formData.game_id}</span>
                    </div>
                    <hr className="border-[var(--accent-purple)] border-opacity-30 my-3" />
                    <div className="flex justify-between text-xl">
                      <span className="font-display font-bold text-[var(--text-primary)]">Total</span>
                      <span className="font-display font-bold text-[var(--accent-pink)]">
                        {formatCurrency(mockMabarSettings.price_per_slot)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3 mb-8">
                  <h3 className="font-display font-bold text-[var(--text-primary)]">💰 Metode Pembayaran</h3>
                  {[
                    { id: 'gopay', name: 'GoPay', icon: '💚', color: 'green' },
                    { id: 'ovo', name: 'OVO', icon: '💜', color: 'purple' },
                    { id: 'dana', name: 'DANA', icon: '💙', color: 'blue' },
                    { id: 'qris', name: 'QRIS', icon: '📱', color: 'yellow' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      className="w-full flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-2xl border-3 border-[var(--border-color)] border-opacity-20 hover:border-[var(--accent-purple)] hover:-translate-y-1 hover:shadow-cartoon transition-all text-left"
                    >
                      <span className="text-3xl">{method.icon}</span>
                      <span className="font-display font-bold text-[var(--text-primary)]">{method.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handlePrevStep}
                    className="btn-cartoon-blue !bg-[var(--bg-card)]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Kembali</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 btn-cartoon-pink"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Bayar {formatCurrency(mockMabarSettings.price_per_slot)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="card-cartoon sticky top-28 bg-gradient-to-br from-[var(--accent-pink)] from-opacity-10 to-[var(--accent-purple)] to-opacity-10">
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">💰</div>
                <div className="font-hand text-[var(--text-secondary)]">Harga per Slot</div>
                <div className="font-display text-4xl font-bold text-[var(--accent-pink)]">
                  {formatCurrency(mockMabarSettings.price_per_slot)}
                </div>
              </div>
              
              <hr className="border-[var(--accent-pink)] border-opacity-30 my-5" />
              
              {/* Queue Info */}
              <div className="text-center mb-5">
                <div className="font-hand text-[var(--text-secondary)]">Antrian Saat Ini</div>
                <div className="font-display text-3xl font-bold text-[var(--text-primary)]">
                  {mockMabarSettings.queue_count} Orang
                </div>
              </div>

              {/* Queue Preview */}
              <div className="space-y-2">
                <QueuePreviewItem position={1} name="GamerPro" role="Jungler" />
                <QueuePreviewItem position={2} name="MLKing" role="Midlaner" />
                <QueuePreviewItem position={3} name="Support..." role="Roamer" />
                <div className="text-center font-hand text-sm text-[var(--text-secondary)] py-2">
                  + {Math.max(0, mockMabarSettings.queue_count - 3)} lainnya...
                </div>
              </div>
            </div>

            {/* MVP Reward Info */}
            {mockMabarSettings.mvp_reward_enabled && (
              <div className="card-cartoon bg-gradient-to-br from-[var(--accent-yellow)] from-opacity-20 to-[var(--accent-orange)] to-opacity-20 border-[var(--accent-yellow)]">
                <div className="flex items-start gap-4">
                  <div className="text-4xl animate-bounce-slow">👑</div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">MVP Rewards!</h3>
                    <p className="font-hand text-[var(--text-secondary)] mt-1">
                      {mockMabarSettings.mvp_reward_description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="card-cartoon bg-[var(--accent-blue)] bg-opacity-15 border-[var(--accent-blue)]">
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-[var(--accent-blue)]" />
                Tips Penting
              </h3>
              <ul className="space-y-3 font-hand text-[var(--text-secondary)]">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-blue)] text-xl">✓</span>
                  <span>Pastikan ID Game kamu benar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-blue)] text-xl">✓</span>
                  <span>Tetap di stream saat menunggu giliran</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-blue)] text-xl">✓</span>
                  <span>Siapkan device dan koneksi internet</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
