import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail, Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { otpAPI, verificationAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const { setUser, user } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('No email provided for verification');
      navigate('/profile');
    }
  }, [email, navigate]);

  const verifyMutation = useMutation({
    mutationFn: async (otpCode) => {
      const response = await verificationAPI.verifyEmail(email, otpCode);
      return response.data;
    },
    onSuccess: (data) => {
      // Only show one toast and navigate
      if (data.success) {
        setIsVerified(true);
        // Update user verification status in auth store
        if (user) {
          setUser({ ...user, emailVerified: true });
        }
        toast.success('Email verified successfully!');
        setTimeout(() => navigate('/profile'), 1000);
      }
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Invalid verification code';
      // Only show error if not already verified
      if (!isVerified) {
        toast.error(message);
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await otpAPI.request({ email });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Verification code resent!');
      setCountdown(30);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResending(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: () => {
      toast.error('Failed to resend verification code');
      setIsResending(false);
    },
  });

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(0, 1);
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all fields filled
    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        verifyMutation.mutate(fullOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }
    verifyMutation.mutate(fullOtp);
  };

  const handleResend = () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    resendMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter the 6-digit code sent to
            </p>
            <p className="text-primary-600 font-medium">{email}</p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={verifyMutation.isPending || otp.some(d => !d)}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {verifyMutation.isPending ? (
                <>
                  <Shield className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verify Email
                </>
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Didn't receive the code?
            </p>
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend in {countdown}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Resend Code
              </button>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/profile')}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-400">
                <p className="font-medium mb-1">Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Check your spam folder if you don't see the email</li>
                  <li>The code expires in 10 minutes</li>
                  <li>Don't share your verification code with anyone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
