import React, { useState } from "react";
import { CivicIssue, UserProfile } from "../types";
import { CitizenImpactSection } from "./CitizenImpactSection";

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  user?: UserProfile;
  issues?: CivicIssue[];
  onUpdateUser?: (updatedUser: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  user,
  issues = [],
  onUpdateUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"login" | "profile">("login");
  const [loginMethod, setLoginMethod] = useState<"email" | "otp">("email");

  // Email & Password State
  const [email, setEmail] = useState("michael.c@tn.gov.in");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);

  // Mobile OTP State
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobileNumber, setMobileNumber] = useState("9876543210");
  const [otp, setOtp] = useState<string[]>(["1", "2", "3", "4", "5", "6"]);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLoginSuccess({
        name: "Michael Chen",
        email: email.trim(),
        mobile: "+91 9876543210",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBVpPwVPV6fl-R7ZdKSNTlJrhmXqkdhl7-na-GrzyzOY5_1FN_tX206sEf3_6FWgzOu-gg9mqSALJ0zQrqeGnQFpawDbXcuM3c4m3Bo3YM8QILc4eYUFpcIHlbLna1jVTj8zFdVYy7FbuMrdVL27x1MYDbX-loE1y_VYsCiQz2tq5HchLY2ZNt05TdfiVRXy9kiNoEXb6y2Og5vakUcCXIgvOgzj1Q93cvZP4S_WVT6aC_i6ZbheRy6",
        role: "citizen",
        isLoggedIn: true,
      });
      setActiveSubTab("profile");
    }
  };

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.trim()) {
      setStep("otp");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance focus
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleCitizenLogin = () => {
    onLoginSuccess({
      name: "Michael Chen",
      email: "michael.c@tn.gov.in",
      mobile: "+91 " + mobileNumber,
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBVpPwVPV6fl-R7ZdKSNTlJrhmXqkdhl7-na-GrzyzOY5_1FN_tX206sEf3_6FWgzOu-gg9mqSALJ0zQrqeGnQFpawDbXcuM3c4m3Bo3YM8QILc4eYUFpcIHlbLna1jVTj8zFdVYy7FbuMrdVL27x1MYDbX-loE1y_VYsCiQz2tq5HchLY2ZNt05TdfiVRXy9kiNoEXb6y2Og5vakUcCXIgvOgzj1Q93cvZP4S_WVT6aC_i6ZbheRy6",
      role: "citizen",
      isLoggedIn: true,
    });
    setActiveSubTab("profile");
  };

  const handleOfficerLogin = () => {
    onLoginSuccess({
      name: "Sarah Jenkins (Officer)",
      email: "s.jenkins@tn.gov.in",
      mobile: "+91 9444012345",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBsiVWurosgMAzbAKgcKDyVO9Oo1lzxA3lKCioBr_Z0X2PM2RsuOZpbR3L-d1Ga9szFTZ1Bp4ppUOLajQbxPTSyuY2HeWI4y57G40H5fgpuSamQij6Q3EmT3CsrCGq1s2RbE6m2W6_mncoh_ieJWf1X3ijGseRSORqlZQHUbEJwyIXBDsKRRKt0BAI3GBEpfpkRqOrkhKKeBxTsyOijKtZ1dD2GpnyWvXJI-DOftV2T-KwzG7FyGwpo",
      role: "admin",
      isLoggedIn: true,
    });
    setActiveSubTab("profile");
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail.trim()) {
      setForgotSubmitted(true);
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-6 space-y-6 pb-28 md:pb-12 relative z-10">
      {/* Top Header Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/40 p-3 rounded-3xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
            <span className="material-symbols-outlined text-xl">verified_user</span>
          </div>
          <div>
            <h1 className="text-base font-black text-white uppercase tracking-wider">
              User Access & Portal Center
            </h1>
            <p className="text-xs text-white/60">
              Government of Tamil Nadu Civic Action Authentication & Account Center
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex text-xs font-bold uppercase tracking-wider w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab("login")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeSubTab === "login"
                ? "bg-orange-500 text-black font-black shadow-[0_0_16px_rgba(249,115,22,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">login</span>
            Login Form
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("profile")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeSubTab === "profile"
                ? "bg-orange-500 text-black font-black shadow-[0_0_16px_rgba(249,115,22,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">person</span>
            My Profile
          </button>
        </div>
      </div>

      {activeSubTab === "login" ? (
        <div className="min-h-[60vh] flex items-center justify-center py-4">
          <div className="w-full max-w-md glass-card border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            {/* Accent Top Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>

            {/* Header Section */}
            <div className="flex flex-col items-center text-center mb-6 pt-2">
              <div className="w-16 h-16 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <span className="material-symbols-outlined text-3xl">account_balance</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-1">
                Tamil Nadu Civic Portal
              </h2>
              <p className="text-xs text-white/60">
                Sign in to manage issues, track complaints & view resolution SLAs
              </p>
            </div>

            {/* Auth Method Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 mb-6 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                  loginMethod === "email"
                    ? "bg-orange-500 text-black font-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("otp")}
                className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                  loginMethod === "otp"
                    ? "bg-orange-500 text-black font-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Mobile OTP
              </button>
            </div>

            {loginMethod === "email" ? (
              /* Email & Password Login Form */
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label
                    className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5"
                    htmlFor="login-email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                      mail
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@tn.gov.in"
                      className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-xs font-semibold text-white transition-all outline-none border border-white/10 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      className="block text-[10px] font-bold text-white/60 uppercase tracking-widest"
                      htmlFor="login-password"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotSubmitted(false);
                        setShowForgotModal(true);
                      }}
                      className="text-[11px] font-extrabold text-orange-400 hover:text-orange-300 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                      lock
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="glass-input w-full pl-11 pr-11 py-3 rounded-xl text-xs font-semibold text-white transition-all outline-none border border-white/10 focus:border-orange-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-black font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-orange-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.4)] mt-2"
                >
                  Sign In to Account
                  <span className="material-symbols-outlined text-base">login</span>
                </button>
              </form>
            ) : (
              /* Mobile OTP Form */
              step === "mobile" ? (
                <form onSubmit={handleMobileSubmit} className="space-y-4">
                  <div>
                    <label
                      className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5"
                      htmlFor="mobile"
                    >
                      Tamil Nadu Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 text-sm font-bold">
                        +91
                      </span>
                      <input
                        id="mobile"
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className="glass-input w-full pl-14 pr-4 py-3 rounded-xl text-xs font-semibold text-white transition-all outline-none border border-white/10 focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 text-black font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-orange-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                  >
                    Send OTP Code
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-white/60">Enter the 6-digit code sent to</p>
                    <p className="text-sm font-bold text-orange-400 mt-0.5">
                      +91 {mobileNumber}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep("mobile")}
                      className="text-xs text-orange-400 font-bold hover:underline mt-1 cursor-pointer"
                    >
                      Change number
                    </button>
                  </div>

                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="glass-input w-11 h-13 text-center text-xl font-bold rounded-xl text-white focus:border-orange-500 border border-white/10 outline-none transition-all"
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleCitizenLogin}
                    className="w-full bg-orange-500 text-black font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-orange-400 transition-colors flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                  >
                    Verify & Login as Citizen
                  </button>

                  <div className="text-center mt-2">
                    <p className="text-xs text-white/60">
                      Didn't receive code?{" "}
                      <button
                        type="button"
                        className="text-orange-400 font-bold hover:underline cursor-pointer"
                      >
                        Resend
                      </button>
                    </p>
                  </div>
                </div>
              )
            )}

            {/* Social Authentication Section */}
            <div className="mt-6">
              <div className="relative py-2 mb-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#090d16] px-3 text-[10px] font-black text-white/40 uppercase tracking-widest">
                    Or Sign In With
                  </span>
                </div>
              </div>

              {/* Social Buttons Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCitizenLogin}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.8-.4-1.6-.4-2.3z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleCitizenLogin}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-emerald-400">
                    badge
                  </span>
                  <span>DigiLocker</span>
                </button>
              </div>
            </div>

            {/* Quick Demo Authentication Buttons */}
            <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
              <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block text-center">
                Instant Demo Access
              </span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCitizenLogin}
                  className="w-full bg-orange-500/10 border border-orange-500/30 text-orange-300 hover:bg-orange-500/20 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">person</span>
                  Quick Citizen Login (Michael Chen)
                </button>

                <button
                  type="button"
                  onClick={handleOfficerLogin}
                  className="w-full bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-blue-400">
                    admin_panel_settings
                  </span>
                  Quick Govt Officer Login (Sarah Jenkins)
                </button>
              </div>
            </div>

            <div className="text-center mt-5 opacity-60">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                Protected by Tamil Nadu State e-Governance Protocol
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {user && (
            <CitizenImpactSection
              user={user}
              issues={issues}
              compact={false}
              onUpdateUser={onUpdateUser}
            />
          )}
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-card rounded-3xl border border-orange-500/30 p-6 max-w-md w-full relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400 text-xl">lock_reset</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Reset Account Password
                </h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-full cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <span className="material-symbols-outlined text-2xl">mark_email_read</span>
                </div>
                <h4 className="text-sm font-extrabold text-white">Reset Link Sent!</h4>
                <p className="text-xs text-white/70">
                  Password reset instructions have been sent to{" "}
                  <span className="text-orange-400 font-bold">{forgotEmail}</span>. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full bg-orange-500 text-black font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-orange-400 transition-colors mt-2 cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-white/70">
                  Enter your registered Tamil Nadu portal email address. We will send you a secure link to reset your password.
                </p>

                <div>
                  <label
                    className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5"
                    htmlFor="forgot-email"
                  >
                    Registered Email
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                      mail
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="citizen@tn.gov.in"
                      className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-xs font-semibold text-white transition-all outline-none border border-white/10 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-extrabold uppercase shadow-[0_0_16px_rgba(249,115,22,0.4)] cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
