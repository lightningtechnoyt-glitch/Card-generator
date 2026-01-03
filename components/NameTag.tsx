
import React from 'react';
import { AppState, SubjectItem } from '../types';
import { THEMES, SIZE_PRESETS } from '../constants';

interface NameTagProps {
  state: AppState;
  subject: SubjectItem;
  index: number;
  pageId: string;
  onMove: (subjectId: string, fromPageId: string, toPageId: string) => void;
  onReorder: (subjectId: string, pageId: string, direction: 'up' | 'down') => void;
}

const NameTag: React.FC<NameTagProps> = ({ state, subject, index, pageId, onMove, onReorder }) => {
  const theme = THEMES.find(t => t.id === state.theme) || THEMES[0];
  const sizeClass = SIZE_PRESETS[state.tagSize];
  const isBW = state.printMode === 'bw';

  return (
    <div className="relative flex flex-col items-center">
      {/* Interaction Controls - Strictly hidden in print */}
      <div className="absolute -top-8 left-0 right-0 flex justify-between px-1 no-print z-50">
        <div className="flex gap-1">
          <button 
            onClick={() => onReorder(subject.id, pageId, 'up')} 
            className="bg-slate-800 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded border border-white/20 hover:bg-slate-700"
            title="Move Up/Left"
          >
            ←
          </button>
          <button 
            onClick={() => onReorder(subject.id, pageId, 'down')} 
            className="bg-slate-800 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded border border-white/20 hover:bg-slate-700"
            title="Move Down/Right"
          >
            →
          </button>
        </div>
        <select 
          onChange={(e) => onMove(subject.id, pageId, e.target.value)}
          value={pageId}
          className="bg-slate-800 text-white text-[9px] px-1 rounded border border-white/20 outline-none"
        >
          {state.pages.map((p, i) => (
            <option key={p.id} value={p.id}>Page {i + 1}</option>
          ))}
        </select>
      </div>

      <style>{`
        .bw-filter { filter: grayscale(1) contrast(1.1); }
        .tag-container { 
          box-sizing: border-box; 
          position: relative; 
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      `}</style>

      {/* Cutting Guides - Only show if enabled in state */}
      {state.showCuttingGuides && (
        <div className="absolute -inset-0.5 border border-dashed border-slate-300 pointer-events-none rounded-sm z-0"></div>
      )}

      <div 
        className={`
          tag-container ${sizeClass} p-6 flex flex-col justify-between overflow-hidden z-10
          ${theme.bgColor} ${theme.borderColor} ${theme.textColor} ${theme.fontFamily}
          ${theme.style} ${isBW ? 'bw-filter border-black text-black bg-white' : ''}
        `}
      >
        {/* Decorative Element - Hidden in BW for ink saving */}
        {!isBW && (
          <div 
            className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-10 blur-2xl"
            style={{ backgroundColor: state.accentColor }}
          />
        )}

        <div className="relative z-10 flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isBW ? 'opacity-100' : 'opacity-40'}`}>Property Of</span>
            <h2 className={`${theme.headingFont} ${state.tagSize === 'large' ? 'text-2xl' : 'text-xl'} leading-tight truncate`}>
              {state.userName || 'Student Name'}
            </h2>
          </div>

          <div className={`relative w-12 h-12 rounded-lg border flex-shrink-0 flex items-center justify-center bg-white/5 ${isBW ? 'border-black' : 'border-white/10'}`}>
            {subject.imageUrl ? (
              <img 
                src={subject.imageUrl} 
                className={`w-full h-full object-contain p-2 ${isBW ? 'grayscale' : ''}`}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="text-lg">📚</div>
            )}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3 mt-4">
          <div className={`p-2 rounded border ${isBW ? 'bg-white border-black' : 'bg-white/5 border-white/5'}`}>
            <span className="text-[6px] font-black uppercase opacity-60 block tracking-tighter">Subject</span>
            <div className="text-[10px] font-bold truncate uppercase">{subject.name}</div>
          </div>
          <div className={`p-2 rounded border ${isBW ? 'bg-white border-black' : 'bg-white/5 border-white/5'}`}>
            <span className="text-[6px] font-black uppercase opacity-60 block tracking-tighter">Class</span>
            <div className="text-[10px] font-bold truncate uppercase">{state.className || 'Academic'}</div>
          </div>
        </div>

        <div className={`relative z-10 mt-auto pt-3 flex items-end justify-between border-t ${isBW ? 'border-black' : 'border-white/5'}`}>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="text-[7px] font-bold uppercase opacity-40 truncate">{state.companyName || 'Institutional'}</span>
            <span className="text-[9px] italic opacity-70 truncate mt-0.5 leading-tight">
              {state.globalQuote}
            </span>
          </div>
          <div className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black ${isBW ? 'border border-black bg-white text-black' : 'bg-[#D4AF37] text-black'}`}>
            {index + 1}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameTag;
