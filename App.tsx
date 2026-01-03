
import React, { useState, useEffect, useRef } from 'react';
import { AppState, SubjectItem, PageSize, TagSize, PrintMode, ThemeType, PageLayout } from './types';
import { THEMES, SIZE_PRESETS, PAGE_DIMENSIONS } from './constants';
import NameTag from './components/NameTag';
import { generateSubjectImage } from './services/gemini';

declare var html2pdf: any;
declare var window: any;

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<AppState>({
    userName: '',
    className: '',
    theme: 'luxury',
    tagSize: 'medium',
    pageSize: 'A4',
    tagGap: 6, 
    showCuttingGuides: true,
    globalQuote: 'Learning never exhausts the mind.',
    companyName: 'STUDENT STUDIO',
    accentColor: '#D4AF37',
    isDarkMode: true,
    printMode: 'color',
    subjects: [
      { id: 's1', name: 'Mathematics' },
      { id: 's2', name: 'Science' },
      { id: 's3', name: 'Art' },
      { id: 's4', name: 'English' }
    ],
    pages: [
      { id: 'p1', tagIds: ['s1', 's2', 's3', 's4'] }
    ]
  });

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
      setIsInitializing(false);
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'range' ? parseInt(value) : value);
    setState(prev => ({ ...prev, [name]: finalValue }));
  };

  const setPrintMode = (mode: PrintMode) => {
    const firstCompatibleTheme = THEMES.find(t => t.mode === mode)?.id || (mode === 'bw' ? 'mono' : 'luxury');
    setState(prev => ({ ...prev, printMode: mode, theme: firstCompatibleTheme as ThemeType }));
  };

  const addSubject = () => {
    const id = 's' + Math.random().toString(36).substr(2, 9);
    setState(prev => {
      const newSubject = { id, name: 'New Subject' };
      const lastPage = prev.pages[prev.pages.length - 1];
      const updatedPages = [...prev.pages];
      updatedPages[updatedPages.length - 1] = { ...lastPage, tagIds: [...lastPage.tagIds, id] };
      return { ...prev, subjects: [...prev.subjects, newSubject], pages: updatedPages };
    });
  };

  const addPage = () => {
    const id = 'p' + Math.random().toString(36).substr(2, 9);
    setState(prev => ({ ...prev, pages: [...prev.pages, { id, tagIds: [] }] }));
  };

  const removePage = (pageId: string) => {
    if (state.pages.length <= 1) return;
    setState(prev => {
      const pageToRemove = prev.pages.find(p => p.id === pageId);
      const remainingPages = prev.pages.filter(p => p.id !== pageId);
      remainingPages[0].tagIds = [...remainingPages[0].tagIds, ...(pageToRemove?.tagIds || [])];
      return { ...prev, pages: remainingPages };
    });
  };

  const moveTag = (subjectId: string, fromPageId: string, toPageId: string) => {
    setState(prev => {
      const updatedPages = prev.pages.map(p => {
        if (p.id === fromPageId) return { ...p, tagIds: p.tagIds.filter(id => id !== subjectId) };
        if (p.id === toPageId) return { ...p, tagIds: [...p.tagIds, subjectId] };
        return p;
      });
      return { ...prev, pages: updatedPages };
    });
  };

  const reorderTag = (subjectId: string, pageId: string, direction: 'up' | 'down') => {
    setState(prev => {
      const updatedPages = prev.pages.map(p => {
        if (p.id !== pageId) return p;
        const idx = p.tagIds.indexOf(subjectId);
        const newIds = [...p.tagIds];
        if (direction === 'up' && idx > 0) [newIds[idx], newIds[idx-1]] = [newIds[idx-1], newIds[idx]];
        if (direction === 'down' && idx < newIds.length - 1) [newIds[idx], newIds[idx+1]] = [newIds[idx+1], newIds[idx]];
        return { ...p, tagIds: newIds };
      });
      return { ...prev, pages: updatedPages };
    });
  };

  const generateAIImage = async (subject: SubjectItem) => {
    if (!hasApiKey) await handleOpenKeySelector();
    setLoadingAction(subject.id);
    try {
      const imageUrl = await generateSubjectImage(subject.name);
      setState(prev => ({
        ...prev,
        subjects: prev.subjects.map(s => s.id === subject.id ? { ...s, imageUrl } : s)
      }));
    } catch (err) { console.error(err); } finally { setLoadingAction(null); }
  };

  const handleDownloadPDF = async () => {
    if (!printableRef.current || typeof html2pdf === 'undefined') return;
    setIsGeneratingPDF(true);
    
    const element = printableRef.current;
    const opt = {
      margin: 0,
      filename: `book-labels-${state.userName || 'print'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true, 
        backgroundColor: '#ffffff',
        scrollY: 0,
        scrollX: 0
      },
      jsPDF: { unit: 'mm', format: state.pageSize.toLowerCase(), orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], before: '.pdf-page-break' }
    };

    try {
      // Ensure we are at the top so capture doesn't shift
      window.scrollTo(0, 0);
      await html2pdf().set(opt).from(element).save();
    } catch (err) { 
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally { 
      setIsGeneratingPDF(false); 
    }
  };

  if (isInitializing) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 bg-[#D4AF37] rounded-xl animate-pulse"></div>
      <div className="text-[#D4AF37] font-black uppercase tracking-[0.5em] text-xs">Initializing...</div>
    </div>
  );

  const pageDims = PAGE_DIMENSIONS[state.pageSize];
  const activeThemes = THEMES.filter(t => t.mode === state.printMode);

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-['Fredoka'] overflow-hidden h-screen bg-[#080808] text-slate-100`}>
      {/* Sidebar Controls */}
      <aside className="w-full md:w-[380px] p-8 no-print flex flex-col h-full overflow-y-auto border-r border-white/5 bg-black/80 backdrop-blur-3xl shadow-2xl">
        <div className="mb-8 pb-6 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center text-black font-['Bungee'] text-lg">L</div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-none">LIGHTNING</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mt-1">Book Label Studio</p>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          {/* Identity */}
          <section className="space-y-4">
            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 border-l border-[#D4AF37] pl-3">Identification</h2>
            <div className="space-y-3">
              <input type="text" name="userName" value={state.userName} onChange={handleGlobalChange} placeholder="Full Name" className="w-full bg-white/5 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-[#D4AF37]/50" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="className" value={state.className} onChange={handleGlobalChange} placeholder="Class" className="w-full bg-white/5 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-[#D4AF37]/50" />
                <input type="text" name="companyName" value={state.companyName} onChange={handleGlobalChange} placeholder="School" className="w-full bg-white/5 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-[#D4AF37]/50" />
              </div>
            </div>
          </section>

          {/* Mode Selection */}
          <section className="space-y-4">
            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 border-l border-[#D4AF37] pl-3">Printer Output</h2>
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
              <button 
                onClick={() => setPrintMode('color')} 
                className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${state.printMode === 'color' ? 'bg-[#D4AF37] text-black' : 'text-slate-500 hover:text-white'}`}
              >
                COLOR
              </button>
              <button 
                onClick={() => setPrintMode('bw')} 
                className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${state.printMode === 'bw' ? 'bg-[#D4AF37] text-black' : 'text-slate-500 hover:text-white'}`}
              >
                B&W / INK SAVE
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              {activeThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setState(prev => ({ ...prev, theme: theme.id }))}
                  className={`p-2.5 text-[8px] border font-black rounded-xl transition-all ${state.theme === theme.id ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </section>

          {/* Subjects */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-l border-[#D4AF37] pl-3">
              <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Labels</h2>
              <button onClick={addSubject} className="text-[8px] font-black text-[#D4AF37] hover:tracking-widest transition-all">ADD NEW</button>
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scroll">
              {state.subjects.map((s) => (
                <div key={s.id} className="flex items-center gap-2 p-2 bg-white/5 border border-white/5 rounded-xl">
                  <button 
                    onClick={() => generateAIImage(s)} 
                    className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-[10px] flex-shrink-0"
                    title="Generate Icon"
                  >
                    {loadingAction === s.id ? <div className="w-2 h-2 border-t-white border-white/20 border rounded-full animate-spin"></div> : (s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-contain p-1" /> : '🎨')}
                  </button>
                  <input 
                    value={s.name} 
                    onChange={(e) => setState(p => ({...p, subjects: p.subjects.map(sub => sub.id === s.id ? {...sub, name: e.target.value} : sub)}))} 
                    className="bg-transparent text-[10px] font-bold outline-none flex-1 truncate"
                  />
                  <button 
                    onClick={() => {
                      const subjectToDelete = s.id;
                      setState(p => ({
                        ...p,
                        subjects: p.subjects.filter(sub => sub.id !== subjectToDelete),
                        pages: p.pages.map(pg => ({...pg, tagIds: pg.tagIds.filter(tid => tid !== subjectToDelete)}))
                      }));
                    }} 
                    className="text-slate-600 hover:text-rose-500 px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Sizing */}
          <section className="space-y-4">
            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 border-l border-[#D4AF37] pl-3">Dimensions</h2>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-[7px] font-bold text-slate-600 uppercase">Label Size</label>
                 <select name="tagSize" value={state.tagSize} onChange={handleGlobalChange} className="w-full bg-white/5 border border-white/5 p-2.5 text-[10px] font-bold rounded-xl mt-1 outline-none text-white">
                   <option value="small">Small</option>
                   <option value="medium">Medium</option>
                   <option value="large">Large</option>
                 </select>
               </div>
               <div>
                 <label className="text-[7px] font-bold text-slate-600 uppercase">Guides</label>
                 <button onClick={() => setState(p => ({...p, showCuttingGuides: !p.showCuttingGuides}))} className={`w-full p-2.5 text-[10px] font-bold rounded-xl mt-1 border ${state.showCuttingGuides ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/5 text-slate-500'}`}>
                   {state.showCuttingGuides ? 'LINES ON' : 'HIDDEN'}
                 </button>
               </div>
            </div>
          </section>
        </div>

        <button 
          onClick={handleDownloadPDF} 
          disabled={isGeneratingPDF} 
          className="mt-10 w-full bg-[#D4AF37] text-black font-black py-4 text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:bg-[#E5C351] active:scale-95 transition-all"
        >
          {isGeneratingPDF ? 'PREPARING PDF...' : 'GENERATE PDF'}
        </button>
      </aside>

      {/* Main Workspace - Focus on Page Canvas */}
      <main className="flex-1 bg-[#050505] overflow-y-auto py-16 px-10 custom-scroll">
        <div className="mx-auto flex flex-col items-center space-y-16 print:space-y-0" ref={printableRef}>
          {state.pages.map((page, pIdx) => (
            <div 
              key={page.id}
              className={`a4-page relative border border-white/5 bg-white flex flex-col flex-shrink-0 transition-shadow duration-300 ${pIdx > 0 ? 'pdf-page-break mt-16' : ''} sticker-sheet`}
              style={{ width: pageDims.width, height: pageDims.height, minHeight: pageDims.height, padding: '15mm' }}
            >
              {/* Management Controls - Hidden in PDF */}
              <div className="absolute top-6 left-8 text-[8px] font-black text-slate-300 no-print uppercase flex gap-4 items-center">
                <span className="bg-slate-100 text-slate-400 px-2 py-1 rounded">SHEET {pIdx + 1}</span>
                <button 
                  onClick={() => removePage(page.id)} 
                  className="text-rose-400 hover:text-rose-600 transition-colors"
                >
                  REMOVE SHEET
                </button>
              </div>
              
              <div 
                className="flex flex-wrap justify-center content-start w-full h-full pt-8"
                style={{ gap: `${state.tagGap}mm` }}
              >
                {page.tagIds.map((tagId, tIdx) => {
                  const subject = state.subjects.find(s => s.id === tagId);
                  if (!subject) return null;
                  return (
                    <NameTag 
                      key={tagId}
                      state={state}
                      subject={subject}
                      index={tIdx} 
                      pageId={page.id}
                      onMove={moveTag}
                      onReorder={reorderTag}
                    />
                  );
                })}
                {page.tagIds.length === 0 && (
                  <div className="w-full h-48 flex items-center justify-center border-2 border-dashed border-slate-100 text-slate-300 font-bold uppercase text-[9px] no-print">
                    No labels on this sheet.
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <button 
            onClick={addPage} 
            className="w-[210mm] py-8 border-2 border-dashed border-white/10 rounded-3xl text-slate-700 font-black tracking-[0.4em] hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all no-print uppercase text-[10px]"
          >
            + INSERT NEW SHEET
          </button>
        </div>
      </main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #1A1A1A; border-radius: 10px; }
        
        .sticker-sheet {
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
        }

        @media print {
          .a4-page { 
            box-shadow: none !important; 
            margin: 0 !important; 
            border: none !important; 
            width: 210mm !important; 
            height: 297mm !important; 
            padding: 15mm !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
          }
          .pdf-page-break { 
            page-break-before: always !important; 
            break-before: page !important; 
            display: block !important; 
            margin: 0 !important;
          }
          .no-print { display: none !important; visibility: hidden !important; }
          body, main { background: white !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
