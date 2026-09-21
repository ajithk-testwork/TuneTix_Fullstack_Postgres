import { useState } from "react";
import { useForm } from "react-hook-form";
import API from "../../api/userAPI";
import toast from "react-hot-toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  
  // Extract email from navigation state if it exists
  const stateEmail = location.state?.email || "";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: stateEmail,
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Ensure passwords match
  const newPassword = watch("newPassword");

  const onSubmit = async (data: any) => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP", {
        style: { background: "#F04438", color: "#FFF", borderRadius: "12px" },
      });
      return;
    }

    try {
      const payload = {
        email: data.email,
        otp: otp,
        newPassword: data.newPassword,
      };

      const res = await API.post("/auth/reset-password", payload);

      toast.success(res.data.message || "Password reset successfully!", {
        style: { background: "#12B76A", color: "#FFF", borderRadius: "12px" },
      });

      navigate("/login");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to reset password. OTP may be invalid.",
        {
          style: { background: "#F04438", color: "#FFF", borderRadius: "12px" },
        }
      );
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4 sm:p-6 overflow-hidden font-sans">
      {/* Background Dot Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px] bg-[#FFFFFF] rounded-[32px] p-8 sm:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-gray-100"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-[#6C5CE7]/10 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-[#6C5CE7]" />
          </div>
          <h1 className="text-[28px] font-[800] tracking-tight text-[#172033] mb-2">
            Create New Password
          </h1>
          <p className="text-[#667085] font-[500] text-sm">
            Enter the 6-digit OTP sent to your email and your new password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden Email Field (Used if the user reloads and needs to manually enter it) */}
          {!stateEmail && (
            <div>
               <input
                type="email"
                placeholder="Confirm your email"
                {...register("email", { required: "Email is required" })}
                className="w-full bg-[#F8F9FC] border border-transparent rounded-[16px] px-4 py-4 text-sm text-[#172033] font-[500] outline-none focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10"
              />
            </div>
          )}

          {/* OTP Field (Styled like VerifyEmail) */}
          <div>
            <label className="block text-xs font-[600] text-[#667085] mb-1.5 ml-1">
              Verification Code (OTP)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full bg-[#F8F9FC] border border-transparent rounded-2xl px-4 py-3 text-center text-2xl tracking-[10px] font-[700] text-[#172033] outline-none focus:bg-white focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all"
            />
          </div>

          {/* New Password Field */}
          <div>
            <div className="relative flex items-center mt-2">
              <Lock className="absolute left-4 w-5 h-5 text-[#667085] pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                {...register("newPassword", { 
                  required: "New password is required",
                  minLength: { value: 6, message: "Minimum 6 characters required" }
                })}
                className={`w-full bg-[#F8F9FC] border ${
                  errors.newPassword ? "border-[#F04438]" : "border-transparent"
                } rounded-[16px] pl-12 pr-12 py-4 text-sm text-[#172033] font-[500] placeholder:text-[#667085] outline-none transition-all duration-200 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-[#667085] hover:text-[#6C5CE7] transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-[#F04438] text-xs mt-1.5 ml-1 font-[500]">
                {errors.newPassword?.message as string}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-5 h-5 text-[#667085] pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: value => value === newPassword || "Passwords do not match"
                })}
                className={`w-full bg-[#F8F9FC] border ${
                  errors.confirmPassword ? "border-[#F04438]" : "border-transparent"
                } rounded-[16px] pl-12 pr-4 py-4 text-sm text-[#172033] font-[500] placeholder:text-[#667085] outline-none transition-all duration-200 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[#F04438] text-xs mt-1.5 ml-1 font-[500]">
                {errors.confirmPassword?.message as string}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="w-full bg-[#6C5CE7] hover:bg-[#4834D4] text-[#FFFFFF] font-[600] py-4 px-4 rounded-[16px] transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(108,92,231,0.25)]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>

        {/* Back to Login */}
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

export default ResetPassword;