'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { Zap, Users, Gamepad2 } from 'lucide-react';
import { cn, getRoleEmoji, formatCurrency } from '@/lib/utils';
import {
  supabase,
  getMabarSettingsByUsername,
  getQueueEntries,
  subscribeToQueue,
  subscribeToSessions
} from '@/lib/supabase';
import { QueueEntry, OverlayTheme, MabarSettings } from '@/types';

// Notification types for overlay
interface OverlayNotification {
  id: string;
  type: 'new_registration' | 'game_start' | 'mvp';
  player_name: string;
  role?: string;
  amount?: number;
  message?: string;
}

// Default overlay theme
const defaultTheme: OverlayTheme = {
  background_color: '#1A1A2E',
  text_color: '#FFFFFF',
  accent_color: '#FF6B9D',
  font_family: 'Fredoka',
  animation_style: 'bounce',
};

// Queue Item for Overlay
const OverlayQueueItem = ({ entry, isActive }: { entry: any; isActive: boolean }) => (
  <div 
    className={cn(
      'flex items-center gap-3 p-3 rounded-2xl transition-all duration-500 border-3',
      isActive 
        ? 'bg-gradient-to-r from-[#FF6B9D] to-[#A66DD4] text-white shadow-[0_0_20px_rgba(255,107,157,0.5)] scale-105 border-white/30' 
        : 'bg-white/10 backdrop-blur-sm border-white/10'
    )}
  >
    {/* Position */}
    <div className={cn(
      'w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm border-2',
      isActive ? 'bg-white/20 border-white/30' : 'bg-[#A66DD4]/50 text-white border-[#A66DD4]/30'
    )}>
      {isActive ? '⚡' : entry.queue_position}
    </div>
    
    {/* Role Icon */}
    <div className={cn(
      'w-11 h-11 rounded-2xl flex items-center justify-center text-xl border-2',
      isActive ? 'bg-white/20 border-white/30' : 'bg-gradient-to-br from-[#FF6B9D]/50 to-[#A66DD4]/50 border-[#FF6B9D]/30'
    )}>
      {getRoleEmoji(entry.selected_role)}
    </div>
    
    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="font-display font-bold truncate text-white">
        {entry.player_name}
      </div>
      <div className={cn(
        'font-hand text-sm',
        isActive ? 'text-white/80' : 'text-white/60'
      )}>
        {entry.selected_role}
      </div>
    </div>
    
    {/* Status Badge */}
    {isActive && (
      <div className="px-3 py-1 bg-white/20 rounded-full font-display font-bold text-xs animate-pulse border-2 border-white/30">
        NOW PLAYING
      </div>
    )}
  </div>
);

