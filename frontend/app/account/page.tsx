'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/axios';
import { useRouter } from 'next/navigation';
import {
  User, Mail, CheckCircle2, AlertCircle, Loader2, ExternalLink,
  Shield, Swords, Trophy
} from 'lucide-react';

interface LeetCodeProfile {
  avatar: string;
  realName: string;
  ranking: number;
  totalSolved: number;
}

export default function AccountPage() {
  const { user, loading, updateLeetcodeUsername } = useAuth();
  const router = useRouter();

  const [lcUsername, setLcUsername] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedProfile, setVerifiedProfile] = useState<LeetCodeProfile | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not logged in
  if (!loading && !user) {
    router.push('/auth');
    return null;
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
      </main>
    );
  }

  const handleVerify = async () => {
    if (!lcUsername.trim()) return;
    setVerifying(true);
    setError('');
    setSuccess('');
    setVerifiedProfile(null);

    try {
      const { data } = await api.post('/account/verify-leetcode', {
        leetcodeUsername: lcUsername.trim(),
      });

      setSuccess(data.message);
      setVerifiedProfile(data.leetcodeProfile);
      updateLeetcodeUsername(lcUsername.trim());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const isVerified = !!user?.leetcodeUsername;

  return (
    <main style={{ minHeight: '100vh', padding: '120px 24px 80px' }}>
      <motion.div
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ maxWidth: 640, margin: '0 auto' }}
      >
        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)',
            marginBottom: 20,
          }}>
            <Shield size={32} color="var(--accent)" />
          </div>
          <h1 style={{
            fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8,
          }}>
            Account Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500 }}>
            Manage your profile and LeetCode verification
          </p>
        </motion.header>

        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="glass-card"
          style={{ padding: 32, marginBottom: 24 }}
        >
          <h3 style={{
            fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--text-muted)', marginBottom: 20,
          }}>
            Profile
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--glass-strong)', border: '1px solid var(--glass-border)',
              }}>
                <User size={18} color="var(--text-secondary)" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Name</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--divider)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--glass-strong)', border: '1px solid var(--glass-border)',
              }}>
                <Mail size={18} color="var(--text-secondary)" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.email}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* LeetCode Verification Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="glass-card"
          style={{ padding: 32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{
              fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--text-muted)',
            }}>
              LeetCode Verification
            </h3>
            {isVerified && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.25)',
                color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                <CheckCircle2 size={12} /> Verified
              </span>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            Link your LeetCode account to compete in 1v1 duels.
            Your recent submissions will be tracked to determine the winner.
          </p>

          {/* Currently verified username */}
          {isVerified && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
              borderRadius: 16, marginBottom: 20,
              background: 'rgba(52, 211, 153, 0.06)', border: '1px solid rgba(52, 211, 153, 0.15)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(52, 211, 153, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trophy size={20} color="#34d399" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Linked Account
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user?.leetcodeUsername}
                </div>
              </div>
              <a
                href={`https://leetcode.com/u/${user?.leetcodeUsername}/`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--text-tertiary)', transition: 'color 0.3s' }}
              >
                <ExternalLink size={16} />
              </a>
            </div>
          )}

          {/* Change / Set username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)',
              marginBottom: 8, letterSpacing: '0.03em',
            }}>
              {isVerified ? 'Change LeetCode Username' : 'Enter LeetCode Username'}
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                id="leetcode-username-input"
                className="glass-input"
                type="text"
                placeholder="e.g. tourist"
                value={lcUsername}
                onChange={e => setLcUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                style={{ flex: 1 }}
              />
              <button
                id="verify-leetcode-btn"
                className="glass-button"
                onClick={handleVerify}
                disabled={verifying || !lcUsername.trim()}
                style={{ padding: '12px 28px', fontSize: 14, whiteSpace: 'nowrap' }}
              >
                {verifying ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  'Verify'
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                borderRadius: 12, marginBottom: 16,
                background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.2)',
              }}
            >
              <AlertCircle size={16} color="#f87171" />
              <span style={{ color: '#f87171', fontSize: 13, fontWeight: 500 }}>{error}</span>
            </motion.div>
          )}

          {/* Success + Profile Preview */}
          {success && verifiedProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '20px 24px', borderRadius: 16,
                background: 'rgba(52, 211, 153, 0.06)', border: '1px solid rgba(52, 211, 153, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <CheckCircle2 size={16} color="#34d399" />
                <span style={{ color: '#34d399', fontSize: 14, fontWeight: 600 }}>{success}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {verifiedProfile.avatar && (
                  <img
                    src={verifiedProfile.avatar}
                    alt="LeetCode avatar"
                    style={{
                      width: 48, height: 48, borderRadius: 14,
                      border: '2px solid rgba(52, 211, 153, 0.3)',
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {verifiedProfile.realName}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      Rank #{verifiedProfile.ranking.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                      {verifiedProfile.totalSolved} solved
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA to compete */}
          {isVerified && (
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <button
                id="go-compete-btn"
                className="glass-button"
                onClick={() => router.push('/compete')}
                style={{
                  padding: '14px 36px', fontSize: 15,
                  background: 'rgba(129, 140, 248, 0.12)', borderColor: 'rgba(129, 140, 248, 0.25)',
                  color: 'var(--accent)',
                }}
              >
                <Swords size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                Go to Duel Arena
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </main>
  );
}
