import type {
  GameState,
  GameAction,
  Position,
} from '../types/chess';
import {
  createInitialBoard,
  getLegalMoves,
  executeMove,
  isInCheck,
  isCheckmate,
  isStalemate,
  opponent,
} from './chess';

export function createInitialState(): GameState {
  return {
    board: createInitialBoard(),
    turn: 'white',
    selected: null,
    validMoves: [],
    status: 'playing',
    winner: null,
    moves: [],
    capturedPieces: { white: [], black: [] },
    enPassantTarget: null,
    castlingRights: { wK: true, wQ: true, bK: true, bQ: true },
    boardFlipped: false,
    promotionPending: null,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return createInitialState();

    case 'PROMOTE':
      return handlePromotion(state, action.pieceType);

    case 'SELECT_SQUARE':
      return handleSquareSelect(state, action.position);

    default:
      return state;
  }
}

function handleSquareSelect(state: GameState, position: Position): GameState {
  // Don't allow interaction during promotion or after game over
  if (state.promotionPending || state.status === 'checkmate' || state.status === 'stalemate') {
    return state;
  }

  const [r, c] = position;
  const clickedPiece = state.board[r][c];

  // If we have a selected piece and clicked a valid move target
  if (state.selected) {
    const isValidTarget = state.validMoves.some(([mr, mc]) => mr === r && mc === c);

    if (isValidTarget) {
      return performMove(state, state.selected, position);
    }

    // Clicked own piece — reselect
    if (clickedPiece && clickedPiece.color === state.turn) {
      const moves = getLegalMoves(state.board, position, state.enPassantTarget, state.castlingRights);
      return { ...state, selected: position, validMoves: moves };
    }

    // Clicked elsewhere — deselect
    return { ...state, selected: null, validMoves: [] };
  }

  // No selection yet — select own piece
  if (clickedPiece && clickedPiece.color === state.turn) {
    const moves = getLegalMoves(state.board, position, state.enPassantTarget, state.castlingRights);
    return { ...state, selected: position, validMoves: moves };
  }

  return state;
}

function performMove(state: GameState, from: Position, to: Position): GameState {
  const result = executeMove(
    state.board, from, to, state.enPassantTarget, state.castlingRights,
  );

  // If this is a promotion, pause for user to pick a piece
  if (result.isPromotion) {
    return {
      ...state,
      promotionPending: { from, to },
      selected: null,
      validMoves: [],
    };
  }

  return finishMove(state, result.board, result.captured, result.enPassantTarget,
    result.castlingRights, result.notation);
}

function handlePromotion(state: GameState, pieceType: import('../types/chess').PieceType): GameState {
  if (!state.promotionPending) return state;

  const { from, to } = state.promotionPending;
  const result = executeMove(
    state.board, from, to, state.enPassantTarget, state.castlingRights, pieceType,
  );

  return finishMove(state, result.board, result.captured, result.enPassantTarget,
    result.castlingRights, result.notation);
}

function finishMove(
  state: GameState,
  board: import('../types/chess').Board,
  captured: import('../types/chess').Piece | null,
  enPassantTarget: Position | null,
  castlingRights: import('../types/chess').CastlingRights,
  notation: string,
): GameState {
  const nextTurn = opponent(state.turn);

  // Update captured pieces
  const capturedPieces = { ...state.capturedPieces };
  if (captured) {
    capturedPieces[captured.color] = [...capturedPieces[captured.color], captured];
  }

  // Check game status
  let status: GameState['status'] = 'playing';
  let winner: GameState['winner'] = null;

  if (isCheckmate(board, nextTurn, enPassantTarget, castlingRights)) {
    status = 'checkmate';
    winner = state.turn;
    // Add checkmate symbol to notation
    notation = notation.replace(/\+$/, '') + '#';
  } else if (isStalemate(board, nextTurn, enPassantTarget, castlingRights)) {
    status = 'stalemate';
  } else if (isInCheck(board, nextTurn)) {
    status = 'check';
  }

  return {
    ...state,
    board,
    turn: nextTurn,
    selected: null,
    validMoves: [],
    status,
    winner,
    moves: [...state.moves, notation],
    capturedPieces,
    enPassantTarget,
    castlingRights,
    boardFlipped: nextTurn === 'black',
    promotionPending: null,
  };
}
