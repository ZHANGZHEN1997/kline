export interface LifeEvent {
  age: number;
  content: string;
  impact: number; // -10 to 10
  type: 'CAREER' | 'LOVE' | 'HEALTH' | 'WEALTH' | 'RANDOM';
}

export interface CandleData {
  age: number;
  open: number;
  close: number;
  high: number;
  low: number;
  events: LifeEvent[];
  trend: 'up' | 'down' | 'flat';
}

export interface UserProfile {
  name: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SIMULATING = 'SIMULATING',
  FINISHED = 'FINISHED',
}
