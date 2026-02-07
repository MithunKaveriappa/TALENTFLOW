export type AuthState =
  | "idle"
  | "signup_email"
  | "signup_name"
  | "signup_otp"
  | "signup_password"
  | "login_email"
  | "login_password"
  | "reset_email"
  | "post_login_routing";
