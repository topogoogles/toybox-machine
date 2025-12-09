import React, { useState, useRef } from "react";
import { AspectRatio, ToyBoxState, HistoryItem } from "./types";
import { generateToyBox, enhancePrompt, generateBrainstorming } from "./services/geminiService";
import { ThreeDButton } from "./components/ThreeDButton";
import { BlisterPackDisplay } from "./components/BlisterPackDisplay";
import { HistoryPanel } from "./components/HistoryPanel";

const App: React.FC = () => {
  const [state, setState] = useState<ToyBoxState>({
    inputImage: null,
    inputMimeType: "",
    userPrompt: "",
    generatedImage: null,
    isGenerating: false,
    isEnhancing: false,
    isAutoEnhance: false,
    isBrainstorming: false,
    brainstormingIdeas: null,
    aspectRatio: AspectRatio.SQUARE,
    error: null,
    history: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const brainstormInputRef = useRef<HTMLInputElement>(null);

  // Helper to convert file to base64
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setState((prev) => ({ ...prev, error: "Please upload a valid image file." }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 data (remove prefix like "data:image/jpeg;base64,")
      const base64Data = result.split(",")[1];
      setState((prev) => ({
        ...prev,
        inputImage: base64Data,
        inputMimeType: file.type,
        error: null,
        // Clear previous generation when new input is added
        generatedImage: null 
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRatioCycle = () => {
    const ratios = Object.values(AspectRatio);
    const currentIndex = ratios.indexOf(state.aspectRatio);
    const nextIndex = (currentIndex + 1) % ratios.length;
    setState((prev) => ({ ...prev, aspectRatio: ratios[nextIndex] }));
  };

  const handleGenerate = async () => {
    if (!state.inputImage && !state.userPrompt.trim()) {
      setState((prev) => ({ ...prev, error: "Please attach an image or enter a prompt." }));
      return;
    }

    setState((prev) => ({ ...prev, isGenerating: true, error: null, generatedImage: null }));

    try {
      let finalPrompt = state.userPrompt;

      // Auto-Enhance Logic
      if (state.isAutoEnhance && state.userPrompt.trim()) {
        setState(prev => ({ ...prev, isEnhancing: true })); // Visual feedback
        finalPrompt = await enhancePrompt(state.userPrompt);
        setState(prev => ({ ...prev, userPrompt: finalPrompt, isEnhancing: false }));
      }

      const result = await generateToyBox(
        finalPrompt,
        state.inputImage,
        state.inputMimeType,
        state.aspectRatio
      );

      if (result.imageUrl) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          imageUrl: result.imageUrl,
          prompt: finalPrompt,
          timestamp: Date.now()
        };

        setState((prev) => ({ 
          ...prev, 
          generatedImage: result.imageUrl,
          history: [newItem, ...prev.history].slice(0, 10) // Keep last 10
        }));
      } else {
        setState((prev) => ({ ...prev, error: "No image generated. Try a different prompt." }));
      }
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message || "Something went wrong." }));
      setState(prev => ({ ...prev, isEnhancing: false }));
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handleBrainstorm = async () => {
    setState(prev => ({ ...prev, isBrainstorming: true, brainstormingIdeas: null }));
    try {
      const ideas = await generateBrainstorming(
        state.userPrompt, 
        state.inputImage, 
        state.inputMimeType
      );
      setState(prev => ({ ...prev, brainstormingIdeas: ideas }));
    } catch (e) {
      console.error(e);
    } finally {
      setState(prev => ({ ...prev, isBrainstorming: false }));
    }
  };

  const handleDownload = () => {
    if (!state.generatedImage) return;
    
    const link = document.createElement('a');
    link.href = state.generatedImage;
    link.download = `toybox-nft-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearInput = () => {
    setState(prev => ({ ...prev, inputImage: null, inputMimeType: "" }));
    if(fileInputRef.current) fileInputRef.current.value = "";
    if(brainstormInputRef.current) brainstormInputRef.current.value = "";
  }

  const restoreHistoryItem = (item: HistoryItem) => {
    setState(prev => ({
      ...prev,
      generatedImage: item.imageUrl,
      userPrompt: item.prompt,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 md:p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"></div>
      </div>

      <div className="z-10 w-full max-w-7xl flex flex-col lg:flex-row gap-8">
        
        {/* Main Application Area */}
        <div className="flex-1 flex flex-col gap-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-4">
              <div>
                <h1 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  ToyBox
                </h1>
                <p className="text-cyan-400 font-mono text-sm tracking-[0.3em]">
                  NFT ROOM GENERATOR // POWERED BY GEMINI 2.5
                </p>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-xs text-slate-500 font-mono">SYS.READY</div>
                <div className="text-xs text-orange-500 font-mono animate-pulse">Waiting for input...</div>
              </div>
            </header>

            {/* Main Shelf Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* Left: Input */}
              <div className="h-[400px]">
                 <BlisterPackDisplay 
                    label="SOURCE MATERIAL" 
                    placeholderText="ATTACH IMAGE" 
                    imageSrc={state.inputImage ? `data:${state.inputMimeType};base64,${state.inputImage}` : null}
                    onClear={state.inputImage ? clearInput : undefined}
                 />
              </div>

              {/* Right: Output */}
              <div className="h-[400px]">
                 <BlisterPackDisplay 
                    label="COLLECTIBLE" 
                    placeholderText="WAITING FOR GEN..." 
                    imageSrc={state.generatedImage}
                    isLoading={state.isGenerating}
                 />
              </div>
            </div>

            {/* Brainstorming Section (Moved Up) */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-xl relative overflow-hidden group mt-4">
               <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 text-cyan-400 w-full md:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
                    <span className="font-display font-bold tracking-widest text-sm">BRAINSTORMING</span>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      {/* Image Reference Control */}
                      <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-1.5 border border-slate-700 hover:border-sky-500/50 transition-colors group/upload">
                        <div className="text-sky-400 group-hover/upload:scale-110 transition-transform">
                           {/* Sky blue image symbol */}
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                        <button 
                            onClick={() => brainstormInputRef.current?.click()}
                            className="text-xs font-mono text-slate-300 hover:text-white uppercase tracking-wider"
                        >
                            {state.inputImage ? "CHANGE REF" : "BROWSE"}
                        </button>
                         <input 
                          type="file" 
                          ref={brainstormInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                        />
                      </div>

                      {/* Divider */}
                      <div className="h-6 w-[1px] bg-slate-700 hidden md:block"></div>

                      <button 
                        onClick={handleBrainstorm}
                        disabled={state.isBrainstorming}
                        className="bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 text-xs px-4 py-1.5 rounded border border-cyan-700 transition-colors uppercase font-mono flex items-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      >
                        {state.isBrainstorming ? "THINKING..." : "GENERATE IDEAS"}
                      </button>
                  </div>
               </div>
               
               <div className="bg-black/30 rounded-lg p-3 min-h-[100px] border border-slate-700/50 relative">
                  {state.isBrainstorming ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : state.brainstormingIdeas ? (
                    <div className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {state.brainstormingIdeas}
                    </div>
                  ) : (
                    <div className="text-slate-600 text-xs font-mono text-center pt-8">
                       {state.inputImage ? "IMAGE ATTACHED. CLICK GENERATE TO ANALYZE & BRAINSTORM." : "UPLOAD A REFERENCE IMAGE TO DESCRIBE AND BRAINSTORM CONCEPTS."}
                    </div>
                  )}
               </div>
            </div>

            {/* Control Panel (Keyboard Shelf) */}
            <div className="bg-slate-800 rounded-xl p-3 md:p-5 border-t-4 border-slate-700 shadow-2xl relative transform perspective-1000 rotate-x-2">
                
                {/* Shelf highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>

                <div className="flex flex-col gap-4">
                   
                   {/* Prompt Input Line with Embedded Enhancer */}
                   <div className="bg-black/50 rounded-lg p-3 border border-slate-600 flex items-center shadow-inner relative transition-colors focus-within:border-cyan-500/50">
                      <span className="text-green-500 font-mono mr-2 text-lg">{">"}</span>
                      <input
                        type="text"
                        value={state.userPrompt}
                        onChange={(e) => setState(prev => ({ ...prev, userPrompt: e.target.value }))}
                        placeholder="Describe the room style, items, or specific details to add..."
                        className="bg-transparent border-none outline-none text-white font-mono w-full placeholder-slate-500 text-sm md:text-lg pr-24"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        disabled={state.isGenerating || state.isEnhancing}
                      />
                      
                      {/* Embedded Enhancer Toggle */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
                        <div 
                          className={`text-lime-400 ${state.isEnhancing ? 'animate-spin' : ''}`} 
                          title="Prompt Enhancer"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        </div>
                        <div className="h-4 w-[1px] bg-slate-700"></div>
                        <input 
                          type="checkbox" 
                          checked={state.isAutoEnhance}
                          onChange={(e) => setState(prev => ({ ...prev, isAutoEnhance: e.target.checked }))}
                          className="w-4 h-4 accent-lime-500 cursor-pointer rounded border-slate-600 bg-slate-800"
                          title="Auto-Enhance Prompt"
                        />
                      </div>
                   </div>

                   {/* Error Message */}
                   {state.error && (
                     <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded font-mono text-sm flex items-center">
                       <span className="mr-2">⚠</span> {state.error}
                     </div>
                   )}

                   {/* Buttons Row */}
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                      
                      {/* Attach Button */}
                      <ThreeDButton 
                        variant="blue" 
                        onClick={triggerFileSelect}
                        title="Upload reference image"
                        disabled={state.isGenerating}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                      </ThreeDButton>

                      {/* Ratio Button */}
                      <ThreeDButton 
                        variant="dark" 
                        onClick={handleRatioCycle}
                        title="Change Aspect Ratio"
                        disabled={state.isGenerating}
                      >
                        <span className="text-xs">{state.aspectRatio}</span>
                      </ThreeDButton>

                      {/* Generate Button (Lime) */}
                      <ThreeDButton 
                        variant="lime" 
                        onClick={handleGenerate} 
                        disabled={state.isGenerating}
                        className="sm:col-span-1"
                        title="Generate Image"
                      >
                         {state.isGenerating ? (
                           <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                         ) : (
                           <>
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>
                             <span className="hidden lg:inline text-xs font-black">GENERATE</span>
                           </>
                         )}
                      </ThreeDButton>

                      {/* Download Button (Hot Pink) */}
                      <ThreeDButton 
                        variant="pink" 
                        onClick={handleDownload} 
                        disabled={!state.generatedImage || state.isGenerating}
                        title="Download Image"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                         <span className="hidden lg:inline text-xs font-black">SAVE</span>
                      </ThreeDButton>

                   </div>
                </div>
            </div>
            
            <div className="text-center text-slate-600 text-xs font-mono">
              NANO BANANA MODEL DETECTED // PREVIEW BUILD 0.96
            </div>
        </div>

        {/* Right Sidebar: History (Collapses on small screens) */}
        <div className="w-full lg:w-80 shrink-0 h-[300px] lg:h-auto lg:min-h-[600px]">
           <HistoryPanel history={state.history} onSelect={restoreHistoryItem} />
        </div>

      </div>
    </div>
  );
};

export default App;