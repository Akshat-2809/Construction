"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/firebases";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Tab = "login" | "register";
type Step = "form" | "otp";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-ink" /></div>}>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const [tab, setTab] = useState<Tab>("login");
  const [step, setStep] = useState<Step>("form");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/machinery";

  function switchTab(t: Tab) {
    setTab(t);
    setStep("form");
    setName("");
    setPhone("");
    setOtp("");
    setError("");
    setOtpError("");
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
  }

  async function handleSendOtp() {
    setError("");
    setOtpError("");

    if (tab === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setSendingOtp(true);
    try {
      const checkRes = await fetch(`${API_URL}/api/auth/check-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const { exists } = await checkRes.json();

      if (tab === "register" && exists) {
        setError("This number is already registered. Please log in.");
        setSendingOtp(false);
        return;
      }
      if (tab === "login" && !exists) {
        setError("This number is not registered. Please create an account.");
        setSendingOtp(false);
        return;
      }

      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      recaptchaRef.current = verifier;

      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${phone.replace(/\D/g, "")}`,
        verifier
      );
      confirmationRef.current = confirmation;
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (!confirmationRef.current) return;
    setVerifying(true);
    setOtpError("");
    try {
      await confirmationRef.current.confirm(otp);

      const endpoint = tab === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = tab === "register" ? { name: name.trim(), phone } : { phone };

      setSubmitting(true);
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }

      const { token, user: userData } = await res.json();
      login(userData, token);
      router.push(redirect);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
    } finally {
      setVerifying(false);
      setSubmitting(false);
    }
  }

  async function resendOtp() {
    setOtp("");
    setOtpError("");
    setStep("form");
    setTimeout(() => handleSendOtp(), 100);
  }

  function handleFormKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!sendingOtp) handleSendOtp();
    }
  }

  function handleOtpKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!verifying && !submitting && otp.length >= 6) handleVerifyOtp();
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/circle.webp"
              alt="Myequipo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-semibold tracking-tight text-ink">Myequipo</span>
          </Link>
          <p className="mt-3 text-neutral-500">
            {tab === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                  tab === t ? "bg-white text-ink shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {t === "login" ? "Log in" : "Register"}
              </button>
            ))}
          </div>

          {step === "form" && (
            <div className="space-y-4">
              {tab === "register" && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Your name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[0-9]/g, ""))}
                    onKeyDown={handleFormKeyDown}
                    className={inputClass}
                    autoFocus
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Phone number</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-xl border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9980952438"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={handleFormKeyDown}
                    maxLength={10}
                    inputMode="numeric"
                    className={`${inputClass} rounded-l-none border-l-0`}
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
              )}

              <div id="recaptcha-container" />

              <button
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full rounded-full bg-hivis py-3.5 text-sm font-bold text-ink transition-all hover:bg-hivis-dark hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
              >
                {sendingOtp ? "Sending OTP…" : "Send OTP"}
              </button>

              <p className="text-center text-sm text-neutral-500">
                {tab === "login" ? (
                  <>No account?{" "}<button onClick={() => switchTab("register")} className="font-semibold text-ink hover:underline">Register here</button></>
                ) : (
                  <>Already have an account?{" "}<button onClick={() => switchTab("login")} className="font-semibold text-ink hover:underline">Log in</button></>
                )}
              </p>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center">
                <p className="text-sm text-neutral-500">OTP sent to</p>
                <p className="mt-0.5 font-semibold text-ink">+91 {phone}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Enter OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={handleOtpKeyDown}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3.5 text-center text-xl font-bold tracking-[0.5em] text-ink outline-none transition-colors focus:border-ink"
                  autoFocus
                />
              </div>

              {otpError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{otpError}</p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={verifying || submitting || otp.length < 6}
                className="w-full rounded-full bg-hivis py-3.5 text-sm font-bold text-ink transition-all hover:bg-hivis-dark hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
              >
                {verifying || submitting
                  ? tab === "register" ? "Creating account…" : "Logging in…"
                  : tab === "register" ? "Create account" : "Log in"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button onClick={() => { setStep("form"); setOtp(""); setOtpError(""); }} className="text-neutral-500 hover:text-ink">
                  ← Change number
                </button>
                <button onClick={resendOtp} disabled={sendingOtp} className="font-semibold text-ink hover:underline disabled:opacity-50">
                  Resend OTP
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          By continuing you agree to Myequipo&apos;s Terms of Service.
        </p>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-ink";