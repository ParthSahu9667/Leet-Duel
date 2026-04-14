import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Shield } from 'lucide-react';
import { fadeBlur } from './animations';

interface CompeteGatesProps {
  user: any;
}

export const CompeteGates: React.FC<CompeteGatesProps> = ({ user }) => {
  const router = useRouter();

  if (!user) {
    return (
      <main style={{ minHeight: '100vh', padding: '120px 24px 80px' }}>
        <motion.div {...fadeBlur} style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <div className="glass-card" style={{ padding: 48 }}>
            <AlertTriangle size={40} color="var(--warning)" style={{ marginBottom: 20, marginLeft: 180 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              Sign In Required
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              You need to be logged in to compete in duels.
            </p>
            <button className="glass-button" onClick={() => router.push('/auth')} style={{ padding: '14px 36px' }}>
              Sign In
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  if (!user.leetcodeUsername) {
    return (
      <main style={{ minHeight: '100vh', padding: '120px 24px 80px' }}>
        <motion.div {...fadeBlur} style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <div className="glass-card" style={{ padding: 48 }}>
            <Shield size={40} color="var(--accent)" style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              Verify Your LeetCode Account
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
              You must link your LeetCode username before competing.
              This lets us track your submissions in real-time to determine the winner.
            </p>
            <button className="glass-button" onClick={() => router.push('/account')} style={{
              padding: '14px 36px',
              background: 'rgba(129, 140, 248, 0.12)', borderColor: 'rgba(129, 140, 248, 0.25)',
              color: 'var(--accent)',
            }}>
              <Shield size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
              Go to Account Settings
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return null;
};
