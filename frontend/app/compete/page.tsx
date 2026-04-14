'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDuelMatch } from '@/hooks/useDuelMatch';
import { fadeBlur, slideUp } from '@/components/compete/animations';
import { CompeteGates } from '@/components/compete/CompeteGates';

import { PhaseIdle } from '@/components/compete/PhaseIdle';
import { PhaseWaiting } from '@/components/compete/PhaseWaiting';
import { PhaseReady } from '@/components/compete/PhaseReady';
import { PhaseLoading } from '@/components/compete/PhaseLoading';
import { PhasePlaying } from '@/components/compete/PhasePlaying';
import { PhaseFinished } from '@/components/compete/PhaseFinished';

export default function CompetePage() {
  const { user } = useAuth();
  const match = useDuelMatch(user);

  // Guard Clauses for unauthenticated or unverified users
  if (!user || !user.leetcodeUsername) {
    return <CompeteGates user={user} />;
  }

  return (
    <main style={{ minHeight: '100vh', padding: '120px 24px 80px' }}>
      <motion.div {...fadeBlur} style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Global Page Header */}
        <motion.div {...slideUp(0.3)} style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)',
            marginBottom: 20,
          }}>
            <Swords size={32} color="var(--accent)" />
          </div>
          <h1 style={{
            fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8,
          }}>
            1v1 Duel Arena
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500 }}>
            Competing as <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{user.leetcodeUsername}</span>
          </p>
        </motion.div>

        {/* Error Banner */}
        {match.errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '14px 20px', borderRadius: 16, marginBottom: 24,
              background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.25)',
              color: '#f87171', fontSize: 14, fontWeight: 500, textAlign: 'center',
            }}
          >
            {match.errorMsg}
          </motion.div>
        )}

        {/* Phases */}
        {match.phase === 'idle' && (
          <PhaseIdle
            joinCode={match.joinCode}
            setJoinCode={match.setJoinCode}
            handleCreateRoom={match.handleCreateRoom}
            handleJoinRoom={match.handleJoinRoom}
          />
        )}

        {match.phase === 'waiting' && (
          <PhaseWaiting
            roomId={match.roomId}
            handleReset={match.handleReset}
          />
        )}

        {match.phase === 'ready' && (
          <PhaseReady
            players={match.players}
            difficulty={match.difficulty}
            setDifficulty={match.setDifficulty}
            handleStartMatch={match.handleStartMatch}
          />
        )}

        {match.phase === 'loading' && (
          <PhaseLoading difficulty={match.difficulty} />
        )}

        {match.phase === 'playing' && (
          <PhasePlaying
            problem={match.problem}
            elapsedTime={match.elapsedTime}
          />
        )}

        {match.phase === 'finished' && (
          <PhaseFinished
            winner={match.winner}
            players={match.players}
            durationSeconds={match.durationSeconds}
            matchOverMessage={match.matchOverMessage}
            handleReset={match.handleReset}
          />
        )}

      </motion.div>
    </main>
  );
}