// Notification Popup
const NotificationPopup = ({ notification, onClose }: { notification: OverlayNotification; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-[slideDown_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
      <div className="relative bg-gradient-to-r from-[#FF6B9D] via-[#A66DD4] to-[#4ECDC4] p-1 rounded-[30px] shadow-[0_8px_32px_rgba(255,107,157,0.4)]">
        <div className="bg-[#1A1A2E] rounded-[28px] p-8 min-w-[420px] border-4 border-[#4ECDC4]/30">
          {/* Sparkle Effects */}
          <div className="absolute -top-5 -left-5 text-4xl animate-bounce-slow">✨</div>
          <div className="absolute -top-3 -right-3 text-3xl animate-wiggle">🌟</div>
          <div className="absolute -bottom-3 left-1/4 text-3xl animate-[sparkle_1.5s_ease-in-out_infinite]">💫</div>
          
          {notification.type === 'new_registration' && (
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce-slow">🎮</div>
              <h3 className="font-display text-3xl font-bold text-white mb-2">
                Pendaftar Baru!
              </h3>
              <p className="font-display text-2xl text-[#FFE66D] font-bold">
                {notification.player_name}
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="px-4 py-2 bg-[#A66DD4]/30 rounded-full font-display font-bold text-[#A66DD4] border-2 border-[#A66DD4]">
                  {notification.role}
                </span>
                <span className="px-4 py-2 bg-[#FF6B9D]/30 rounded-full font-display font-bold text-[#FF6B9D] border-2 border-[#FF6B9D]">
                  {formatCurrency(notification.amount || 0)}
                </span>
              </div>
            </div>
          )}
          
          {notification.type === 'game_start' && (
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">⚡</div>
              <h3 className="font-display text-3xl font-bold text-white">
                Game Dimulai!
              </h3>
              <p className="font-hand text-xl text-white/80 mt-2">
                Good luck have fun! 🎯
              </p>
            </div>
          )}
          
          {notification.type === 'mvp' && (
            <div className="text-center">
              <div className="text-7xl mb-4 animate-bounce-slow">👑</div>
              <h3 className="font-display text-3xl font-bold text-[#FFE66D]">
                MVP!
              </h3>
              <p className="font-display text-2xl text-white font-bold mt-2">
                {notification.player_name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function OverlayPage({ params }: { params: Promise<{ streamer: string }> }) {
  // Unwrap params using React.use() for Next.js 15
  const { streamer } = use(params);

  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [currentNotification, setCurrentNotification] = useState<OverlayNotification | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mabarSettings, setMabarSettings] = useState<MabarSettings | null>(null);
  const [streamerId, setStreamerId] = useState<string | null>(null);
  const [theme, setTheme] = useState<OverlayTheme>(defaultTheme);

  // Show notification helper
  const showNotification = useCallback((notification: OverlayNotification) => {
    setCurrentNotification(notification);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get mabar settings by streamer username
        const { data: settings, error: settingsError, user } = await getMabarSettingsByUsername(streamer);

        if (settingsError || !settings || !user) {
          setError('Streamer tidak ditemukan atau belum mengaktifkan Mabar VIP');
          setIsLoading(false);
          return;
        }

        setMabarSettings(settings as unknown as MabarSettings);
        setStreamerId(user.id);

        // Set theme from settings
        if (settings.overlay_theme) {
          setTheme(settings.overlay_theme as OverlayTheme);
        }

        // Fetch queue entries
        const { data: queueData, error: queueError } = await getQueueEntries(
          user.id,
          ['waiting', 'selected', 'playing']
        );

        if (queueError) {
          console.error('Error fetching queue:', queueError);
        } else {
          setQueue((queueData as unknown as QueueEntry[]) || []);
          // Check if there's an active game
          const hasPlayingPlayers = queueData?.some(entry => entry.status === 'playing');
          setIsGameActive(!!hasPlayingPlayers);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading overlay:', err);
        setError('Terjadi kesalahan saat memuat overlay');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [streamer]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!streamerId) return;

    // Subscribe to queue changes
    const queueSubscription = subscribeToQueue(streamerId, (payload) => {
      const { eventType, new: newEntry, old: oldEntry } = payload;

      if (eventType === 'INSERT') {
        const entry = newEntry as QueueEntry;
        // Add new entry to queue
        setQueue(prev => {
          const exists = prev.some(e => e.id === entry.id);
          if (exists) return prev;
          return [...prev, entry].sort((a, b) => a.queue_position - b.queue_position);
        });

        // Show notification for new registration (only if payment completed)
        if (entry.payment_status === 'completed') {
          showNotification({
            id: entry.id,
            type: 'new_registration',
            player_name: entry.player_name,
            role: entry.selected_role,
            amount: entry.amount_paid,
          });
        }
      } else if (eventType === 'UPDATE') {
        const entry = newEntry as QueueEntry;
        setQueue(prev =>
          prev.map(e => e.id === entry.id ? entry : e)
            .filter(e => ['waiting', 'selected', 'playing'].includes(e.status))
            .sort((a, b) => a.queue_position - b.queue_position)
        );

        // Check if game just started
        const wasNotPlaying = oldEntry && oldEntry.status !== 'playing';
        if (wasNotPlaying && entry.status === 'playing') {
          setIsGameActive(true);
        }

        // Show notification for newly registered (payment just completed)
        if (oldEntry?.payment_status === 'pending' && entry.payment_status === 'completed') {
          showNotification({
            id: entry.id,
            type: 'new_registration',
            player_name: entry.player_name,
            role: entry.selected_role,
            amount: entry.amount_paid,
          });
        }
      } else if (eventType === 'DELETE') {
        const entry = oldEntry as QueueEntry;
        setQueue(prev => prev.filter(e => e.id !== entry.id));
      }
    });

    // Subscribe to game session changes
    const sessionSubscription = subscribeToSessions(streamerId, (payload) => {
      const { eventType, new: newSession } = payload;

      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        if (newSession.status === 'in_progress') {
          setIsGameActive(true);
          showNotification({
            id: newSession.id,
            type: 'game_start',
            player_name: '',
            message: 'Game Dimulai!',
          });
        } else if (newSession.status === 'completed') {
          setIsGameActive(false);

          // Show MVP notification if MVP was selected
          if (newSession.mvp_player_id && newSession.players) {
            const mvpPlayer = newSession.players.find(
              (p: { queue_entry_id: string }) => p.queue_entry_id === newSession.mvp_player_id
            );
            if (mvpPlayer) {
              showNotification({
                id: `mvp-${newSession.id}`,
                type: 'mvp',
                player_name: mvpPlayer.player_name,
              });
            }
          }
        }
      }
    });

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(queueSubscription);
      supabase.removeChannel(sessionSubscription);
    };
  }, [streamerId, showNotification]);

  // Filter queue for display
  const activePlayers = queue.filter(e => e.status === 'playing' || e.status === 'selected').slice(0, 4);
  const waitingPlayers = queue.filter(e => e.status === 'waiting').slice(0, 3);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white/50 font-display text-xl animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="bg-[#1A1A2E]/90 p-6 rounded-2xl border-2 border-red-500/50 max-w-md">
          <p className="text-red-400 font-display text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-display">
      {/* This page should be used as OBS Browser Source */}
      {/* Background is transparent for overlay purposes */}
      
      {/* Notification Popup */}
      {currentNotification && (
        <NotificationPopup 
          notification={currentNotification} 
          onClose={() => setCurrentNotification(null)} 
        />
      )}

      {/* Main Overlay Container - Position at bottom right */}
      <div className="fixed bottom-8 right-8 w-[400px]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#FF6B9D] via-[#A66DD4] to-[#4ECDC4] p-1 rounded-t-[30px]">
          <div className="bg-[#1A1A2E] rounded-t-[28px] p-5 border-b-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B9D] to-[#A66DD4] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,107,157,0.5)] animate-pulse border-3 border-white/20">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold text-white">
                  Mabar VIP 🎮
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#6BCB77] rounded-full animate-pulse" />
                  <span className="font-hand text-sm text-white/60">
                    {activePlayers.length}/4 Player Ready
                  </span>
                </div>
              </div>
              {isGameActive && (
                <div className="px-4 py-2 bg-[#FF6B9D] rounded-full font-display font-bold text-sm text-white animate-pulse border-2 border-white/30 shadow-[0_0_15px_rgba(255,107,157,0.5)]">
                  🔴 LIVE
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Party */}
        <div className="bg-[#1A1A2E]/95 backdrop-blur-md p-5 border-x-4 border-[#A66DD4]/50">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#FFE66D]" />
            <span className="font-display font-bold text-white">Party Saat Ini</span>
          </div>
          
          <div className="space-y-3">
            {activePlayers.map((entry, index) => (
              <OverlayQueueItem 
                key={entry.id} 
                entry={entry} 
                isActive={entry.status === 'playing'}
              />
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 4 - activePlayers.length }).map((_, index) => (
              <div 
                key={`empty-${index}`}
                className="flex items-center gap-3 p-3 rounded-2xl border-3 border-dashed border-white/20"
              >
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white/40 text-lg">?</span>
                </div>
                <span className="font-hand text-white/40">Slot Kosong</span>
              </div>
            ))}
          </div>
        </div>

        {/* Waiting Queue */}
        <div className="bg-[#0F0F23]/95 backdrop-blur-md p-5 rounded-b-[30px] border-x-4 border-b-4 border-[#A66DD4]/50">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#4ECDC4]" />
            <span className="font-display font-bold text-white">
              Antrian ({waitingPlayers.length} orang)
            </span>
          </div>
          
          <div className="space-y-2">
            {waitingPlayers.map((entry) => (
              <div 
                key={entry.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border-2 border-white/10"
              >
                <div className="w-8 h-8 rounded-full bg-[#A66DD4]/30 flex items-center justify-center font-display font-bold text-sm text-white border-2 border-[#A66DD4]/50">
                  {entry.queue_position}
                </div>
                <span className="text-lg">{getRoleEmoji(entry.selected_role)}</span>
                <span className="font-hand text-white/80 truncate flex-1">
                  {entry.player_name}
                </span>
              </div>
            ))}
            
            {waitingPlayers.length === 0 && (
              <p className="text-center font-hand text-white/40 py-3">
                Belum ada yang antri 🎮
              </p>
            )}
          </div>
          
          {/* Join CTA */}
          <div className="mt-5 pt-4 border-t-2 border-white/10">
            <p className="font-hand text-sm text-white/60 text-center">
              Mau main bareng? Kunjungi link di deskripsi! 🎮✨
            </p>
          </div>
        </div>
      </div>

      {/* Floating Elements for Visual Interest */}
      <div className="fixed bottom-4 right-4 text-3xl animate-bounce-slow opacity-50">⭐</div>
      <div className="fixed bottom-36 right-2 text-2xl animate-wiggle opacity-30">🎮</div>
      <div className="fixed bottom-64 right-6 text-xl animate-float opacity-40">💜</div>

      {/* Keyframes for animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -100px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}
