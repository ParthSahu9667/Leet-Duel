import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { slideUp } from './animations';

interface PhaseLoadingProps {
  difficulty: string;
}

export const PhaseLoading: React.FC<PhaseLoadingProps> = ({ difficulty }) => {
  return (
    <motion.div {...slideUp(0)} className="glass-card" style={{ padding: 64, textAlign: 'center' }}>
      <Loader2 size={48} color="var(--accent)" style={{ animation: 'spin 1.2s linear infinite', marginBottom: 24 }} />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Fetching problem from LeetCode…
      </h2>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
        Finding a random {difficulty} challenge for you
      </p>
    </motion.div>
  );
};
