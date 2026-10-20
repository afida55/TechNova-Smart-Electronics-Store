import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { C } from "../lib/tokens";
import { useToast } from "../lib/ToastContext";
import { useAuth } from "../lib/AuthContext";

export default function AuthPage({ mode, setMode, setPage }) {
  const [touched, setTouched] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const toast = useToast();
  const { login, register } = useAuth();

  const isLogin = mode === "login";

  const usernameError =
    touched && username.trim().length < 3;

  const passwordError =
    touched &&
    password.length > 0 &&
    password.length < 6;

  const emailError =
    touched &&
    !isLogin &&
    !/^\S+@\S+\.\S+$/.test(email);

  const phoneError =
    touched &&
    !isLogin &&
    !/^\d{6,15}$/.test(phone);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setTouched(false);
    setServerError(null);
    setShowPassword(false);
  };

  const submit = async () => {
    setTouched(true);
    setServerError(null);

    const usernameValid =
      username.trim().length >= 3;

    const passwordValid =
      password.length >= 6;

    const emailValid =
      /^\S+@\S+\.\S+$/.test(email);

    const phoneValid =
      /^\d{6,15}$/.test(phone);

    if (!usernameValid || !passwordValid) {
      return;
    }

    if (
      !isLogin &&
      (!emailValid || !phoneValid)
    ) {
      return;
    }

    setSubmitting(true);

    try {
      if (isLogin) {
        const data = await login(
          username.trim(),
          password
        );

        toast(
          "Signed in successfully",
          "success"
        );

        if (data.role === "ADMIN") {
          setPage("admin");
        } else {
          setPage("home");
        }

        return;
      } else {
        await register({
          username: username.trim(),
          password,
          phone: phone.trim(),
          email: email.trim(),
        });

        toast(
          "Your account has been created",
          "success"
        );

        setPage("home");
      }
    }catch (err) {
      setServerError(
        err?.message ||
          (isLogin
            ? "Unable to sign in. Please check your credentials."
            : "Unable to create your account. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !submitting) {
      submit();
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8 sm:py-10"
      style={{
        background: C.base,
      }}
    >
      <div className="w-full max-w-[980px]">

        {/* MAIN AUTH CARD */}
        <div className="grid lg:grid-cols-[1fr_420px] bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

          {/* ============================================================
              LEFT BRAND PANEL
          ============================================================ */}
          <div className="hidden lg:flex relative overflow-hidden bg-[#172554] text-white p-8 xl:p-10 flex-col justify-between min-h-[500px]">

            {/* Decorative circles */}
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-400/10"
              aria-hidden="true"
            />

            <div
              className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-blue-400/10"
              aria-hidden="true"
            />

            {/* TOP / BRAND */}
            <div className="relative">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>

                <div>
                  <div className="text-lg font-bold tracking-tight">
                    TechNova
                  </div>

                  <div className="text-[9px] text-blue-200 uppercase tracking-[0.18em] font-semibold">
                    Smart electronics
                  </div>
                </div>
              </div>

              {/* MAIN MESSAGE */}
              <div className="mt-12 max-w-md">

                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-[10px] font-semibold text-blue-100">
                  <ShieldCheck size={13} />
                  Secure shopping experience
                </div>

                <h1 className="text-3xl xl:text-4xl font-bold leading-[1.12] mt-4 text-white">
                  Everything you need,
                  <br />
                  intelligently chosen.
                </h1>

                <p className="text-sm leading-6 text-blue-100/75 mt-4 max-w-sm">
                  Sign in to manage your orders,
                  save favorite products, and get
                  personalized recommendations from
                  TechNova.
                </p>

              </div>
            </div>

            {/* BENEFITS */}
            <div className="relative space-y-2.5">

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <CheckCircle2 size={15} />
                </div>

                <span className="text-xs text-blue-100">
                  Track your orders easily
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <CheckCircle2 size={15} />
                </div>

                <span className="text-xs text-blue-100">
                  Save products to your wishlist
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <CheckCircle2 size={15} />
                </div>

                <span className="text-xs text-blue-100">
                  Enjoy a personalized experience
                </span>
              </div>

            </div>
          </div>

          {/* ============================================================
              FORM PANEL
          ============================================================ */}
          <div className="p-6 sm:p-8 lg:p-9">

            {/* MOBILE BRAND */}
            <div className="lg:hidden flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-[#2D3E8C]/10 flex items-center justify-center">
                <ShoppingBag
                  size={19}
                  className="text-[#2D3E8C]"
                />
              </div>

              <div>
                <div className="text-base font-bold text-slate-900">
                  TechNova
                </div>

                <div className="text-[9px] text-slate-400 uppercase tracking-[0.16em] font-semibold">
                  Smart electronics
                </div>
              </div>

            </div>

            {/* ============================================================
                MODE SWITCH
            ============================================================ */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-1 flex gap-1">

              {["login", "register"].map((m) => {
                const active = mode === m;

                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
                      active
                        ? "bg-white text-[#2D3E8C] shadow-sm border border-slate-100"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {m === "login"
                      ? "Sign in"
                      : "Create account"}
                  </button>
                );
              })}

            </div>

            {/* ============================================================
                HEADER
            ============================================================ */}
            <div className="mt-6">

              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2D3E8C]">
                {isLogin
                  ? "Welcome back"
                  : "Get started"}
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mt-1.5">
                {isLogin
                  ? "Sign in to your account"
                  : "Create your TechNova account"}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-5">
                {isLogin
                  ? "Access your orders, wishlist, and personalized shopping experience."
                  : "Join TechNova and keep everything you need in one place."}
              </p>

            </div>

            {/* ============================================================
                SERVER ERROR
            ============================================================ */}
            {serverError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                <div className="flex items-start gap-2.5">

                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    !
                  </div>

                  <div>

                    <div className="text-xs font-bold text-red-700">
                      {isLogin
                        ? "Sign in failed"
                        : "Account creation failed"}
                    </div>

                    <div className="text-[11px] text-red-500 mt-0.5 leading-4">
                      {serverError}
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* ============================================================
                FORM
            ============================================================ */}
            <div className="mt-5 space-y-3.5">

              {/* USERNAME */}
              <div>

                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <User size={12} />
                  Username
                </label>

                <div className="relative mt-1.5">

                  <User
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />

                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setServerError(null);
                    }}
                    onBlur={() => setTouched(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className={`w-full h-11 rounded-xl border bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 ${
                      usernameError
                        ? "border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-[#2D3E8C] focus:ring-2 focus:ring-[#2D3E8C]/10"
                    }`}
                  />

                </div>

                {usernameError && (
                  <p className="text-[11px] text-red-500 mt-1.5">
                    Username must be at least 3 characters.
                  </p>
                )}

              </div>

              {/* EMAIL */}
              {!isLogin && (
                <div>

                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Mail size={12} />
                    Email address
                  </label>

                  <div className="relative mt-1.5">

                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setServerError(null);
                      }}
                      onBlur={() => setTouched(true)}
                      onKeyDown={handleKeyDown}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={`w-full h-11 rounded-xl border bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 ${
                        emailError
                          ? "border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-100"
                          : "border-slate-200 focus:border-[#2D3E8C] focus:ring-2 focus:ring-[#2D3E8C]/10"
                      }`}
                    />

                  </div>

                  {emailError && (
                    <p className="text-[11px] text-red-500 mt-1.5">
                      Enter a valid email address.
                    </p>
                  )}

                </div>
              )}

              {/* PHONE */}
              {!isLogin && (
                <div>

                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Phone size={12} />
                    Phone number
                  </label>

                  <div className="relative mt-1.5">

                    <Phone
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />

                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => {
                        setPhone(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        );
                        setServerError(null);
                      }}
                      onBlur={() => setTouched(true)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      className={`w-full h-11 rounded-xl border bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 ${
                        phoneError
                          ? "border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-100"
                          : "border-slate-200 focus:border-[#2D3E8C] focus:ring-2 focus:ring-[#2D3E8C]/10"
                      }`}
                    />

                  </div>

                  {phoneError && (
                    <p className="text-[11px] text-red-500 mt-1.5">
                      Enter a valid phone number (6-15 digits).
                    </p>
                  )}

                </div>
              )}

              {/* PASSWORD */}
              <div>

                <div className="flex items-center justify-between">

                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Lock size={12} />
                    Password
                  </label>

                  {!isLogin && (
                    <span className="text-[10px] text-slate-400">
                      Minimum 6 characters
                    </span>
                  )}

                </div>

                <div className="relative mt-1.5">

                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setServerError(null);
                    }}
                    onBlur={() => setTouched(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your password"
                    autoComplete={
                      isLogin
                        ? "current-password"
                        : "new-password"
                    }
                    className={`w-full h-11 rounded-xl border bg-white pl-9 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 ${
                      passwordError
                        ? "border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-[#2D3E8C] focus:ring-2 focus:ring-[#2D3E8C]/10"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>

                </div>

                {passwordError && (
                  <p className="text-[11px] text-red-500 mt-1.5">
                    Password must be at least 6 characters.
                  </p>
                )}

              </div>

            </div>

            {/* ============================================================
                SECURITY MESSAGE
            ============================================================ */}
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">

              <div className="flex items-start gap-2.5">

                <ShieldCheck
                  size={16}
                  className="text-[#2D3E8C] mt-0.5 flex-shrink-0"
                />

                <div>

                  <div className="text-[11px] font-bold text-slate-700">
                    Secure account access
                  </div>

                  <div className="text-[10px] text-slate-400 mt-0.5 leading-4">
                    Your account details are used to
                    manage orders, saved products, and
                    your TechNova experience.
                  </div>

                </div>

              </div>

            </div>

            {/* ============================================================
                SUBMIT
            ============================================================ */}
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="w-full mt-4 h-11 rounded-xl bg-[#2D3E8C] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#25357C] transition disabled:opacity-60 disabled:cursor-wait shadow-sm"
            >

              {submitting ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  {isLogin
                    ? "Signing in..."
                    : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin
                    ? "Sign in"
                    : "Create account"}

                  <ArrowRight size={15} />
                </>
              )}

            </button>

            {/* ============================================================
                SECONDARY ACTION
            ============================================================ */}
            <div className="text-center mt-4">

              <span className="text-[11px] text-slate-400">
                {isLogin
                  ? "Don't have a TechNova account?"
                  : "Already have a TechNova account?"}
              </span>

              <button
                type="button"
                onClick={() =>
                  switchMode(
                    isLogin
                      ? "register"
                      : "login"
                  )
                }
                className="ml-1.5 text-[11px] font-bold text-[#2D3E8C] hover:underline"
              >
                {isLogin
                  ? "Create one"
                  : "Sign in"}
              </button>

            </div>

          </div>
        </div>

        {/* ================================================================
            FOOTER TRUST
        ================================================================ */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-[10px] text-slate-400">

          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} />
            Secure account
          </span>

          <span className="flex items-center gap-1.5">
            <ShoppingBag size={12} />
            Smart electronics
          </span>

          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            Easy order tracking
          </span>

        </div>

      </div>
    </div>
  );
}