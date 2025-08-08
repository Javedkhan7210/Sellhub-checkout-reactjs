import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  LoaderCircleIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toAbsoluteUrl } from '@/lib/helpers';
import { getNewPasswordSchema } from '../forms/reset-password-schema';
import axios from 'axios';
import { ApiConfig } from '../context/EndPoints';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);
  const { theme } = useTheme();
  

  const location = useLocation();
  
  const email = location.state?.email || '';
  // Check for different possible token parameter names used by Supabase
  // Supabase might use 'token', 'code', 'token_hash' or pass it as a URL hash
  const token =
    searchParams.get('token') ||
    searchParams.get('code') ||
    searchParams.get('token_hash');

  console.log('Reset token from URL:', token);
  console.log(
    'All search parameters:',
    Object.fromEntries(searchParams.entries()),
  );

  // Process Supabase recovery token
  useEffect(() => {
    // This automatically processes the token in the URL
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Token is valid and has been processed by Supabase
        console.log('Password recovery mode activated');
        setTokenValid(true);
        setSuccessMessage('You can now set your new password');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Also check for hash fragment which might contain the token
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashToken =
      hashParams.get('token') ||
      hashParams.get('code') ||
      hashParams.get('token_hash');

    if (hashToken && !token) {
      console.log('Found token in URL hash fragment:', hashToken);
      // Optionally, you could update the state or reload the page with the token as a query param
    }
  }, [token]);

  const form = useForm({
    resolver: zodResolver(getNewPasswordSchema()),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values) {
    try {
      setIsProcessing(true);
      setError(null);

      // Build the endpoint URL using the token from the URL
      // if (!token) {
      //   throw new Error('Invalid or missing reset token.');
      // }
      const endpoint = `${ApiConfig.changePassword}${email}`;
      const payload = {
        password: values.password,
        password_confirmation: values.confirmPassword,
      };
      const response = await axios.put(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (response.data.status === false) {
        throw new Error(response.data.errors?.[0] || 'Password reset failed.');
      }

      setSuccessMessage('Password changed successfully!');
      form.reset();
      setTimeout(() => {
        navigate('/auth/signin');
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(
        err.response?.data?.errors?.[0] ||
        (err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
      <Card className="w-full max-w-[500px]">
      <div className="pt-4 flex items-center justify-center">
        {theme === 'dark' ? (
            <img
              src={toAbsoluteUrl('/media/app/default-logo-dark.png')}
              className="h-[48px] max-w-none"
              alt="Dark Logo"
            />
          ) : (
            <img
              src={toAbsoluteUrl('/media/app/sellhublogoblack.png')}
              className="h-[48px] max-w-none"
              alt="Light Logo"
            />
          )}

          {/* <img
            src={toAbsoluteUrl('/media/app/default-logo-dark.png')}
            className="h-[48px] max-w-none"
            alt=""
          /> */}
        </div>
      <CardContent className="p-6 sm:p-8">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Set New Password
              </h1>
              <p className="text-muted-foreground">
                Create a strong password for your account
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertIcon>
                  <AlertCircle className="h-4 w-4" />
                </AlertIcon>
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            {successMessage && (
              <Alert>
                <AlertIcon>
                  <Check className="h-4 w-4 text-green-500" />
                </AlertIcon>
                <AlertTitle>{successMessage}</AlertTitle>
              </Alert>
            )}

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className="relative">
                      <Input
                        placeholder="Create a strong password"
                        type={!passwordVisible ? 'text' : 'password'}
                        autoComplete="new-password"
                        {...field}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        mode="icon"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      >
                        {passwordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <Input
                        placeholder="Verify your password"
                        type={!confirmPasswordVisible ? 'text' : 'password'}
                        autoComplete="new-password"
                        {...field}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        mode="icon"
                        onClick={() =>
                          setConfirmPasswordVisible(!confirmPasswordVisible)
                        }
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      >
                        {confirmPasswordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <LoaderCircleIcon className="h-4 w-4" /> Updating Password...
                </span>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center text-sm">
              <Link to="/auth/signin" className="text-primary hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        </Form>
        </CardContent>
      </Card>
    </div>
  );
}
