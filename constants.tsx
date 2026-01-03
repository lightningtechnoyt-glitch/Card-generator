
import { ThemeConfig } from './types';

export const THEMES: ThemeConfig[] = [
  // COLOR THEMES
  {
    id: 'luxury',
    name: 'Midnight Gold',
    bgColor: 'bg-[#0F0F10]',
    borderColor: 'border-[#D4AF37]/30',
    textColor: 'text-[#D4AF37]',
    fontFamily: "font-['Fredoka']",
    headingFont: 'font-black tracking-tighter uppercase italic',
    style: 'border-[1px] rounded-2xl shadow-sm ring-1 ring-[#D4AF37]/20',
    mode: 'color'
  },
  {
    id: 'minimalist',
    name: 'Obsidian Pearl',
    bgColor: 'bg-[#121212]',
    borderColor: 'border-white/10',
    textColor: 'text-slate-100',
    fontFamily: "font-['Fredoka']",
    headingFont: 'font-bold tracking-tight',
    style: 'border-[1px] rounded-3xl',
    mode: 'color'
  },
  {
    id: 'scholar',
    name: 'Royal Crest',
    bgColor: 'bg-[#1A1A2E]',
    borderColor: 'border-[#FFD700]/40',
    textColor: 'text-[#FFD700]',
    fontFamily: "font-['Quicksand']",
    headingFont: 'font-black tracking-wider uppercase',
    style: 'border-[2px] rounded-2xl',
    mode: 'color'
  },
  // B&W THEMES
  {
    id: 'mono',
    name: 'Classic Ink',
    bgColor: 'bg-white',
    borderColor: 'border-black',
    textColor: 'text-black',
    fontFamily: "font-['Fredoka']",
    headingFont: 'font-black uppercase',
    style: 'border-[2px] rounded-none',
    mode: 'bw'
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    bgColor: 'bg-white',
    borderColor: 'border-black',
    textColor: 'text-black',
    fontFamily: "font-['Courier New']",
    headingFont: 'font-bold tracking-tighter underline',
    style: 'border-[1px] border-dashed rounded-lg',
    mode: 'bw'
  },
  {
    id: 'sketch',
    name: 'Hand Drawn',
    bgColor: 'bg-white',
    borderColor: 'border-black',
    textColor: 'text-black',
    fontFamily: "font-['Quicksand']",
    headingFont: 'font-semibold italic',
    style: 'border-[3px] rounded-[2rem] border-double',
    mode: 'bw'
  }
];

export const SIZE_PRESETS = {
  small: 'w-[75mm] h-[40mm]',
  medium: 'w-[95mm] h-[55mm]',
  large: 'w-[110mm] h-[70mm]'
};

export const PAGE_DIMENSIONS = {
  A4: { width: '210mm', height: '297mm', label: 'A4 (Standard)' },
  Letter: { width: '215.9mm', height: '279.4mm', label: 'Letter (US)' },
  A5: { width: '148mm', height: '210mm', label: 'A5 (Small)' }
};
