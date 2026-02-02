'use client';

import { ReactNode } from 'react';

// ===== FLOATING SHAPES BACKGROUND =====
export const FloatingShapes = () => (
  <div className="floating-shapes">
    <div className="shape shape-1" />
    <div className="shape shape-2" />
    <div className="shape shape-3" />
    <div className="shape shape-4" />
    <div className="shape shape-5" />
    <div className="shape shape-6" />
  </div>
);

// ===== SECTION ICONS =====
interface SectionIconProps {
  icons: string[];
}

export const SectionIcons = ({ icons }: SectionIconProps) => {
  // Pre-defined positions for floating icons
  const positions = [
    { top: '10%', left: '5%' },
    { top: '15%', right: '8%' },
    { top: '45%', left: '3%' },
    { top: '60%', right: '5%' },
    { bottom: '20%', left: '8%' },
    { bottom: '15%', right: '10%' },
    { top: '30%', right: '3%' },
    { bottom: '35%', left: '5%' },
  ];
  
  const animations = ['bounce', 'spin', 'wobble', 'zoom'];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((emoji, index) => (
        <div
          key={index}
          className={`section-icon ${animations[index % animations.length]}`}
          style={{
            ...positions[index % positions.length],
            animationDelay: `${-index * 0.8}s`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

// ===== THEME TOGGLE =====
interface ThemeToggleProps {
  isDark?: boolean;
  onToggle?: () => void;
}

export const ThemeToggle = ({ isDark, onToggle }: ThemeToggleProps) => (
  <button
    className="theme-toggle"
    onClick={onToggle}
    aria-label="Toggle theme"
  >
    {isDark ? '🌙' : '☀️'}
  </button>
);

// ===== MASCOT =====
interface MascotProps {
  emoji?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Mascot = ({ emoji = '🎮', className = '', size = 'md' }: MascotProps) => {
  const sizes = {
    sm: 'w-20 h-20 text-4xl',
    md: 'w-32 h-32 text-6xl',
    lg: 'w-48 h-48 text-7xl',
    xl: 'w-64 h-64 text-8xl',
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizes[size]} avatar-circle`}>
        <span className="relative z-10">{emoji}</span>
      </div>
      <div className="absolute -top-2 -right-2 text-3xl animate-bounce-slow">✨</div>
      <div className="absolute -bottom-1 -left-1 text-2xl animate-wiggle">🌟</div>
    </div>
  );
};

// ===== AVATAR WITH STICKERS =====
interface AvatarWithStickersProps {
  emoji?: string;
  stickers?: { emoji: string; position: 'top-right' | 'bottom-left' | 'top-left' | 'bottom-right'; color?: string }[];
  size?: number;
  className?: string;
}

export const AvatarWithStickers = ({
  emoji = '👨‍💻',
  stickers = [
    { emoji: '⭐', position: 'top-right', color: 'var(--accent-yellow)' },
    { emoji: '💻', position: 'bottom-left', color: 'var(--accent-green)' },
  ],
  size = 200,
  className = '',
}: AvatarWithStickersProps) => {
  const stickerPositions = {
    'top-right': { top: '-10px', right: '-10px' },
    'bottom-left': { bottom: '10px', left: '-20px' },
    'top-left': { top: '-10px', left: '-10px' },
    'bottom-right': { bottom: '10px', right: '-20px' },
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div className="avatar-circle text-7xl">
        {emoji}
      </div>
      {stickers.map((sticker, index) => (
        <div
          key={index}
          className="avatar-sticker"
          style={{
            ...stickerPositions[sticker.position],
            background: sticker.color || 'var(--accent-yellow)',
            animationDelay: `${-index * 0.5}s`,
          }}
        >
          {sticker.emoji}
        </div>
      ))}
    </div>
  );
};

// ===== ANIMATED BLOB =====
interface AnimatedBlobProps {
  color?: string;
  size?: string;
  className?: string;
}

export const AnimatedBlob = ({
  color = 'var(--accent-pink)',
  size = '300px',
  className = '',
}: AnimatedBlobProps) => (
  <div
    className={`blob ${className}`}
    style={{
      width: size,
      height: size,
      background: color,
      animationDelay: `${Math.random() * 5}s`,
    }}
  />
);

// ===== STATS CARD =====
interface StatsCardProps {
  icon: string;
  value: string;
  label: string;
  color?: 'pink' | 'purple' | 'blue' | 'yellow' | 'green' | 'orange';
}

export const StatsCard = ({ icon, value, label, color = 'pink' }: StatsCardProps) => {
  const colors = {
    pink: 'border-candy-pink shadow-cartoon-pink bg-pastel-pink',
    purple: 'border-candy-purple shadow-cartoon-purple bg-pastel-purple',
    blue: 'border-candy-blue shadow-cartoon-blue bg-pastel-blue',
    yellow: 'border-candy-yellow shadow-cartoon-yellow bg-pastel-yellow',
    green: 'border-candy-green shadow-cartoon-green bg-pastel-mint',
    orange: 'border-candy-orange shadow-cartoon-orange bg-pastel-peach',
  };

  return (
    <div className={`text-center p-6 rounded-card border-4 transition-all hover:-translate-y-2 ${colors[color]}`}>
      <div className="text-4xl mb-3 animate-bounce-slow">{icon}</div>
      <div className="font-display text-3xl font-bold text-gradient">{value}</div>
      <div className="font-hand text-lg text-text-secondary">{label}</div>
    </div>
  );
};

// ===== FEATURE CARD =====
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: 'pink' | 'purple' | 'blue' | 'yellow' | 'green' | 'orange';
  delay?: number;
}

export const FeatureCard = ({
  icon,
  title,
  description,
  color = 'pink',
  delay = 0,
}: FeatureCardProps) => {
  const colorClasses = {
    pink: 'border-candy-pink hover:shadow-cartoon-pink',
    purple: 'border-candy-purple hover:shadow-cartoon-purple',
    blue: 'border-candy-blue hover:shadow-cartoon-blue',
    yellow: 'border-candy-yellow hover:shadow-cartoon-yellow',
    green: 'border-candy-green hover:shadow-cartoon-green',
    orange: 'border-candy-orange hover:shadow-cartoon-orange',
  };

  const iconBg = {
    pink: 'bg-pastel-pink',
    purple: 'bg-pastel-purple',
    blue: 'bg-pastel-blue',
    yellow: 'bg-pastel-yellow',
    green: 'bg-pastel-mint',
    orange: 'bg-pastel-peach',
  };

  return (
    <div
      className={`skill-card ${colorClasses[color]} group cursor-pointer`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-20 h-20 rounded-2xl ${iconBg[color]} border-3 border-current flex items-center justify-center mb-4 group-hover:animate-wiggle`}>
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="font-hand text-lg text-text-secondary">{description}</p>
    </div>
  );
};

// ===== STEP CARD =====
interface StepCardProps {
  step: string;
  title: string;
  description: string;
  icon: string;
  color?: 'pink' | 'purple' | 'blue';
}

export const StepCard = ({ step, title, description, icon, color = 'pink' }: StepCardProps) => {
  const colorClasses = {
    pink: 'bg-candy-pink',
    purple: 'bg-candy-purple',
    blue: 'bg-candy-blue',
  };

  return (
    <div className="relative">
      <div className="card-cartoon text-center">
        {/* Step Number */}
        <div className={`absolute -top-4 -left-4 w-10 h-10 ${colorClasses[color]} rounded-full flex items-center justify-center font-display font-bold text-white text-xl shadow-cartoon-sm`}>
          {step}
        </div>
        
        <div className="text-5xl mb-4 animate-bounce-slow">{icon}</div>
        <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
        <p className="font-hand text-lg text-text-secondary">{description}</p>
      </div>
    </div>
  );
};

// ===== PLATFORM CARD =====
interface PlatformCardProps {
  name: string;
  icon: ReactNode;
  color: string;
}

export const PlatformCard = ({ name, icon, color }: PlatformCardProps) => (
  <div className="flex items-center gap-3 px-6 py-4 bg-bg-card rounded-2xl border-4 border-border shadow-cartoon hover:shadow-cartoon-lg transition-all cursor-pointer group">
    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white group-hover:animate-wiggle`}>
      {icon}
    </div>
    <span className="font-display font-semibold">{name}</span>
  </div>
);

// Helper function to parse position string like "top-10% left-5%"
function parsePosition(posStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  const parts = posStr.split(' ');
  parts.forEach(part => {
    const segments = part.split('-');
    if (segments.length >= 2) {
      const prop = segments[0];
      const val = segments.slice(1).join('-');
      if (prop && val) {
        result[prop] = val;
      }
    }
  });
  return result;
}

// ===== DECORATIVE EMOJI =====
interface DecorativeEmojiProps {
  emoji: string;
  position: string;
  animation?: 'bounce' | 'float' | 'wiggle' | 'spin';
  size?: 'sm' | 'md' | 'lg';
  opacity?: number;
}

export const DecorativeEmoji = ({
  emoji,
  position,
  animation = 'float',
  size = 'md',
  opacity = 0.2,
}: DecorativeEmojiProps) => {
  const sizes = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl',
  };

  const animations = {
    bounce: 'animate-bounce-slow',
    float: 'floating',
    wiggle: 'animate-wiggle',
    spin: 'animate-icon-spin',
  };

  return (
    <div
      className={`absolute ${sizes[size]} ${animations[animation]}`}
      style={{ ...parsePosition(position), opacity }}
    >
      {emoji}
    </div>
  );
};

// ===== GRADIENT TEXT =====
interface GradientTextProps {
  children: ReactNode;
  animated?: boolean;
  className?: string;
}

export const GradientText = ({ children, animated = false, className = '' }: GradientTextProps) => (
  <span className={`${animated ? 'text-gradient-animated' : 'text-gradient'} ${className}`}>
    {children}
  </span>
);

// ===== WAVE HAND =====
export const WaveHand = () => (
  <span className="inline-block animate-wave origin-bottom-right">👋</span>
);

// ===== CONFETTI BURST =====
export const ConfettiBurst = ({ active }: { active: boolean }) => {
  if (!active) return null;

  const confettiEmojis = ['🎉', '🎊', '⭐', '✨', '🌟', '💫'];

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-50px',
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random() * 0.5}s`,
          }}
        >
          {confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)]}
        </div>
      ))}
    </div>
  );
};

// Default export all components
export default {
  FloatingShapes,
  SectionIcons,
  ThemeToggle,
  Mascot,
  AvatarWithStickers,
  AnimatedBlob,
  StatsCard,
  FeatureCard,
  StepCard,
  PlatformCard,
  DecorativeEmoji,
  GradientText,
  WaveHand,
  ConfettiBurst,
};
