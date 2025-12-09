// VERIFY OTP PAGE

// OTP verification page after signup
import { Mail, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();

  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length - 1, 5);
    document.getElementById(`otp-${lastIndex}`).focus();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      await verifyOTP(email, otpValue);
      setSuccess('Email verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0').focus();
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      await resendOTP(email);
      setSuccess('OTP sent successfully! Check your email.');
      setResendTimer(60); // 60 seconds cooldown
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0').focus();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg- linear-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-indigo-600" />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP Input Fields */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed mb-4"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading || resendTimer > 0}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendLoading
                  ? 'Sending...'
                  : resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : 'Resend OTP'}
              </button>
            </div>
          </form>
        </div>

        {/* Email Info */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
            <Mail className="w-4 h-4 mr-2 text-blue-600" />
            Check your spam folder if you don't see the email
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link to="/signup" className="text-sm text-gray-600 hover:text-indigo-600">
            ← Change email address
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;