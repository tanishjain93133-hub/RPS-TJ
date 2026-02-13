
import React, { useState, useEffect } from 'react';
import { Choice, GameMode, GameState, RoundHistory } from './types';
import { getGeminiMove, getGeminiCommentary } from './services/gemini';
import HandIcon from './components/HandIcon';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.PRE_GAME);
  const [mode, setMode] = useState<GameMode>(GameMode.PVA);
  const [p1Name, setP1Name] = useState("Striker");
  const [p2Name, setP2Name] = useState("Gemini AI");
  const [player1Choice, setPlayer1Choice] = useState<Choice>(null);
  const [player2Choice, setPlayer2Choice] = useState<Choice>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [commentary, setCommentary] = useState<string>("Initializing Zenith Protocol...");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | string>(3);

  const determineWinner = (p1: Choice, p2: Choice) => {
    if (p1 === p2) return 'draw';
    if (
      (p1 === 'rock' && p2 === 'scissors') ||
      (p1 === 'paper' && p2 === 'rock') ||
      (p1 === 'scissors' && p2 === 'paper')
    ) return 'player1';
    return 'player2';
  };

  const handleStartTournament = (e: React.FormEvent) => {
    e.preventDefault();
    setGameState(GameState.IDLE);
    setCommentary(`Welcome to the Arena, ${p1Name} and ${p2Name}!`);
  };

  const startNewRound = () => {
    setGameState(GameState.SELECTION);
    setPlayer1Choice(null);
    setPlayer2Choice(null);
    setCommentary("Make your choice...");
  };

  const handleP1Choice = async (choice: Choice) => {
    if (gameState !== GameState.SELECTION || player1Choice) return;
    setPlayer1Choice(choice);

    if (mode === GameMode.PVA) {
      setIsAiLoading(true);
      // Faster fetch: get the move while the UI is responding
      const aiMove = await getGeminiMove(history);
      setPlayer2Choice(aiMove);
      setIsAiLoading(false);
      triggerBattle(choice, aiMove);
    } else {
      setCommentary(`${p1Name} has chosen. Waiting for ${p2Name}...`);
    }
  };

  const handleP2Choice = (choice: Choice) => {
    if (gameState !== GameState.SELECTION || !player1Choice || player2Choice) return;
    setPlayer2Choice(choice);
    triggerBattle(player1Choice, choice);
  };

  const triggerBattle = (p1: Choice, p2: Choice) => {
    setGameState(GameState.ANIMATING);
    let count = 3;
    setCountdown(3);

    const interval = setInterval(() => {
      count -= 1;
      if (count === 0) {
        setCountdown("SHOOT!");
      } else if (count < 0) {
        clearInterval(interval);
        finalizeRound(p1, p2);
      } else {
        setCountdown(count);
      }
    }, 450); // Faster countdown (450ms)
  };

  const finalizeRound = async (p1: Choice, p2: Choice) => {
    const winner = determineWinner(p1, p2);
    setScores(prev => ({
      p1: winner === 'player1' ? prev.p1 + 1 : prev.p1,
      p2: winner === 'player2' ? prev.p2 + 1 : prev.p2,
    }));

    const resultMsg = winner === 'draw' ? "It's a draw!" : (winner === 'player1' ? `${p1Name} Wins!` : `${p2Name} Wins!`);
    setGameState(GameState.RESULT);

    // Fetch commentary in background for next step
    const comm = await getGeminiCommentary(resultMsg, p1, p2);
    setCommentary(comm);
    setHistory(prev => [{ player1: p1, player2: p2, winner: resultMsg }, ...prev].slice(0, 5));
  };

  const resetAll = () => {
    setGameState(GameState.PRE_GAME);
    setScores({ p1: 0, p2: 0 });
    setHistory([]);
    setPlayer1Choice(null);
    setPlayer2Choice(null);
  };

  if (gameState === GameState.PRE_GAME) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass w-full max-w-md p-8 rounded-3xl animate-in zoom-in duration-500">
          <h1 className="text-4xl font-black font-orbitron mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">ZENITH ARENA</h1>
          <p className="text-slate-400 text-sm mb-6 uppercase tracking-widest">Player Registration</p>
          
          <form onSubmit={handleStartTournament} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Player 1 Name</label>
              <input 
                value={p1Name} 
                onChange={e => setP1Name(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 px-4 py-3 rounded-xl focus:border-blue-500 outline-none transition-all"
                placeholder="Enter Name"
                required
              />
            </div>

            <div className="flex gap-4 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
              <button 
                type="button"
                onClick={() => { setMode(GameMode.PVA); setP2Name("Gemini AI"); }}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${mode === GameMode.PVA ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >VS AI</button>
              <button 
                type="button"
                onClick={() => { setMode(GameMode.PVP); setP2Name("Player 2"); }}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${mode === GameMode.PVP ? 'bg-red-600 text-white' : 'text-slate-500'}`}
              >VS Human</button>
            </div>

            {mode === GameMode.PVP && (
              <div className="space-y-2 animate-in slide-in-from-top duration-300">
                <label className="text-xs font-bold text-slate-500 uppercase">Player 2 Name</label>
                <input 
                  value={p2Name} 
                  onChange={e => setP2Name(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 px-4 py-3 rounded-xl focus:border-red-500 outline-none transition-all"
                  placeholder="Enter Name"
                  required
                />
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-orbitron font-black text-xl tracking-tighter shadow-lg shadow-blue-900/20 transition-all">
              ENTER BATTLE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Header */}
      <header className="z-10 text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-black font-orbitron italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-2xl">
          ZENITH RPS
        </h1>
        <div className="flex gap-2 justify-center mt-2">
           <button onClick={resetAll} className="text-[10px] uppercase font-bold text-slate-500 hover:text-white transition-colors">Reset Arena</button>
        </div>
      </header>

      <main className="z-10 w-full max-w-6xl flex flex-col items-center gap-6">
        {/* Scoreboard */}
        <div className="glass px-10 py-4 rounded-2xl flex items-center gap-16 border-b-4 border-blue-500/30">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">{p1Name}</p>
            <p className="text-5xl font-orbitron font-black text-blue-400 drop-shadow-sm">{scores.p1}</p>
          </div>
          <div className="text-xl font-black text-slate-700 tracking-tighter font-orbitron">VS</div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">{p2Name}</p>
            <p className="text-5xl font-orbitron font-black text-red-400 drop-shadow-sm">{scores.p2}</p>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="relative w-full aspect-video md:aspect-[21/9] glass rounded-[2.5rem] overflow-hidden flex items-center justify-between px-10 md:px-32 border border-white/5 shadow-2xl">
          {/* Side Gradients */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-blue-600/10 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-red-600/10 to-transparent"></div>

          {/* Player 1 Hand */}
          <div className="flex flex-col items-center gap-6 z-10">
            <div className={`p-4 rounded-full transition-all duration-300 ${player1Choice ? 'bg-blue-500/10 border border-blue-500/30' : ''}`}>
              <HandIcon 
                choice={player1Choice} 
                isAnimating={gameState === GameState.ANIMATING} 
                side="left" 
                className={gameState === GameState.RESULT && determineWinner(player1Choice, player2Choice) === 'player1' ? 'text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,1)] scale-110' : 'text-slate-600'}
              />
            </div>
            <span className="font-orbitron text-xs uppercase font-black tracking-[0.2em] text-blue-400/80">{p1Name}</span>
          </div>

          {/* Center Stage */}
          <div className="flex flex-col items-center justify-center z-10">
            {gameState === GameState.ANIMATING ? (
              <div className="text-8xl md:text-[10rem] font-black font-orbitron text-white italic drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                {countdown}
              </div>
            ) : gameState === GameState.IDLE ? (
              <button onClick={startNewRound} className="group relative px-14 py-5 bg-blue-600 rounded-2xl overflow-hidden hover:scale-105 transition-all">
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
                <span className="relative text-2xl font-black font-orbitron uppercase italic">Initiate Battle</span>
              </button>
            ) : gameState === GameState.RESULT ? (
              <div className="text-center animate-in zoom-in duration-300">
                <p className="text-4xl md:text-6xl font-orbitron font-black mb-6 italic tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                  {determineWinner(player1Choice, player2Choice) === 'draw' ? "REPLAY" : "KO!"}
                </p>
                <button onClick={startNewRound} className="px-8 py-3 bg-white text-blue-900 rounded-xl font-black text-xs uppercase hover:bg-blue-50 transition-all shadow-xl">
                  NEXT ROUND
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-red-500 rounded-full animate-pulse"></div>
                <div className="text-slate-800 font-orbitron text-4xl font-black opacity-30 italic">WAR ZONE</div>
                <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Player 2 Hand */}
          <div className="flex flex-col items-center gap-6 z-10">
            <div className={`p-4 rounded-full transition-all duration-300 ${player2Choice ? 'bg-red-500/10 border border-red-500/30' : ''}`}>
              <HandIcon 
                choice={player2Choice} 
                isAnimating={gameState === GameState.ANIMATING} 
                side="right" 
                className={gameState === GameState.RESULT && determineWinner(player1Choice, player2Choice) === 'player2' ? 'text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,1)] scale-110' : 'text-slate-600'}
              />
            </div>
            <span className="font-orbitron text-xs uppercase font-black tracking-[0.2em] text-red-400/80">{p2Name}</span>
          </div>
        </div>

        {/* Commentary / Status */}
        <div className="w-full max-w-2xl">
          <div className="bg-slate-900/80 border border-slate-800/50 p-6 rounded-2xl min-h-[5rem] flex items-center justify-center text-center shadow-inner">
            {isAiLoading ? (
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full animate-[bounce_1s_infinite]"></div>
                  <div className="w-1.5 h-6 bg-blue-400 rounded-full animate-[bounce_1s_infinite_0.1s]"></div>
                  <div className="w-1.5 h-6 bg-blue-300 rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
                </div>
                <span className="font-orbitron text-xs font-black text-blue-400 tracking-widest">GEMINI ANALYZING PATTERNS</span>
              </div>
            ) : (
              <p className="text-slate-200 font-medium italic tracking-wide">"{commentary}"</p>
            )}
          </div>
        </div>

        {/* Selection Interface */}
        {gameState === GameState.SELECTION && (
          <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom duration-500 w-full">
            <h3 className="font-orbitron text-xs font-black uppercase text-slate-500 tracking-[0.4em] mb-2">
              {!player1Choice ? `${p1Name}'s Move` : `${p2Name}'s Move`}
            </h3>
            <div className="flex gap-8">
              {(['rock', 'paper', 'scissors'] as Choice[]).map((c) => (
                <button
                  key={c}
                  onClick={() => (!player1Choice ? handleP1Choice(c) : handleP2Choice(c))}
                  className="group relative flex flex-col items-center gap-3 transition-all active:scale-90"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 glass rounded-3xl flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-600/10 group-hover:glow-blue transition-all">
                    <HandIcon choice={c} isAnimating={false} side="left" className="w-14 h-14 md:w-20 md:h-20 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-300">{c}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History Ticker */}
        {history.length > 0 && (
          <div className="w-full max-w-md glass rounded-2xl p-6 border-t-2 border-slate-800/50">
            <h4 className="text-[10px] font-black uppercase text-slate-600 mb-4 tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Arena Records
            </h4>
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] font-bold py-2 border-b border-white/5 last:border-0">
                  <span className="w-20 text-blue-400 uppercase tracking-tighter">{h.player1}</span>
                  <div className="flex-1 flex justify-center text-slate-700">⚔️</div>
                  <span className="w-20 text-right text-red-400 uppercase tracking-tighter">{h.player2}</span>
                  <span className="ml-4 px-2 py-0.5 bg-slate-800 rounded text-[9px] text-slate-400 whitespace-nowrap">{h.winner.split(' ')[0]} Win</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-10 text-[9px] uppercase tracking-[0.3em] font-black text-slate-800 z-10">
        Engine: Gemini 3 Flash • High Latency Avoidance Active
      </footer>
    </div>
  );
};

export default App;
