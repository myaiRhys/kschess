'use client';

import { useEffect, useRef } from 'react';

interface MoveHistoryProps {
  moves: string[];
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  // Group moves into pairs (white, black)
  const pairs: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div className="bg-slate-800/60 rounded-lg border border-slate-700 flex flex-col h-full">
      <div className="px-3 py-2 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300">Move History</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 min-h-0 max-h-64 sm:max-h-80">
        {pairs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No moves yet</p>
        ) : (
          <table className="w-full text-xs">
            <tbody>
              {pairs.map(({ num, white, black }) => (
                <tr key={num} className="hover:bg-slate-700/40">
                  <td className="text-slate-500 pr-2 py-0.5 w-8 text-right">{num}.</td>
                  <td className="text-slate-200 py-0.5 w-16 font-mono">{white}</td>
                  <td className="text-slate-200 py-0.5 w-16 font-mono">{black ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
