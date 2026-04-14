import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Zap, ArrowRight } from 'lucide-react';
import { slideUp } from './animations';

interface PhaseIdleProps {
  joinCode: string;
  setJoinCode: (code: string) => void;
  handleCreateRoom: () => void;
  handleJoinRoom: () => void;
}

export const PhaseIdle: React.FC<PhaseIdleProps> = ({ joinCode, setJoinCode, handleCreateRoom, handleJoinRoom }) => {
  return (
    <motion.div {...slideUp(0.5)} className="glass-card" style={{ padding: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        {/* Create Room */}
        <div className="glass-card" style={{ padding: 28, borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Shield size={20} color="var(--accent)" />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Create a Room</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
            Generate a room code and share it with your opponent.
          </p>
          <button
            id="create-room-btn"
            className="glass-button"
            onClick={handleCreateRoom}
            style={{ width: '100%', padding: '14px 32px', fontSize: 15 }}
          >
            <Zap size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Create Room
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--divider)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--divider)' }} />
        </div>

        {/* Join Room */}
        <div className="glass-card" style={{ padding: 28, borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Users size={20} color="var(--cyan)" />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Join a Room</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
            Enter the 6-character room code shared by your opponent.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              id="join-room-input"
              className="glass-input"
              type="text"
              placeholder="e.g. A3K9WR"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{
                flex: 1, fontFamily: 'var(--font-mono)', fontSize: 18,
                letterSpacing: '0.25em', textAlign: 'center', textTransform: 'uppercase',
              }}
            />
            <button
              id="join-room-btn"
              className="glass-button"
              onClick={handleJoinRoom}
              disabled={joinCode.trim().length < 6}
              style={{ padding: '14px 28px', fontSize: 15 }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
