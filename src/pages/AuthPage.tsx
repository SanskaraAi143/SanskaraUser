import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Sign In Schema
const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
type SignInFormValues = z.infer<typeof signInSchema>;

// Sign Up Schema
const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type SignUpFormValues = z.infer<typeof signUpSchema>;

// Sign In Form Component
const SignInForm = () => {
    const { signIn } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (values: SignInFormValues) => {
        setIsSubmitting(true);
        try {
            await signIn(values.email, values.password);
        } catch (error) {
            console.error("Sign in error:", error);
            // You might want to show a toast notification here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="your.email@example.com" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</> : 'Sign In'}
                </Button>
            </form>
        </Form>
    );
};

// Sign Up Form Component
const SignUpForm = () => {
    const { signUp } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    const onSubmit = async (values: SignUpFormValues) => {
        setIsSubmitting(true);
        try {
            await signUp(values.email, values.password, values.name);
            // The useEffect on the main AuthPage will handle the redirect
        } catch (error) {
            console.error("Sign up error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="your.email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</> : 'Create Account'}
                </Button>
            </form>
        </Form>
    );
};

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    setIsSignUp(mode !== 'signin');
  }, [location.search]);

  useEffect(() => {
    if (user) {
      // If invited partner and onboarding is still in progress, force onboarding
      const details: any = user.wedding_details_json || {};
      const isInvitedPartner = user.role === 'invited_partner' || details?.other_partner_email_expected === user.email;
      if (isInvitedPartner && user.wedding_status === 'onboarding_in_progress') {
        navigate('/onboarding', { replace: true });
        return;
      }
      // If they already have a wedding, go to dashboard
      if (user.wedding_id) {
        navigate('/dashboard', { replace: true });
        return;
      }
      // Default to onboarding for new users (no wedding yet)
      navigate('/onboarding', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-wedding-cream">
      <Helmet>
        <title>{isSignUp ? 'Sign Up' : 'Sign In'} - Sanskara AI</title>
        <meta name="description" content={`Access your Sanskara AI account.`} />
      </Helmet>
      
      <Link to="/" className="mb-8">
        <div className="flex items-center gap-3">
            <div className="h-12 w-12 flex items-center justify-center bg-gradient-to-br from-wedding-gold to-wedding-orange rounded-full shadow-lg">
                <img src="/logo.jpeg" alt="Sanskara AI Logo" className="h-10 w-10 object-contain rounded-full" />
            </div>
            <span className="text-3xl font-lora font-bold text-wedding-brown">Sanskara<span className="text-wedding-gold">AI</span></span>
        </div>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{isSignUp ? 'Create an Account' : 'Welcome Back'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Join to start planning your dream wedding today.' : 'Sign in to continue planning.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSignUp ? <SignUpForm /> : <SignInForm />}
          <div className="mt-4 text-center text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Button variant="link" className="text-wedding-orange" onClick={() => navigate(isSignUp ? '/auth?mode=signin' : '/auth?mode=signup')}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
