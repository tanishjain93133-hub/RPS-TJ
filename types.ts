
export type Choice = 'rock' | 'paper' | 'scissors' | null;

export enum GameMode {
  PVP = 'PVP',
  PVA = 'PVA' // Player vs AI
}

export enum GameState {
  PRE_GAME = 'PRE_GAME',
  IDLE = 'IDLE',
  SELECTION = 'SELECTION',
  ANIMATING = 'ANIMATING',
  RESULT = 'RESULT'
}

export interface GameResult {
  winner: 'player1' | 'player2' | 'draw' | null;
  message: string;
}

export interface RoundHistory {
  player1: Choice;
  player2: Choice;
  winner: string;
}
