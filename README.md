# 🎮 LokaStream - Platform Streamer Gamer Indonesia

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-3-green?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-blue?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
</div>

## ✨ Tentang LokaStream

**LokaStream** adalah platform super keren untuk para streamer gamer Indonesia! Kelola antrian Mabar VIP, terima donasi, dan bikin streaming makin seru dengan desain UI cartoonish yang cute dan profesional.

### 🎯 Fitur Utama V1 - Mabar VIP (Mobile Legends)

- 🎮 **Queue Management**: Kelola antrian mabar secara real-time
- 💰 **Payment Integration**: Integrasi dengan payment gateway Indonesia
- 📺 **OBS Overlay**: Browser source untuk OBS dengan notifikasi keren
- 🏆 **MVP Reward System**: Sistem hadiah untuk pemain terbaik
- 📊 **Match History**: Riwayat lengkap semua sesi game
- 👥 **Role Selection**: Pilihan role Mobile Legends (EXP, Jungle, Mid, Gold, Roam)

## 🎨 Design System - Cartoonish Theme

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Candy Pink | `#FF6B9D` | Primary actions, highlights |
| Candy Purple | `#9B5DE5` | Secondary actions, branding |
| Candy Blue | `#00BBF9` | Info, links |
| Candy Yellow | `#FEE440` | Warnings, emphasis |
| Candy Cyan | `#00F5D4` | Success states |

### Typography
- **Display**: Fredoka (headers, titles)
- **Body**: Nunito (content, paragraphs)
- **Fun**: Baloo 2 (special elements)

### Animations
- Wiggle, Float, Bounce, Sparkle, Blob, Pop, Shake, Confetti, Wave

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm atau yarn
- Akun Supabase

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/lokastream.git
cd lokastream

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan kredensial Supabase kamu

# Run development server
npm run dev
```

### Environment Variables

Buat file `.env.local` di root project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Midtrans (Payment Gateway) - Coming Soon
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_PRODUCTION=false

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📁 Project Structure

```
lokastream/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Streamer dashboard
│   │   │   └── page.tsx        # Queue management, game sessions
│   │   ├── mabar/
│   │   │   └── [streamer]/     # Public registration page
│   │   ├── overlay/
│   │   │   └── [streamer]/     # OBS browser source
│   │   ├── globals.css         # Cartoonish styles & animations
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # Layout components
│   │   └── features/           # Feature-specific components
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts            # Utility functions
│   ├── types/
│   │   └── index.ts            # TypeScript definitions
│   ├── hooks/                  # Custom React hooks
│   └── store/                  # Zustand state management
├── supabase/
│   └── schema.sql              # Database schema
├── public/                     # Static assets
├── tailwind.config.ts          # Cartoonish theme config
└── package.json
```

## 🗄️ Database Setup

### 1. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com)
2. Buat project baru
3. Copy URL dan Anon Key ke `.env.local`

### 2. Jalankan Schema SQL

Di Supabase Dashboard → SQL Editor:

```sql
-- Jalankan isi file supabase/schema.sql
```

### Tables Overview

| Table | Deskripsi |
|-------|-----------|
| `users` | Profil streamer |
| `mabar_settings` | Pengaturan mabar per streamer |
| `queue_entries` | Antrian pendaftaran mabar |
| `game_sessions` | Riwayat sesi game |
| `mvp_records` | Statistik MVP per pemain |
| `donations` | Transaksi pembayaran |

## 💳 Payment Gateway Setup

### Midtrans (Recommended)

1. Daftar di [midtrans.com](https://midtrans.com)
2. Dapatkan Server Key dan Client Key
3. Konfigurasi di `.env.local`

### Supported Payment Methods
- GoPay
- OVO
- DANA
- QRIS
- Bank Transfer
- Credit Card

### Integration Flow

```
1. User submit form → Create Midtrans transaction
2. Redirect ke Midtrans payment page
3. User bayar → Midtrans webhook
4. Update queue_entry.payment_status
5. User masuk antrian (real-time update)
```

## 📺 OBS Integration

### Setup Browser Source

1. Buka OBS Studio
2. Add Source → Browser
3. URL: `https://yourapp.com/overlay/[streamer-username]`
4. Width: 1920, Height: 1080
5. ✅ Custom CSS: (kosongkan)

### Overlay Features
- Current party display
- Waiting queue (next 5)
- New registration popup
- Game start notification
- MVP achievement animation

## 🎮 Flow Aplikasi

### Untuk Streamer

```
1. Daftar/Login → Dashboard
2. Setup Mabar (harga, role, MVP settings)
3. Share link mabar ke viewers
4. Kelola antrian di Dashboard
5. Pilih pemain (1-4) → Start Game
6. Selesai → Mark Complete → Pilih MVP
7. Lihat history & analytics
```

### Untuk Viewer/Fans

```
1. Buka link mabar streamer
2. Pilih role → Isi data (ID, Nickname)
3. Bayar via payment gateway
4. Masuk antrian (bisa lihat posisi)
5. Tunggu dipilih streamer
6. Main bareng!
7. Kalau MVP → dapat reward
```

## 🏆 MVP Reward System

- Streamer set jumlah MVP untuk reward (default: 3x)
- Setiap session, streamer pilih 1 MVP
- Sistem track total MVP per player (by game_id)
- Saat mencapai target → notifikasi reward
- Streamer bisa custom reward (merchandise, slot gratis, dll)

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Environment di Vercel

Tambahkan semua environment variables di:
Vercel Dashboard → Project → Settings → Environment Variables

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px - 1919px)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (320px - 767px)

## 🔧 Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 📋 Roadmap

### V1.0 (Current)
- [x] Landing page
- [x] Dashboard streamer
- [x] Queue management
- [x] Mabar registration page
- [x] OBS overlay
- [x] MVP system
- [ ] Payment integration (Midtrans)
- [ ] Authentication (Supabase Auth)
- [ ] Real Supabase integration

### V1.1
- [ ] Mobile responsive optimization
- [ ] Email notifications
- [ ] Discord webhook integration
- [ ] Multiple game support

### V2.0
- [ ] Analytics dashboard
- [ ] Subscription tiers
- [ ] Custom overlay themes
- [ ] Tournament mode
- [ ] Multi-language support

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - lihat file [LICENSE](LICENSE)

## 💜 Credits

Made with 💜 di Indonesia untuk para streamer Indonesia!

---

<div align="center">
  <strong>LokaStream</strong> - Mabar Bareng Fans Favoritmu! 🎮
</div>
