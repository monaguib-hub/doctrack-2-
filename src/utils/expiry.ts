import { AlertOctagon, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export type ExpiryCategory = 'Expired' | 'Expiring < 30d' | 'Expiring < 60d' | 'Valid';

export interface ExpiryInfo {
  status: ExpiryCategory;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  icon: any;
  daysRemaining: number;
}

export function getExpiryDetails(expiryDateStr: string): ExpiryInfo {
  if (expiryDateStr === 'No Expiry') {
    return {
      status: 'Valid',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/50',
      icon: CheckCircle2,
      daysRemaining: Infinity
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalise to start of day
  const expiryDate = new Date(expiryDateStr);
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'Expired',
      colorClass: 'text-abs-red',
      bgClass: 'bg-abs-red/10',
      borderClass: 'border-abs-red/50',
      icon: AlertOctagon,
      daysRemaining: diffDays
    };
  }
  if (diffDays <= 30) {
    return {
      status: 'Expiring < 30d',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500/50',
      icon: AlertTriangle,
      daysRemaining: diffDays
    };
  }
  if (diffDays <= 60) {
    return {
      status: 'Expiring < 60d',
      colorClass: 'text-yellow-400',
      bgClass: 'bg-yellow-500/10',
      borderClass: 'border-yellow-500/50',
      icon: Clock,
      daysRemaining: diffDays
    };
  }

  return {
    status: 'Valid',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/50',
    icon: CheckCircle2,
    daysRemaining: diffDays
  };
}
