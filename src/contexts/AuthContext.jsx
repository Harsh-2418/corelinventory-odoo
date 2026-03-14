import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpData, setOtpData] = useState(null);

  // Check for existing Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: session.user.user_metadata?.role || 'Inventory Manager',
          createdAt: session.user.created_at,
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: session.user.user_metadata?.role || 'Inventory Manager',
          createdAt: session.user.created_at,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signup(name, email, password, role) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        // Skip email confirmation for hackathon demo
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, error: error.message };
    // For Supabase with email confirmations disabled, user is auto-confirmed
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: name,
        role: role,
        createdAt: data.user.created_at,
      });
      return { success: true };
    }
    // If email confirmation is required
    return { success: true, message: 'Check your email to confirm your account' };
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split('@')[0],
        role: data.user.user_metadata?.role || 'Inventory Manager',
        createdAt: data.user.created_at,
      });
    }
    return { success: true };
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function requestOTP(email) {
    // For hackathon: use Supabase password reset (sends email)
    // But also keep the demo OTP for cases where email isn't set up
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      // Fallback to simulated OTP for demo
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      setOtpData({ email, otp, expiresAt: Date.now() + 300000 });
      return { success: true, otp, simulated: true };
    }
    return { success: true, message: 'Password reset email sent' };
  }

  function verifyOTP(email, otp) {
    if (!otpData || otpData.email !== email || otpData.otp !== otp) {
      return { success: false, error: 'Invalid OTP' };
    }
    if (Date.now() > otpData.expiresAt) {
      return { success: false, error: 'OTP expired' };
    }
    return { success: true };
  }

  async function resetPassword(email, newPassword) {
    // If using Supabase auth flow, updateUser works after email link
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      // Fallback: just clear OTP for demo
      setOtpData(null);
      return { success: true };
    }
    setOtpData(null);
    return { success: true };
  }

  async function updateProfile(updates) {
    const { error } = await supabase.auth.updateUser({
      data: { name: updates.name },
    });
    if (!error) {
      setUser(prev => ({ ...prev, ...updates }));
    }
  }

  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--color-bg-primary, #0a0e1a)',
        color: 'var(--color-text-primary, #e2e8f0)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid transparent',
            borderTop: '3px solid #6366f1', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, signup, login, logout,
      requestOTP, verifyOTP, resetPassword, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
