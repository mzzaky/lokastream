import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}j ${mins}m`;
  }
  return `${mins}m`;
}

export function generateQueueId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function getRoleEmoji(role: string): string {
  const roleEmojis: Record<string, string> = {
    exp: '⚔️',
    jungle: '🌲',
    jungler: '🌲',
    mid: '🎯',
    midlaner: '🎯',
    gold: '💰',
    roam: '🛡️',
    roamer: '🛡️',
    support: '💚',
  };
  return roleEmojis[role.toLowerCase()] || '🎮';
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    waiting: 'bg-pastel-yellow text-yellow-700 border-candy-yellow',
    selected: 'bg-pastel-blue text-candy-blue border-candy-blue',
    playing: 'bg-pastel-pink text-candy-pink border-candy-pink',
    completed: 'bg-pastel-mint text-green-700 border-candy-green',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-300',
    no_show: 'bg-red-100 text-red-500 border-red-300',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-500 border-gray-300';
}

export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    waiting: 'Menunggu',
    selected: 'Terpilih',
    playing: 'Bermain',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    no_show: 'Tidak Hadir',
  };
  return statusLabels[status] || status;
}

export function getPaymentStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'bg-pastel-yellow text-yellow-700 border-candy-yellow',
    completed: 'bg-pastel-mint text-green-700 border-candy-green',
    failed: 'bg-red-100 text-red-500 border-red-300',
    refunded: 'bg-pastel-blue text-candy-blue border-candy-blue',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-500 border-gray-300';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
