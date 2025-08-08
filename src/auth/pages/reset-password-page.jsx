import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, LoaderCircleIcon, MoveLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ApiConfig } from '../context/EndPoints';
import { getResetRequestSchema } from '../forms/reset-password-schema';

export function ResetPasswordPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  const [successMessage, setSuccessMessage] = useState(null);
const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(getResetRequestSchema()),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values) {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccessMessage(null);

      // Simple validation
      if (!values.email.trim()) {
        setError('Email is required');
        toast.error('Email is required');
        return;
      }

      // Call the forgot-password API
      const response = await fetch(ApiConfig.forgotpassword, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.errors?.[0] || 'Failed to send reset link. Please try again.',
        );
        console.log("asdgsdgads",data);
        toast.error(
          data.errors?.[0]
          || 'Failed to send reset link. Please try again.',
        );
        return;
      }

      setSuccessMessage(
        data.message ||
          'Reset link sent to your email if it exists in our system.',
      );

      toast.success(
        data.message ||
          'Reset link sent to your email if it exists in our system.',
      );
      navigate('/auth/forgot-otp', {
        state: { email: values.email },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.',
      );
      toast.error(err.response.data.errors?.[0] || '222The selected email is invalid.');

      // toast.error(
      //   err instanceof Error
      //     ? err.message
      //     : 'An unexpected error occurred. Please try again.',
      // );
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Forgot Password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive a password reset link
                </p>
              </div>

              {/* {error && (
                <Alert variant="destructive">
                  <AlertIcon>
                    <AlertCircle className="h-4 w-4" />
                  </AlertIcon>
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )} */}

              {/* {successMessage && (
                <Alert>
                  <AlertIcon>
                    <Check className="h-4 w-4 text-green-500" />
                  </AlertIcon>
                  <AlertTitle>{successMessage}</AlertTitle>
                </Alert>
              )} */}

              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircleIcon className="h-4 w-4 animate-spin" />{' '}
                      Processing...
                    </span>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>

              <div className="text-center text-sm">
                <Link
                  to="/auth/signin"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent-foreground hover:underline hover:underline-offset-2"
                >
                  <MoveLeft className="size-3.5 opacity-70" /> Back to Sign In
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
