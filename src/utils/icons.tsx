import React from 'react';
import { 
  FileText, 
  Globe, 
  CreditCard, 
  Car, 
  Award, 
  ShieldCheck, 
  Activity, 
  Video, 
  Zap, 
  Flame, 
  Anchor, 
  Ship, 
  User,
  BadgeCheck,
  ClipboardCheck,
  HardHat,
  Stethoscope,
  Briefcase,
  Building,
  FileCheck,
  Scale
} from 'lucide-react';

export function getDocumentIcon(title: string) {
  const t = title.toLowerCase();

  // Passport & Identity
  if (t.includes('passport')) return Globe;
  if (t.includes('iqama') || t.includes('national id') || t.includes('id card')) return CreditCard;
  if (t.includes('card') || t.includes('sticker') || t.includes('arambo id')) return BadgeCheck;

  // Vehicles & Transportation
  if (t.includes('car') || t.includes('driving') || t.includes('tamm') || t.includes('authorization')) return Car;

  // Port & Shipping
  if (t.includes('port')) return Anchor;
  if (t.includes('ship') || t.includes('vessel')) return Ship;

  // Professional & Safety
  if (t.includes('surveyor') || t.includes('hardhat')) return HardHat;
  if (t.includes('huet') || t.includes('bosiet') || t.includes('safety') || t.includes('h2s')) return ShieldCheck;
  if (t.includes('lifejacket') || t.includes('extinguisher')) return Flame;
  if (t.includes('medical') || t.includes('health')) return Stethoscope;

  // Legal & Certificates
  if (t.includes('cr') || t.includes('license') || t.includes('certificate') || t.includes('sagia') || t.includes('gos')) return Award;
  if (t.includes('vat') || t.includes('zakat') || t.includes('tax')) return Scale;
  if (t.includes('contract') || t.includes('agreement')) return ClipboardCheck;
  if (t.includes('iso') || t.includes('quality')) return BadgeCheck;

  // Office & General
  if (t.includes('office') || t.includes('municipality') || t.includes('chamber')) return Building;
  if (t.includes('personnel')) return User;
  if (t.includes('report')) return FileCheck;

  // Default
  return FileText;
}
