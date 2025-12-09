import React from "react";

interface ThreeDButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "orange" | "dark" | "blue" | "pink" | "lime";
  className?: string;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}

export const ThreeDButton: React.FC<ThreeDButtonProps> = ({
  onClick,
  children,
  variant = "orange",
  className = "",
  disabled = false,
  active = false,
  title,
}) => {
  const baseStyles =
    "relative transition-all duration-100 ease-in-out font-display font-bold uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center select-none";

  const variants = {
    orange: {
      top: "bg-orange-500 text-white border-orange-400",
      side: "bg-orange-700",
      activeTop: "bg-orange-400",
    },
    dark: {
      top: "bg-slate-700 text-slate-200 border-slate-600",
      side: "bg-slate-900",
      activeTop: "bg-slate-600",
    },
    blue: {
      top: "bg-cyan-600 text-white border-cyan-400",
      side: "bg-cyan-800",
      activeTop: "bg-cyan-500",
    },
    pink: {
      top: "bg-pink-500 text-white border-pink-400",
      side: "bg-pink-700",
      activeTop: "bg-pink-400",
    },
    lime: {
      top: "bg-lime-500 text-slate-900 border-lime-400",
      side: "bg-lime-700",
      activeTop: "bg-lime-400",
    },
  };

  const currentVariant = variants[variant];
  const translateClass = (active || disabled) ? "translate-y-[2px]" : "-translate-y-1 active:translate-y-[2px]";
  const shadowClass = (active || disabled) ? "shadow-none" : "shadow-lg";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${className} group h-12 sm:h-14 w-full`}
      style={{ WebkitTapHighlightColor: "transparent" }}
      title={title}
    >
      {/* 3D Side (Depth) */}
      <div
        className={`absolute inset-0 rounded-lg ${currentVariant.side} translate-y-1`}
      ></div>

      {/* Top Face */}
      <div
        className={`absolute inset-0 rounded-lg border-t border-l ${
          currentVariant.top
        } ${translateClass} ${shadowClass} flex items-center justify-center gap-2 group-hover:brightness-110 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {children}
      </div>
    </button>
  );
};