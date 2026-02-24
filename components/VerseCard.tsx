import React from 'react';
import { VerseResult } from '../types';

interface VerseCardProps {
  verse: VerseResult;
  index: number;
}

export const VerseCard: React.FC<VerseCardProps> = ({ verse, index }) => {
  return (
    <div 
      className="bg-white p-8 md:p-10 rounded-3xl shadow-float border border-stone-100/50 mb-8 animate-fade-in-up hover:shadow-lg transition-shadow duration-500"
      style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex flex-col gap-6">
        <header className="flex justify-between items-center pb-2">
          <h3 className="font-sans font-bold text-stone-400 text-xs tracking-[0.2em] uppercase">
            {verse.reference}
          </h3>
          {verse.is_paraphrase && (
            <span className="text-[10px] uppercase tracking-wider bg-stone-100 text-stone-500 px-3 py-1 rounded-full font-bold">
              Paraphrase
            </span>
          )}
        </header>

        <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-stone-800 text-center px-4">
          "{verse.text}"
        </blockquote>

        <div className="mt-6 pt-6 border-t border-stone-100 flex flex-col items-center text-center">
          <p className="text-stone-500 text-sm font-medium mb-4 italic max-w-lg">
             {verse.why_relevant_one_line}
          </p>
          
          <a 
            href={verse.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-full bg-stone-50 text-xs font-bold text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-all uppercase tracking-wider group"
          >
            Read Full Chapter
            <svg className="w-3 h-3 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};