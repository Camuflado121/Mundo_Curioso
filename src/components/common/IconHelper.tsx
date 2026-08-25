import React from 'react';
import {
  Atom,
  Sparkles,
  Globe2,
  Flame,
  Landmark,
  Brain,
  Waves,
  Cpu,
  Compass,
  HeartPulse,
  Coins,
  Trophy,
  BookOpen,
  Clapperboard,
  BookMarked,
  HelpCircle,
  LucideProps
} from 'lucide-react';

const iconMap: Record<string, React.FC<LucideProps>> = {
  Atom,
  Sparkles,
  Globe2,
  Globe: Globe2,
  Flame,
  Landmark,
  Brain,
  Waves,
  Cpu,
  Compass,
  HeartPulse,
  Coins,
  Trophy,
  BookOpen,
  Clapperboard,
  BookMarked,
};

interface IconHelperProps extends LucideProps {
  name: string;
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, ...props }) => {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent {...props} />;
};
