import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Swords } from 'lucide-react';
import { Player } from '@/types/type';
import { slideUp } from './animations';
import { formatTime } from './shared';

interface PhaseFinishedProps {
  winner: Player | null;
  players: Player[];
  durationSeconds: number;
  matchOverMessage: string;
  handleReset: () => void;
}

export const PhaseFinished: React.FC<PhaseFinishedProps> = ({ winner, players, durationSeconds, matchOverMessage, handleReset }) => {
  return (
    <motion.div {...slideUp(0)} className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 24,
        background: winner ? 'rgba(251, 191, 36, 0.12)' : 'rgba(148, 163, 184, 0.12)',
        border: `1px solid ${winner ? 'rgba(251, 191, 36, 0.25)' : 'rgba(148, 163, 184, 0.25)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        {winner ? <Trophy size={36} color="#fbbf24" /> : <Clock size={36} color="#94a3b8" />}
      </div>

      <h2 className="gradient-text-warm" style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
        {winner ? 'Duel Complete!' : 'Time\'s Up!'}
      </h2>

      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28 }}>
        {winner ? (
          <>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{winner.username}</span>
            {' '}({winner.leetcodeUsername}) wins in{' '}
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
              {formatTime(durationSeconds)}
            </span>
          </>
        ) : (
          matchOverMessage
        )}
      </p>

      {/* Winner & loser cards */}
      {winner && players.length > 0 && (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
          {players.map(p => {
            const isWinner = p.userId === winner.userId;
            return (
              <motion.div
                key={p.userId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{
                  padding: '20px 32px', borderRadius: 16, textAlign: 'center',
                  borderColor: isWinner ? 'rgba(251, 191, 36, 0.3)' : 'var(--glass-border)',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{isWinner ? '🏆' : '🤝'}</div>
                <span style={{ fontWeight: 700, fontSize: 15, color: isWinner ? '#fbbf24' : 'var(--text-secondary)' }}>
                  {p.username}
                </span>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {p.leetcodeUsername}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.1em', marginTop: 6,
                  color: isWinner ? '#34d399' : 'var(--text-muted)',
                }}>
                  {isWinner ? 'Winner' : 'Runner-up'}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <button
        id="new-duel-btn"
        className="glass-button"
        onClick={handleReset}
        style={{ padding: '14px 36px', fontSize: 15 }}
      >
        <Swords size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
        Start New Duel
      </button>
    </motion.div>
  );
};
