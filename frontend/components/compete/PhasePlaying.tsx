import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Radio, ExternalLink } from 'lucide-react';
import { DuelProblem } from '@/types/type';
import { slideUp } from './animations';
import { difficultyColors, formatTime } from './shared';

interface PhasePlayingProps {
  problem: DuelProblem | null;
  elapsedTime: number;
  isHost: boolean;
  handleRerollProblem: () => void;
}

export const PhasePlaying: React.FC<PhasePlayingProps> = ({ problem, elapsedTime, isHost, handleRerollProblem }) => {
  if (!problem) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      {/* Timer + Status Bar */}
      <motion.div {...slideUp(0)} className="glass-card" style={{
        padding: '14px 24px', marginBottom: 20, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={16} color="var(--accent)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
            {formatTime(elapsedTime)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Radio size={14} color="var(--success)" style={{ animation: 'spin 3s linear infinite' }} />
          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
            Tracking submissions…
          </span>
        </div>
        <div style={{
          padding: '4px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          background: (difficultyColors[problem.difficulty] || difficultyColors['medium']).bg,
          border: `1px solid ${(difficultyColors[problem.difficulty] || difficultyColors['medium']).border}`,
          color: (difficultyColors[problem.difficulty] || difficultyColors['medium']).text,
        }}>
          {problem.difficulty}
        </div>
      </motion.div>

      {/* Problem Card */}
      <motion.div {...slideUp(0.1)} className="glass-card" style={{ padding: 36 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
            {problem.title}
          </h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {isHost && (
              <button
                className="glass-button"
                onClick={handleRerollProblem}
                style={{
                  padding: '10px 20px', fontSize: 13,
                  background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.25)',
                  color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                <Radio size={14} />
                Skip / Reroll
              </button>
            )}
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button"
              style={{
                padding: '10px 20px', fontSize: 13, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
                background: 'rgba(52, 211, 153, 0.12)', borderColor: 'rgba(52, 211, 153, 0.3)',
                color: '#34d399',
              }}
            >
              Solve on LeetCode
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Tags */}
        {problem.topicTags && problem.topicTags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {problem.topicTags.map(tag => (
              <span key={tag.slug} style={{
                padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                background: 'var(--chip-bg)', border: '1px solid var(--chip-border)',
                color: 'var(--chip-text)', textTransform: 'lowercase',
              }}>
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Problem Description (HTML from LeetCode) */}
        <div
          style={{
            color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7,
            marginBottom: 28,
          }}
          dangerouslySetInnerHTML={{ __html: problem.content || '' }}
        />

        {/* Info */}
        <div style={{
          padding: '16px 20px', borderRadius: 14,
          background: 'rgba(129, 140, 248, 0.06)', border: '1px solid rgba(129, 140, 248, 0.15)',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
            💡 Open the problem on LeetCode and submit your solution there.
            <br />
            The server is automatically checking both players&apos; submissions every 5 seconds.
            <br />
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
              First &quot;Accepted&quot; submission wins!
            </span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
