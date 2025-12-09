import React from "react";

interface BlisterPackDisplayProps {
  imageSrc: string | null;
  label: string;
  placeholderText?: string;
  isLoading?: boolean;
  onClear?: () => void;
}

export const BlisterPackDisplay: React.FC<BlisterPackDisplayProps> = ({
  imageSrc,
  label,
  placeholderText = "No Signal",
  isLoading = false,
  onClear
}) => {
  return (
    <div className="relative flex flex-col group w-full h-full">
      {/* Packaging Header Cardboard Effect */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-12 rounded-t-xl border-b-4 border-black flex items-center justify-between px-4 shadow-inner z-10">
        <span className="font-display text-white text-sm tracking-[0.2em] font-bold">
          {label}
        </span>
        {/* Hanger Hole */}
        <div className="w-8 h-3 bg-black rounded-full opacity-40"></div>
        {/* Barcode lines fake */}
        <div className="flex gap-0.5 h-6 opacity-60">
          <div className="w-1 bg-white"></div>
          <div className="w-2 bg-white"></div>
          <div className="w-0.5 bg-white"></div>
          <div className="w-1.5 bg-white"></div>
        </div>
      </div>

      {/* Main Blister Pack Area */}
      <div className="relative flex-1 bg-slate-800 rounded-b-xl border-2 border-slate-700 shadow-2xl overflow-hidden min-h-[300px] md:min-h-[400px]">
        {/* Plastic Reflection Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent rounded-b-xl"></div>
        <div className="absolute top-2 right-2 z-20 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        {/* Content */}
        <div className="w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-slate-900 relative">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 animate-pulse">
               <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-orange-500 font-display text-sm tracking-widest animate-pulse">MANUFACTURING...</span>
            </div>
          ) : imageSrc ? (
            <>
              <img
                src={imageSrc}
                alt="Content"
                className="w-full h-full object-contain p-4 z-10 transition-transform duration-500 group-hover:scale-105"
              />
               {onClear && (
                <button 
                  onClick={onClear}
                  className="absolute top-4 right-4 z-30 bg-red-600 text-white rounded-full p-2 hover:bg-red-500 shadow-lg border border-red-400"
                  title="Remove Image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </>
          ) : (
            <div className="text-slate-600 font-display text-2xl uppercase tracking-widest text-center px-6">
              {placeholderText}
            </div>
          )}
        </div>
      </div>
      
      {/* Price Tag Sticker */}
      <div className="absolute -bottom-4 -right-4 z-30 bg-yellow-400 text-black font-bold font-display px-4 py-2 rotate-[-5deg] shadow-lg border-2 border-white rounded-sm transform transition-transform group-hover:rotate-0">
        <span className="text-xs block leading-none">GEMINI-2.5</span>
        <span className="text-lg">NFT-ED</span>
      </div>
    </div>
  );
};
