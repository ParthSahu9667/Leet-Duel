"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { googleLoginCode } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processAuth = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const urlError = searchParams.get("error");

      if (urlError) {
        setError(`Google Login Error: ${urlError}`);
        return;
      }

      if (!code || !state) {
        setError("Missing authorization code or state in URL.");
        return;
      }

      // Verify State
      const savedState = sessionStorage.getItem("google_oauth_state");
      if (!savedState || savedState !== state) {
        setError("Invalid state parameter. Possible CSRF attack.");
        return;
      }

      // Read Code Verifier
      const codeVerifier = sessionStorage.getItem("google_oauth_verifier");
      if (!codeVerifier) {
        setError("Missing code verifier in session.");
        return;
      }

      const redirectUri = `${window.location.origin}/auth/callback`;

      try {
        await googleLoginCode(code, codeVerifier, redirectUri);
        // Clear session storage to prevent reuse
        sessionStorage.removeItem("google_oauth_state");
        sessionStorage.removeItem("google_oauth_verifier");
        // Use router to redirect internally, AuthContext usually does this anyway, but we await it
      } catch (err: any) {
        setError(err.response?.data?.message || "Authentication failed during token exchange.");
      }
    };

    processAuth();
  }, [searchParams, googleLoginCode, router]);

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen flex items-center justify-center">
      <div className="volumetric-glass-card p-8 md:p-10 relative overflow-hidden w-full max-w-[420px] text-center">
        {error ? (
          <div>
            <h2 className="text-xl font-bold text-red-400 mb-4">Authentication Error</h2>
            <p className="text-[var(--text-tertiary)] mb-6">{error}</p>
            <button 
              onClick={() => router.push('/auth')} 
              className="glass-button w-full !py-3"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">Authenticating...</h2>
            <div className="w-8 h-8 border-2 border-t-[var(--accent)] border-white/20 rounded-full animate-spin mx-auto"></div>
            <p className="text-[var(--text-tertiary)] mt-4">Please wait while we complete your login securely.</p>
          </div>
        )}
      </div>
    </div>
  );
}
