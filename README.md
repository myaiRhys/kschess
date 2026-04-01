# KS Chess

A polished local two-player chess game built for the Kinnear Systems portfolio.

## Features

- **Full chess rules** — all piece movements, castling, en passant, pawn promotion, check, checkmate, and stalemate
- **Board flipping** — the board rotates after each move so the active player always sees their pieces at the bottom
- **Algebraic notation** — full move history with standard chess notation
- **Captured pieces** — visual display of captured pieces for both sides
- **Pawn promotion** — modal picker for queen, rook, bishop, or knight
- **Game over detection** — checkmate and stalemate with result display
- **Responsive** — works on desktop and mobile
- **Dark premium UI** — clean, modern design

## Tech Stack

- Next.js 15
- TypeScript (strict)
- Tailwind CSS
- No external chess libraries — all logic implemented from scratch

## Getting Started

```bash
npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

- `src/lib/chess.ts` — Pure chess logic (move generation, validation, check/checkmate detection)
- `src/lib/gameReducer.ts` — React reducer managing all game state
- `src/components/` — UI components (Board, Square, Piece, modals, etc.)
- `src/types/chess.ts` — TypeScript type definitions

All chess logic is fully separated from React — `chess.ts` has zero framework imports.
