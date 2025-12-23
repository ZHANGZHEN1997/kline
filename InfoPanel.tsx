import React from 'react';
import { AppState, UserProfile } from '../types';

interface InfoPanelProps {
  appState: AppState;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  onStart: () => void;
  currentAge: number;
  currentScore: number;
  currentTrend: number; // diff
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  appState, 
  profile, 
  setProfile, 
  onStart,
  currentAge,
  currentScore,
  currentTrend
}) => {
  if (appState === AppState.IDLE) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm z-50">
        <div className="bg-white border-2 border-black p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-3xl font-bold mb-6 text-center tracking-widest font-serif">K线人生</h1>
          <p className="mb-6 text-sm text-gray-600 text-center font-mono">
            输入你的八字信息，生成你的一生走势图。
            <br/>
            Life as a Stock Market.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">姓名 / Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full border-b border-black bg-transparent py-2 focus:outline-none focus:border-b-2 font-serif text-xl"
                placeholder="你的名字"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase mb-1">出生日期 / D.O.B</label>
              <input 
                type="date" 
                value={profile.birthDate}
                onChange={(e) => setProfile({...profile, birthDate: e.target.value})}
                className="w-full border-b border-black bg-transparent py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">性别 / Gender</label>
              <div className="flex gap-4 mt-2">
                {(['MALE', 'FEMALE', 'OTHER'] as const).map(g => (
                  <label key={g} className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      checked={profile.gender === g}
                      onChange={() => setProfile({...profile, gender: g})}
                      className="hidden peer"
                    />
                    <div className="w-4 h-4 border border-black mr-2 peer-checked:bg-black transition-colors"></div>
                    <span className="text-sm">{g === 'MALE' ? '男' : g === 'FEMALE' ? '女' : '其他'}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={onStart}
              disabled={!profile.name || !profile.birthDate}
              className="w-full mt-8 bg-black text-white py-3 font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors uppercase tracking-widest"
            >
              Start Simulation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Header Data Display
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b-2 border-black bg-white">
      <div>
        <div className="text-xs text-gray-500 uppercase">Code</div>
        <div className="font-mono font-bold text-lg">{profile.name || 'UNKNOWN'}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase">Age</div>
        <div className="font-mono font-bold text-lg">{currentAge} <span className="text-xs text-gray-400">/ 80</span></div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase">Index (Fortune)</div>
        <div className={`font-mono font-bold text-lg ${currentTrend >= 0 ? 'text-black' : 'text-gray-500'}`}>
          {currentScore.toFixed(2)}
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase">Change</div>
        <div className={`font-mono font-bold text-lg flex items-center gap-2`}>
           {currentTrend > 0 ? '▲' : currentTrend < 0 ? '▼' : '-'} 
           <span className={currentTrend >= 0 ? 'bg-black text-white px-1' : 'bg-white border border-black text-black px-1'}>
             {Math.abs(currentTrend).toFixed(2)}%
           </span>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
