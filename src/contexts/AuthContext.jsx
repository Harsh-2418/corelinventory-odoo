import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { sendOtpEmail, generateOTP } from '../utils/emailService';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, error: error.message };
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

  // =============================================
  // OTP-based Password Reset (using EmailJS + Supabase RPC)
  // =============================================

  // Step 1: Generate OTP, store in Supabase table, send via EmailJS
  async function requestOTP(email) {
    try {
      // Check if user exists first
      // We do a simple check by trying to find the email
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

      // Store OTP in Supabase table
      const { error: insertError } = await supabase
        .from('password_reset_otps')
        .insert({
          email: email,
          otp: otp,
          expires_at: expiresAt,
        });

      if (insertError) {
        console.error('OTP insert error:', insertError);
        return { success: false, error: `OTP Error: ${insertError.message || insertError.code || 'Table may not exist. Run supabase_otp_setup.sql first.'}` };
      }

      // Send OTP via EmailJS
      const emailResult = await sendOtpEmail(email, otp);
      if (!emailResult.success) {
        return { success: false, error: emailResult.error || 'Failed to send OTP email.' };
      }

      return { success: true };
    } catch (err) {
      console.error('requestOTP error:', err);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  }

  // Step 2: Verify OTP against Supabase table
  async function verifyOTP(email, otpCode) {
    try {
      const { data, error } = await supabase
        .from('password_reset_otps')
        .select('*')
        .eq('email', email)
        .eq('otp', otpCode)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid or expired OTP. Please try again.' };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Verification failed. Please try again.' };
    }
  }

  // Step 3: Reset password using Supabase RPC function
  async function resetPassword(email, newPassword, otpCode) {
    try {
      const { data, error } = await supabase.rpc('handle_password_reset', {
        user_email: email,
        new_pass: newPassword,
        otp_code: otpCode,
      });

      if (error) {
        console.error('Password reset RPC error:', error);
        return { success: false, error: `Reset failed: ${error.message || error.code || JSON.stringify(error)}` };
      }

      // The RPC returns a JSON object { success: bool, error?: string }
      if (data && data.success === false) {
        return { success: false, error: data.error || 'Password reset failed.' };
      }

      return { success: true };
    } catch (err) {
      console.error('resetPassword error:', err);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
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
