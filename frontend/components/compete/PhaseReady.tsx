import React from 'react';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import { Player } from '@/types/type';
import { slideUp } from './animations';
import { difficultyColors } from './shared';

interface PhaseReadyProps {
  players: Player[];
  difficulty: 'easy' | 'medium' | 'hard';
  setDifficulty: (diff: 'easy' | 'medium' | 'hard') => void;
  handleStartMatch: () => void;
  isHost: boolean;
}

export const PhaseReady: React.FC<PhaseReadyProps> = ({ players, difficulty, setDifficulty, handleStartMatch, isHost }) => {
  return (
    <motion.div {...slideUp(0)} className="glass-card" style={{ padding: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
          ⚔️ Match Ready!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Both players connected — select difficulty to begin
        </p>
      </div>

      {/* Players */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 32 }}>
        {players.map((p, i) => (
          <React.Fragment key={p.userId}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="glass-card"
              style={{ padding: '16px 28px', borderRadius: 16, textAlign: 'center' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: i === 0 ? 'rgba(129, 140, 248, 0.15)' : 'rgba(34, 211, 238, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px', fontSize: 20, fontWeight: 800,
                color: i === 0 ? 'var(--accent)' : 'var(--cyan)',
              }}>
                {p.username.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{p.username}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {p.leetcodeUsername}
              </div>
            </motion.div>
            {i === 0 && <span style={{ fontSize: 24, color: 'var(--text-muted)' }}>VS</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Difficulty Selector */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Select Difficulty
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              id={`difficulty-${d}-btn`}
              onClick={() => setDifficulty(d)}
              style={{
                padding: '10px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.3s ease',
                background: difficulty === d ? difficultyColors[d].bg : 'var(--btn-bg)',
                border: `1px solid ${difficulty === d ? difficultyColors[d].border : 'var(--btn-border)'}`,
                color: difficulty === d ? difficultyColors[d].text : 'var(--text-secondary)',
                transform: difficulty === d ? 'scale(1.05)' : 'scale(1)',
                opacity: isHost ? 1 : 0.6,
                pointerEvents: isHost ? 'auto' : 'none',
              }}
              disabled={!isHost}
            >
              {d}
            </button>
          ))}
        </div>
        {!isHost && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
            Waiting for the host to start the match...
          </p>
        )}
      </div>

      {isHost && (
        <div style={{ textAlign: 'center' }}>
          <button
            id="start-match-btn"
            className="glass-button"
            onClick={handleStartMatch}
            style={{
              padding: '16px 48px', fontSize: 16, fontWeight: 700,
              background: 'rgba(129, 140, 248, 0.15)', borderColor: 'rgba(129, 140, 248, 0.3)',
              color: 'var(--accent)',
            }}
          >
            <Swords size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Start Duel
          </button>
        </div>
      )}
    </motion.div>
  );
};
