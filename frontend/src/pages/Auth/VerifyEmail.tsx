import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/userAPI";

interface LocationState {
  email?: string;
  name?: string;
}

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;

  const [email, setEmail] = useState(state?.email || "");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleVerify = async () => {
    if (!email) {
      toast.error("Email is missing");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await API.post(
        "/auth/verify-registration-otp",
        {
          email,
          otp,
        }
      );

      toast.success(
        res.data.message || "Email verified successfully!"
      );

      navigate("/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is missing");
      return;
    }

    if (resendTimer > 0) {
      return;
    }

    try {
      setIsResending(true);

      const res = await API.post(
        "/auth/resend-registration-otp",
        {
          email,
        }
      );

      toast.success(
        res.data.message || "New OTP sent successfully"
      );

      setOtp("");
      setResendTimer(60);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to resend OTP"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4 overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[420px] bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-[#6C5CE7]/10 rounded-2xl flex items-center justify-center">
            <Mail className="w-7 h-7 text-[#6C5CE7]" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-[800] text-[#172033]">
            Verify Your Email
          </h1>
          <p className="text-[#667085] text-sm font-[500] mt-3 leading-6">
            We sent a 6-digit verification code to
          </p>
          <p className="text-[#172033] font-[700] text-sm mt-1 break-all">
            {email || "your email"}
          </p>
        </div>

        {/* OTP Input */}
        <div>
          <label className="block text-sm font-[600] text-[#172033] mb-2 ml-1">
            Verification Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              const value = e.target.value
                .replace(/\D/g, "")
                .slice(0, 6);
              setOtp(value);
            }}
            placeholder="000000"
            className="w-full bg-[#F8F9FC] border border-transparent rounded-2xl px-4 py-4 text-center text-2xl tracking-[10px] font-[700] text-[#172033] outline-none transition-all focus:bg-white focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10"
          />
        </div>

        {/* Verify Button */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={isSubmitting || otp.length !== 6}
          className="w-full mt-5 bg-[#6C5CE7] hover:bg-[#4834D4] text-white font-[600] py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(108,92,231,0.25)]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </button>

        {/* Resend Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-[#667085]">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendTimer > 0}
            className="mt-2 text-sm font-[700] text-[#6C5CE7] hover:underline disabled:text-[#98A2B3] disabled:no-underline"
          >
            {isResending
              ? "Sending..."
              : resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : "Resend OTP"}
          </button>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-[600] text-[#667085] hover:text-[#6C5CE7] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;