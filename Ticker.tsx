import React, { useEffect, useRef } from 'react';
import { LifeEvent } from '../types';

interface TickerProps {
  events: LifeEvent[];
  lastEvent: LifeEvent | null;
}

const Ticker: React.FC<TickerProps> = ({ events, lastEvent }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="flex flex-col h-full border-l-2 border-black bg-white">
      <div className="p-2 border-b-2 border-black font-bold uppercase text-xs tracking-wider bg-black text-white">
        Market News / Life Events
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
        {events.length === 0 && (
          <div className="text-gray-400 text-center mt-10 italic">Waiting for market open...</div>
        )}
        
        {events.map((e, i) => (
          <div key={i} className="mb-2 border-b border-dashed border-gray-300 pb-2 last:border-0 animation-fade-in">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-bold text-xs bg-gray-200 px-1">AGE {e.age}</span>
              <span className={`text-xs ${e.impact > 0 ? 'text-black font-bold' : 'text-gray-500'}`}>
                {e.impact > 0 ? 'bullish' : e.impact < 0 ? 'bearish' : 'neutral'}
              </span>
            </div>
            <p className="leading-tight">{e.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Latest Alert Box */}
      {lastEvent && (
        <div className="p-4 border-t-4 border-black bg-gray-50">
          <div className="text-xs font-bold text-red-600 animate-pulse uppercase mb-1">
            Latest Breaking News
          </div>
          <div className="font-serif font-bold text-lg leading-tight">
            {lastEvent.content}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ticker;
