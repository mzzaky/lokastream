'use client';

import { FloatingShapes, SectionIcons, AvatarWithStickers } from '@/components/CartoonElements';
import Link from 'next/link';
import { Gamepad2, Users, Zap, Trophy, Clock, Shield, ChevronRight, Sparkles, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      <FloatingShapes />
      
      {/* Navbar */}
      <nav className="navbar">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)] flex items-center justify-center border-3 border-[var(--border-color)] shadow-cartoon group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--text-primary)]">MabarKuy</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="btn-cartoon-purple !py-2 !px-5 text-sm"
            >
              <span>Masuk</span>
            </Link>
            <Link 
              href="/register" 
              className="btn-cartoon-pink !py-2 !px-5 text-sm"
            >
              <span>Daftar</span>
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <SectionIcons icons={['🎮', '🏆', '⚡', '🎯', '🌟', '🎪']} />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--accent-yellow)] border-3 border-[var(--border-color)] shadow-cartoon mb-6 animate-bounce-slow">
            <Star className="w-5 h-5 text-[var(--text-primary)]" />
            <span className="font-display font-semibold text-[var(--text-primary)]">Platform Main Bareng #1</span>
          </div>
          
          {/* Title */}
          <h1 className="font-display font-extrabold text-5xl md:text-7xl text-[var(--text-primary)] mb-6 leading-tight">
            Main Bareng
            <span className="block bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent">
              Jadi Lebih Seru! 🎮
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="font-hand text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Kelola antrian mabar streamer dengan mudah, adil, dan menyenangkan! Buat pengalaman viewers jadi super kece~ ✨
          </p>
          
          {/* Avatar */}
          <div className="flex justify-center mb-10">
            <AvatarWithStickers 
              emoji="🎮" 
              stickers={['⭐', '💖', '🔥', '✨']}
              size={180}
            />
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link href="/register" className="btn-cartoon-pink text-lg">
              <span>Mulai Gratis</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-cartoon-blue text-lg">
              <span>Lihat Demo</span>
              <Gamepad2 className="w-5 h-5" />
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { number: '1K+', label: 'Streamer', emoji: '🎬' },
              { number: '50K+', label: 'Viewers', emoji: '👥' },
              { number: '100K+', label: 'Games', emoji: '🎮' },
              { number: '99%', label: 'Happy', emoji: '😊' },
            ].map((stat, i) => (
              <div 
                key={i}
                className="card-cartoon p-4 hover:scale-105 transition-transform"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-3xl mb-1">{stat.emoji}</div>
                <div className="font-display font-bold text-2xl text-[var(--accent-pink)]">{stat.number}</div>
                <div className="font-hand text-sm text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="relative py-20 px-4 bg-[var(--bg-secondary)]">
        <SectionIcons icons={['⚡', '🎯', '💎', '🚀']} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-[var(--text-primary)] mb-4">
              Fitur Super Keren 🌟
            </h2>
            <p className="font-hand text-xl text-[var(--text-secondary)]">
              Semua yang kamu butuhkan untuk mabar yang sempurna!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Antrian Fair',
                desc: 'Sistem antrian otomatis yang adil untuk semua viewers',
                color: 'pink',
                emoji: '⚖️'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Super Cepat',
                desc: 'Real-time update tanpa delay, langsung sync!',
                color: 'yellow',
                emoji: '⚡'
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: 'Leaderboard',
                desc: 'Ranking viewers paling aktif dan loyal',
                color: 'purple',
                emoji: '🏆'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: 'Auto Timer',
                desc: 'Timer otomatis untuk setiap sesi mabar',
                color: 'blue',
                emoji: '⏰'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Anti Troll',
                desc: 'Sistem moderasi untuk mencegah trolling',
                color: 'green',
                emoji: '🛡️'
              },
              {
                icon: <Gamepad2 className="w-8 h-8" />,
                title: 'Multi Game',
                desc: 'Support berbagai game populer',
                color: 'orange',
                emoji: '🎮'
              },
            ].map((feature, i) => (
              <div 
                key={i}
                className="skill-card group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-2 bg-[var(--accent-${feature.color})] rounded-t-[28px]`} />
                <div className="flex items-start gap-4 pt-4">
                  <div className={`w-14 h-14 rounded-2xl bg-[var(--accent-${feature.color})] bg-opacity-20 flex items-center justify-center border-3 border-[var(--border-color)] text-[var(--accent-${feature.color})] group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mb-1 flex items-center gap-2">
                      {feature.title}
                      <span className="text-lg">{feature.emoji}</span>
                    </h3>
                    <p className="font-hand text-[var(--text-secondary)]">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="relative py-20 px-4">
        <SectionIcons icons={['1️⃣', '2️⃣', '3️⃣', '✅']} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-[var(--text-primary)] mb-4">
              Cara Kerja 🎯
            </h2>
            <p className="font-hand text-xl text-[var(--text-secondary)]">
              Cuma 3 langkah mudah!
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Daftar Akun',
                desc: 'Buat akun gratis dalam 30 detik',
                emoji: '📝',
                color: 'pink'
              },
              {
                step: '2',
                title: 'Setup Mabar',
                desc: 'Atur game, slot, dan rules mabar kamu',
                emoji: '⚙️',
                color: 'purple'
              },
              {
                step: '3',
                title: 'Mulai Stream!',
                desc: 'Share link dan viewers bisa langsung daftar',
                emoji: '🎬',
                color: 'blue'
              },
            ].map((item, i) => (
              <div 
                key={i}
                className="card-cartoon p-8 text-center relative overflow-visible"
              >
                <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[var(--accent-${item.color})] border-4 border-[var(--border-color)] flex items-center justify-center font-display font-bold text-2xl text-white shadow-cartoon`}>
                  {item.step}
                </div>
                <div className="pt-8">
                  <div className="text-5xl mb-4">{item.emoji}</div>
                  <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">{item.title}</h3>
                  <p className="font-hand text-[var(--text-secondary)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="card-cartoon p-12 bg-white/95 dark:bg-[var(--bg-card)]/95">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="font-display font-bold text-4xl text-[var(--text-primary)] mb-4">
              Siap Mabar Bareng?
            </h2>
            <p className="font-hand text-xl text-[var(--text-secondary)] mb-8">
              Gabung sekarang dan rasakan pengalaman mabar yang berbeda!
            </p>
            <Link href="/register" className="btn-cartoon-pink text-xl inline-flex">
              <span>Daftar Sekarang</span>
              <Sparkles className="w-6 h-6" />
            </Link>
          </div>
        </div>
        
        {/* Decorative emojis */}
        <div className="absolute top-10 left-10 text-4xl animate-bounce-slow">🎮</div>
        <div className="absolute top-20 right-10 text-4xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🏆</div>
        <div className="absolute bottom-10 left-20 text-4xl animate-bounce-slow" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-20 right-20 text-4xl animate-bounce-slow" style={{ animationDelay: '1.5s' }}>💖</div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-4 bg-[var(--bg-secondary)] border-t-4 border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)] flex items-center justify-center border-3 border-[var(--border-color)]">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--text-primary)]">MabarKuy</span>
          </div>
          <p className="font-hand text-[var(--text-secondary)]">
            Made with 💖 for Indonesian Streamers
          </p>
          <p className="font-hand text-sm text-[var(--text-secondary)] mt-2">
            © 2024 MabarKuy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
