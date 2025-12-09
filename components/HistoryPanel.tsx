import React from "react";
import { HistoryItem } from "../types";

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
  return (
    <div className="w-full h-full bg-slate-900/80 border-l border-white/10 p-4 flex flex-col backdrop-blur-sm rounded-xl border border-slate-800">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <h2 className="font-display text-cyan-400 tracking-[0.2em] text-sm font-bold">RECOVERY DRIVE</h2>
        <span className="text-xs font-mono text-slate-500">{history.length}/10</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {history.length === 0 ? (
          <div className="text-center text-slate-600 font-mono text-xs py-10 opacity-50">
            NO DATA FOUND
            <br />
            GENERATE TO SAVE
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="group relative bg-slate-800 border border-slate-700 rounded-lg p-2 cursor-pointer hover:border-cyan-500 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 shrink-0 bg-slate-950 rounded-md overflow-hidden border border-slate-600">
                  <img
                    src={item.imageUrl}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between min-w-0 flex-1">
                  <p className="text-xs text-slate-300 font-mono truncate line-clamp-2 leading-tight">
                    {item.prompt || "No prompt"}
                  </p>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-cyan-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      RESTORE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};