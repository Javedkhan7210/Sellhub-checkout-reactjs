import { useState, useRef } from 'react';
import axios from 'axios';
import { MoveLeft } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiConfig } from '../../context/EndPoints';
import { useAuth } from '@/auth/context/auth-context';

const VerifyLoginOtp = () => {
  const [codeInputs, setCodeInputs] = useState(Array(6).fill(''));
  const inputRefs = useRef([]);
  const [searchParams] = useSearchParams();

  const [error, setError] = useState('');
  const location = useLocation();
  const { saveAuth, setUser: setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;

    const updatedInputs = [...codeInputs];
    updatedInputs[index] = value;
    setCodeInputs(updatedInputs);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus(); // move to next input
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus(); // move to previous input
    }
  };

  const handleVerifyOtp = async () => {
    const otp = codeInputs.join('');
    if (!email || otp.length !== 6) {
      setError('Please enter the complete OTP and ensure email is present.');
      return;
    }
    try {
      const response = await axios.put(
        ApiConfig.loginOTP,
        { email, otp },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        },
      );
      if (response.data.status) {
        toast.success('Email verified successfully.');
        const data = response.data;
        const authModel = {
          access_token: data.data.token.seller_token,
          refresh_token: data.data.token.seller_token,
        };
        saveAuth(authModel);
        sessionStorage.setItem('seller_token', data.data.token.seller_token);
        const nextPath = searchParams.get('next') || '/';
        navigate(nextPath);
        // navigate('/auth/signin');
      } else {
        toast.error(response.data.errors?.[0] || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
      <Card className="w-full max-w-[500px]">
        <div className="pt-4 flex items-center justify-center">
          <img
            src={toAbsoluteUrl('/media/app/default-logo-dark.png')}
            className="h-[48px] max-w-none"
            alt=""
          />
        </div>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 p-10">
            <img
              src={toAbsoluteUrl('/media/illustrations/34.svg')}
              className="dark:hidden h-20 mb-2"
              alt=""
            />
            <img
              src={toAbsoluteUrl('/media/illustrations/34-dark.svg')}
              className="light:hidden h-20 mb-2"
              alt=""
            />
            <div className="text-center mb-2">
              <h3 className="text-lg font-medium text-mono mb-5">
                Verify your email
              </h3>
              <div className="flex flex-col">
                <span className="text-sm text-secondary-foreground mb-1.5">
                  Enter the verification code we sent to
                </span>
                <a href="#" className="text-sm font-medium text-mono">
                  {email || '******.com'}
                </a>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5">
              {codeInputs.map((value, index) => (
                <Input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="size-10 shrink-0 px-0 text-center"
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>

            {error && <div className="text-red-500 text-center">{error}</div>}

            <Button className="grow" onClick={handleVerifyOtp}>
              Continue
            </Button>

            <Link
              to="/auth/signin"
              className="gap-2.5 flex items-center justify-center text-sm font-semibold text-foreground hover:text-primary"
            >
              <MoveLeft className="size-3.5 opacity-70" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { VerifyLoginOtp };
