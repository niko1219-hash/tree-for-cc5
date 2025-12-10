import React from 'react';

interface OverlayProps {
  isTreeForm: boolean;
  toggleForm: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ isTreeForm, toggleForm }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl md:text-6xl font-serif text-gradient-gold tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>
            ARIX
          </h1>
          <p className="text-white/60 text-sm md:text-base font-light tracking-widest mt-2 uppercase" style={{ fontFamily: '"Cinzel", serif' }}>
            Signature Collection
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-emerald-500 font-mono text-xs">EST. 2024</p>
          <p className="text-white/40 text-xs">INTERACTIVE EXPERIENCE</p>
        </div>
      </header>

      {/* Center Action */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Optional decorative center element */}
      </div>

      {/* Footer Controls */}
      <footer className="flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto">
        <div className="max-w-md text-center md:text-left">
           {/* Updated Text and Font */}
           <h2 className="text-4xl text-white font-festive mb-2 text-gradient-gold">
            CC ，圣诞节快乐~
           </h2>
        </div>

        <button
          onClick={toggleForm}
          className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] border border-white/20 hover:border-white/60 backdrop-blur-sm"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-900 to-black opacity-50 group-hover:opacity-70 transition-opacity" />
          <span className="relative z-10 font-serif text-lg tracking-widest text-white group-hover:text-yellow-200 transition-colors uppercase">
            {isTreeForm ? "Scatter Elements" : "Assemble Tree"}
          </span>
        </button>
      </footer>
    </div>
  );
};