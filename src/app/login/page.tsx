'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gamepad2, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('Email atau password salah');
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err: any) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

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

        {/* Login Card */}
        <div className="card-cartoon bg-white">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-cartoon-dark mb-2">
              Selamat Datang! 👋
            </h1>
            <p className="font-body text-gray-600">
              Login untuk masuk ke dashboard streamer
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
              <p className="font-body text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block font-display font-semibold text-cartoon-dark mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            {/* Forgot Password */}
            <div className="text-right">
              <Link href="/forgot-password" className="font-body text-sm text-candy-purple hover:underline">
                Lupa password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cartoon-purple text-lg group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-0.5 bg-gray-200 rounded-full" />
            <span className="font-body text-gray-400 text-sm">atau</span>
            <div className="flex-1 h-0.5 bg-gray-200 rounded-full" />
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="font-body text-gray-600 mb-4">
              Belum punya akun?
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pastel-pink text-candy-pink font-display font-bold rounded-xl border-3 border-candy-pink hover:bg-candy-pink hover:text-white transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Daftar Sekarang
            </Link>
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
