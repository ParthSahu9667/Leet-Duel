import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Copy, Check } from 'lucide-react';
import { slideUp } from './animations';

interface PhaseWaitingProps {
  roomId: string;
  handleReset: () => void;
}

export const PhaseWaiting: React.FC<PhaseWaitingProps> = ({ roomId, handleReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div {...slideUp(0)} className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
      <Loader2 size={40} color="var(--accent)" style={{ animation: 'spin 1.5s linear infinite', marginBottom: 24 }} />
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
        Waiting for opponent…
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
        Share this room code with your challenger
      </p>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 16,
        padding: '16px 28px', borderRadius: 16,
        background: 'var(--glass-strong)', border: '1px solid var(--glass-border)',
        marginBottom: 24,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 800,
          letterSpacing: '0.3em', color: 'var(--accent)',
        }}>
          {roomId}
        </span>
        <button
          id="copy-code-btn"
          onClick={handleCopyCode}
          style={{
            background: 'var(--btn-bg)', border: '1px solid var(--btn-border)',
            borderRadius: 10, padding: 10, cursor: 'pointer',
            color: 'var(--text-secondary)', transition: 'all 0.3s ease',
          }}
        >
          {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} />}
        </button>
      </div>

      <div>
        <button className="glass-button" onClick={handleReset} style={{ fontSize: 13, padding: '10px 24px' }}>Cancel</button>
      </div>
    </motion.div>
  );
};
