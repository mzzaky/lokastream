'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Gamepad2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  AtSign,
  ArrowRight, 
  Loader2,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { checkUsernameAvailable } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Check username availability
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    
    // Debounce
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { available } = await checkUsernameAvailable(username);
    setUsernameStatus(available ? 'available' : 'taken');
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setFormData({ ...formData, username: value });
    checkUsername(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username minimal 3 karakter');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('Username sudah digunakan');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.username, 
        formData.displayName
      );
      
      if (error) {
        if (error.message?.includes('already registered')) {
          setError('Email sudah terdaftar');
        } else {
          setError(error.message || 'Terjadi kesalahan saat mendaftar');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card-cartoon bg-white text-center">
            <div className="w-20 h-20 bg-pastel-mint rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-candy-green" />
            </div>
            <h1 className="font-display text-3xl font-bold text-cartoon-dark mb-4">
              Pendaftaran Berhasil! 🎉
            </h1>
            <p className="font-body text-gray-600 mb-6">
              Selamat datang di LokaStream! Kamu akan dialihkan ke dashboard...
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-candy-purple animate-spin" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-float opacity-20">🎮</div>
        <div className="absolute top-40 right-20 text-5xl floating-delay-1 opacity-20">⭐</div>
        <div className="absolute bottom-32 left-20 text-5xl floating-delay-2 opacity-20">🏆</div>
        <div className="absolute bottom-20 right-10 text-6xl animate-bounce-slow opacity-20">🎯</div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-16 h-16 bg-gradient-to-br from-candy-pink to-candy-purple rounded-2xl flex items-center justify-center shadow-cartoon-lg group-hover:animate-wiggle">
              <Gamepad2 className="w-9 h-9 text-white" />
            </div>
            <span className="font-display text-3xl font-bold text-gradient">LokaStream</span>
          </Link>
        </div>

        {/* Register Card */}
        <div className="card-cartoon bg-white">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-cartoon-dark mb-2">
              Daftar Streamer 🚀
            </h1>
            <p className="font-body text-gray-600">
              Buat akun untuk mulai mabar dengan fans!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
              <p className="font-body text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name Input */}
            <div>
              <label className="block font-display font-semibold text-cartoon-dark mb-2">
                Nama Tampilan
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Nama yang ditampilkan"
                  required
                  className="input-cartoon pl-12"
                />
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block font-display font-semibold text-cartoon-dark mb-2">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  placeholder="username_kamu"
                  required
                  minLength={3}
                  maxLength={20}
                  className="input-cartoon pl-12 pr-12"
                />
                {/* Username status indicator */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  )}
                  {usernameStatus === 'available' && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {usernameStatus === 'taken' && (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500 font-body">
                URL mabar kamu: lokastream.com/mabar/{formData.username || 'username'}
              </p>
              {usernameStatus === 'taken' && (
                <p className="mt-1 text-sm text-red-500 font-body">Username sudah digunakan</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block font-display font-semibold text-cartoon-dark mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                  className="input-cartoon pl-12"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block font-display font-semibold text-cartoon-dark mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="input-cartoon pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-candy-purple"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block font-display font-semibold text-cartoon-dark mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Ulangi password"
                  required
                  minLength={6}
                  className="input-cartoon pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-candy-purple"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-500 font-body">Password tidak cocok</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || usernameStatus === 'taken' || usernameStatus === 'checking'}
              className="w-full btn-cartoon-pink text-lg group disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                <>
                  Daftar Sekarang
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-0.5 bg-gray-200 rounded-full" />
            <span className="font-body text-gray-400 text-sm">atau</span>
            <div className="flex-1 h-0.5 bg-gray-200 rounded-full" />
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="font-body text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-candy-purple font-semibold hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="font-body text-gray-500 hover:text-candy-purple transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
