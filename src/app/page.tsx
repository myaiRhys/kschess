'use client';

import { useReducer } from 'react';
import { gameReducer, createInitialState } from '../lib/gameReducer';
import Board from '../components/Board';
import MoveHistory from '../components/MoveHistory';
import CapturedPieces from '../components/CapturedPieces';
import GameStatus from '../components/GameStatus';
import PromotionModal from '../components/PromotionModal';
import GameOverModal from '../components/GameOverModal';

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          KS Chess
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Local two-player chess</p>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full max-w-4xl items-center lg:items-start">
        {/* Board section */}
        <div className="flex flex-col w-full max-w-[min(90vw,480px)] lg:max-w-[480px]">
          {/* Captured by opponent (shown at top) */}
          <CapturedPieces
            pieces={state.capturedPieces[state.boardFlipped ? 'white' : 'black']}
            color={state.boardFlipped ? 'white' : 'black'}
          />

          <Board state={state} dispatch={dispatch} />

          {/* Captured by current player (shown at bottom) */}
          <CapturedPieces
            pieces={state.capturedPieces[state.boardFlipped ? 'black' : 'white']}
            color={state.boardFlipped ? 'black' : 'white'}
          />

          {/* Game status */}
          <GameStatus status={state.status} turn={state.turn} />
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-56 flex flex-col gap-3">
          <MoveHistory moves={state.moves} />

          <button
            onClick={() => dispatch({ type: 'NEW_GAME' })}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg border border-slate-600 transition-colors active:scale-[0.98]"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-xs text-slate-600">
          Built by Kinnear Systems
        </p>
      </div>

      {/* Modals */}
      {state.promotionPending && (
        <PromotionModal color={state.turn} dispatch={dispatch} />
      )}
      <GameOverModal status={state.status} winner={state.winner} dispatch={dispatch} />
    </main>
  );
}
