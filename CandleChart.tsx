import React, { useEffect, useRef } from 'react';
import { CandleData } from '../types';

interface CandleChartProps {
  data: CandleData[];
  maxAge: number;
}

const CandleChart: React.FC<CandleChartProps> = ({ data, maxAge }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to the right as data comes in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [data]);

  // Dimensions
  const candleWidth = 12;
  const candleGap = 6;
  const chartHeight = 400;
  const unitWidth = candleWidth + candleGap;
  const chartWidth = Math.max((maxAge + 1) * unitWidth, scrollRef.current?.clientWidth || 800);
  
  // Scale calculation
  // We assume the "Price" (Life Score) is roughly 0 to 100, but can go higher/lower.
  // We'll normalize to viewbox.
  const minScore = 0;
  const maxScore = 120; // Cap at 120 for visuals
  
  const getY = (val: number) => {
    // Invert Y axis, map 0-120 to height-0
    const normalized = Math.max(minScore, Math.min(val, maxScore));
    return chartHeight - (normalized / maxScore) * chartHeight;
  };

  return (
    <div 
      ref={scrollRef}
      className="w-full h-[450px] overflow-x-auto overflow-y-hidden border-b-2 border-black bg-white relative no-scrollbar"
    >
      <svg 
        width={chartWidth} 
        height={chartHeight + 40} // +40 for x-axis labels
        className="block"
      >
        {/* Grid Lines */}
        {[20, 50, 80, 100].map(level => (
          <line 
            key={level}
            x1={0} 
            y1={getY(level)} 
            x2={chartWidth} 
            y2={getY(level)} 
            stroke="#e5e5e5" 
            strokeDasharray="4 4" 
          />
        ))}

        {/* Candles */}
        {data.map((candle, index) => {
          const x = index * unitWidth + 10; // offset
          const yOpen = getY(candle.open);
          const yClose = getY(candle.close);
          const yHigh = getY(candle.high);
          const yLow = getY(candle.low);
          
          const isBullish = candle.close >= candle.open;
          
          // Candle Body Height
          let bodyHeight = Math.abs(yClose - yOpen);
          if (bodyHeight < 1) bodyHeight = 1; // Minimum 1px
          
          const bodyY = Math.min(yOpen, yClose);

          return (
            <g key={index} className="transition-all duration-300">
              {/* Wick (High-Low) */}
              <line 
                x1={x + candleWidth / 2} 
                y1={yHigh} 
                x2={x + candleWidth / 2} 
                y2={yLow} 
                stroke="black" 
                strokeWidth="1" 
              />
              
              {/* Body (Open-Close) */}
              <rect 
                x={x} 
                y={bodyY} 
                width={candleWidth} 
                height={bodyHeight} 
                fill={isBullish ? "white" : "black"} 
                stroke="black"
                strokeWidth="1"
              />

              {/* Age Label (every 5 years) */}
              {candle.age % 5 === 0 && (
                <text 
                  x={x + candleWidth / 2} 
                  y={chartHeight + 20} 
                  fontSize="10" 
                  textAnchor="middle" 
                  fill="#666"
                  fontFamily="Space Mono"
                >
                  {candle.age}
                </text>
              )}

              {/* Event Marker */}
              {candle.events.length > 0 && (
                <circle 
                  cx={x + candleWidth / 2}
                  cy={isBullish ? yHigh - 5 : yLow + 5}
                  r={2}
                  fill={isBullish ? "black" : "red"}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default CandleChart;
