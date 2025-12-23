import React, { useState, useEffect, useCallback, useRef } from 'react';
import InfoPanel from './components/InfoPanel';
import CandleChart from './components/CandleChart';
import Ticker from './components/Ticker';
import { generateLifeScript } from './services/geminiService';
import { AppState, CandleData, LifeEvent, UserProfile } from './types';

// Constants
const INITIAL_SCORE = 50;
const SIMULATION_SPEED_MS = 300; // Time per "year"

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    birthDate: '',
    gender: 'MALE'
  });
  
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [eventsLog, setEventsLog] = useState<LifeEvent[]>([]);
  const [scriptedEvents, setScriptedEvents] = useState<LifeEvent[]>([]);
  
  const [currentAge, setCurrentAge] = useState(0);
  const [currentScore, setCurrentScore] = useState(INITIAL_SCORE);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulation Logic for one year
  const simulateYear = useCallback((age: number, prevClose: number, script: LifeEvent[]) => {
    // 1. Check for scripted events
    const yearEvents = script.filter(e => e.age === age);
    
    // 2. Calculate Volatility (Random market noise)
    // Base volatility
    let volatility = (Math.random() - 0.5) * 10; 
    
    // 3. Apply Event Impact
    let eventImpact = 0;
    yearEvents.forEach(e => {
      eventImpact += e.impact * 2; // Amplify event impact
    });

    // 4. Determine Close Price
    // Momentum factor: if previous year was good, slightly higher chance of good year, but mean reversion applies
    const momentum = (prevClose - 50) * -0.05; // Mean reversion to 50
    const close = Math.max(0, Math.min(120, prevClose + volatility + eventImpact + momentum));

    // 5. Determine High/Low
    const vals = [prevClose, close];
    const range = Math.abs(prevClose - close);
    // Add wicks
    const high = Math.max(...vals) + Math.random() * (range * 0.5 + 2);
    const low = Math.min(...vals) - Math.random() * (range * 0.5 + 2);

    const candle: CandleData = {
      age,
      open: prevClose,
      close,
      high,
      low,
      events: yearEvents,
      trend: close > prevClose ? 'up' : close < prevClose ? 'down' : 'flat'
    };

    return candle;
  }, []);

  const startSimulation = async () => {
    setAppState(AppState.GENERATING);
    
    // Generate Script
    const script = await generateLifeScript(profile);
    setScriptedEvents(script);
    
    // Reset Data
    setCandles([]);
    setEventsLog([]);
    setCurrentAge(0);
    setCurrentScore(INITIAL_SCORE);
    
    setAppState(AppState.SIMULATING);
  };

  useEffect(() => {
    if (appState === AppState.SIMULATING) {
      timerRef.current = setInterval(() => {
        setCurrentAge(prevAge => {
          const nextAge = prevAge + 1;
          
          if (nextAge > 80) {
            setAppState(AppState.FINISHED);
            return prevAge;
          }

          // Calculate new candle based on previous state
          // Note: accessing currentScore directly in interval might be stale if not careful, 
          // but we are using functional updates or ref logic usually. 
          // Here we rely on the state update chain.
          // To fix stale closure, we need to calculate inside the setCandles or use a ref for lastClose.
          // Let's use the functional update of setCandles to get the TRUE last close.
          
          setCandles(prevCandles => {
            const lastCandle = prevCandles[prevCandles.length - 1];
            const prevClose = lastCandle ? lastCandle.close : INITIAL_SCORE;
            
            const newCandle = simulateYear(nextAge, prevClose, scriptedEvents);
            
            // Side Effects (Syncing other states)
            setCurrentScore(newCandle.close);
            if (newCandle.events.length > 0) {
              setEventsLog(prevLogs => [...prevLogs, ...newCandle.events]);
            }
            
            return [...prevCandles, newCandle];
          });

          return nextAge;
        });
      }, SIMULATION_SPEED_MS);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appState, scriptedEvents, simulateYear]);

  // Calculate current change
  const currentTrend = candles.length > 0 
    ? candles[candles.length - 1].close - candles[candles.length - 1].open 
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans text-gray-900 overflow-hidden">
      {/* Overlay for Loading / Input */}
      {appState === AppState.GENERATING && (
         <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
           <div className="text-center">
             <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
             <p className="font-mono text-sm tracking-widest animate-pulse">READING CELESTIAL DATA...</p>
           </div>
         </div>
      )}

      <InfoPanel 
        appState={appState}
        profile={profile}
        setProfile={setProfile}
        onStart={startSimulation}
        currentAge={currentAge}
        currentScore={currentScore}
        currentTrend={currentTrend}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl mx-auto w-full border-x-2 border-black bg-white shadow-2xl my-4 md:h-[600px]">
        {/* Left: Chart */}
        <div className="flex-1 flex flex-col relative">
          <div className="absolute top-4 left-4 z-10 opacity-10 pointer-events-none">
            <h1 className="text-9xl font-bold font-serif tracking-tighter">LIFE</h1>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-4">
             {candles.length === 0 && appState !== AppState.IDLE ? (
               <div className="font-mono text-xs">INITIALIZING MARKET...</div>
             ) : (
               <CandleChart data={candles} maxAge={currentAge < 80 ? 80 : currentAge} />
             )}
          </div>
        </div>

        {/* Right: Event Log (Ticker) */}
        <div className="h-64 md:h-auto md:w-80 flex-shrink-0">
          <Ticker events={eventsLog} lastEvent={eventsLog.length > 0 ? eventsLog[eventsLog.length - 1] : null} />
        </div>
      </div>
      
      {appState === AppState.FINISHED && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
           <button 
             onClick={() => setAppState(AppState.IDLE)}
             className="bg-black text-white px-8 py-3 font-bold border-2 border-white shadow-lg hover:bg-gray-800"
           >
             RESTART SIMULATION
           </button>
        </div>
      )}
    </div>
  );
};

export default App;