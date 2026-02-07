import { supabase } from "@/lib/supabaseClient";

// Auth service abstraction
// Handles signup, login, OTP, password reset
// UI should never call supabase directly

export const authService = {
  signupWithEmail: async (email: string) => {},
  verifyOtp: async (email: string, otp: string) => {},
  setPassword: async (password: string) => {},
  login: async (email: string, password: string) => {},
  resetPassword: async (email: string) => {},
};
