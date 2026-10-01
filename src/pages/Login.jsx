import { useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useUser } from "../context/UserContext";

export default function Login() {
  const { isAuthenticated, sendOtp, verifyOtp, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [step, setStep] = useState(1); // 1 = mobile, 2 = otp
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [debugOtp, setDebugOtp] = useState(null);
  const [isExisting, setExisting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setDebugOtp(null);

    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    const res = await sendOtp(mobile);
    console.log(res)
    if (res.success) {
      setInfo(res.message);
      setDebugOtp(res.debugOtp);
      setStep(2);
      setExisting(res?.existingUser);
    } else {
      setError(res.message || "Failed to send OTP");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length < 4) {
      setError("Enter the OTP");
      return;
    }

    const res = await verifyOtp({ mobile, otp, name: name.trim() });
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.message || "Invalid OTP");
    }
  };

  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      {/* soft blobs */}
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-mint blob opacity-60" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-leaf/20 blob opacity-50" />

      <div className="relative mx-auto flex max-w-lg flex-col items-center px-4 py-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-3xl border border-forest/10 bg-white p-8 shadow-lg shadow-forest/5"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-leaf text-xl font-bold text-white">
              SB
            </div>
            <h1 className="text-2xl font-bold text-ink">
              {step === 1 ? "Login / Register" : "Verify OTP"}
            </h1>
            <p className="mt-1 text-sm text-ink/60">
              {step === 1
                ? "Enter your mobile number to continue"
                : `OTP sent to +91 ${mobile}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <label className="block text-sm font-medium text-ink">
                  Mobile number
                  <div className="mt-1.5 flex overflow-hidden rounded-xl border border-forest/20 focus-within:border-leaf focus-within:ring-2 focus-within:ring-leaf/30">
                    <span className="flex items-center bg-mint px-3 text-sm font-medium text-forest">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) =>
                        setMobile(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      placeholder="9876543210"
                      className="w-full px-3 py-2.5 outline-none"
                      required
                    />
                  </div>
                </label>

                {error ? (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading || mobile.length !== 10}
                  className="btn-shine w-full rounded-full bg-leaf py-3 font-semibold text-white transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send OTP"}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                onSubmit={handleVerify}
                className="space-y-5"
              >
                {!isExisting && (
                  <label className="block text-sm font-medium text-ink">
                    Your name <span className="text-ink/40">(optional)</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="mt-1.5 w-full rounded-xl border border-forest/20 px-3 py-2.5 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/30"
                    />
                  </label>
                )}

                <label className="block text-sm font-medium text-ink">
                  Enter OTP
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="6-digit OTP"
                    className="mt-1.5 w-full rounded-xl border border-forest/20 px-3 py-2.5 text-center text-lg tracking-[0.4em] outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/30"
                    required
                    autoFocus
                  />
                </label>

                {debugOtp ? (
                  <div className="rounded-xl border border-dashed border-leaf/40 bg-mint/60 px-4 py-3 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-forest/70">
                      OTP (from server)
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-widest text-forest">
                      {debugOtp}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">
                      Use this code to verify (shown only in development)
                    </p>
                  </div>
                ) : null}

                {info && !debugOtp ? (
                  <p className="text-center text-sm text-forest">{info}</p>
                ) : null}

                {error ? (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="btn-shine w-full rounded-full bg-leaf py-3 font-semibold text-white transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Verifying…" : "Verify & Continue"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                    setDebugOtp(null);
                  }}
                  className="w-full text-center text-sm font-medium text-forest hover:underline"
                >
                  ← Change mobile number
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-6 text-center text-xs text-ink/40">
            By continuing you agree to SkyBirds terms.
            <br />
            New users are registered automatically.
          </p>
        </motion.div>

        <Link
          to="/"
          className="mt-6 text-sm font-medium text-forest hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
