import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { 
  isUserRestricted, 
  trackClaimAttempt, 
  recordSuccessfulClaim, 
  checkAndClearCookieRestriction 
} from '@/utils/abusePreventionUtils';
import RestrictionCountdown from './RestrictionCountdown';

const formSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name must not exceed 50 characters' }),
});

type FormData = z.infer<typeof formSchema>;

interface CouponFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
  couponCode?: string;
}

const CouponForm = ({ onSubmit, isLoading = false, couponCode }: CouponFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [restricted, setRestricted] = useState(false);

  // Check for restrictions when the component mounts
  useEffect(() => {
    const checkRestrictions = () => {
      checkAndClearCookieRestriction();
      setRestricted(isUserRestricted());
    };
    
    checkRestrictions();
    // Check periodically for restriction changes
    const interval = setInterval(checkRestrictions, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const handleSubmit = async (data: FormData) => {
    // Check if user is currently restricted
    if (isUserRestricted()) {
      toast.error("You've recently claimed a coupon. Please try again later.");
      setRestricted(true);
      return;
    }
    
    // Check for rate limiting
    if (!trackClaimAttempt()) {
      return; // The trackClaimAttempt function will display the error message
    }
    
    try {
      setSubmitting(true);
      await onSubmit(data);
      
      // Record the successful claim
      recordSuccessfulClaim();
      
      // Reset form and show success message
      form.reset();
      toast.success('Coupon claimed successfully!', {
        description: couponCode ? `Your coupon code: ${couponCode}` : undefined
      });
      
      // Update restriction status
      setRestricted(true);
    } catch (error) {
      toast.error('Failed to claim coupon. Please try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardContent className="p-0">
        {restricted && <RestrictionCountdown />}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your name" 
                      {...field} 
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                      {...field}
                      className="h-10" 
                    />
                  </FormControl>
                  <FormDescription>
                    We'll send a verification link to this email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {couponCode && (
              <div className="p-2 bg-secondary rounded-md mt-4">
                <p className="text-sm font-medium">Coupon code: <code className="font-mono">{couponCode}</code></p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={submitting || isLoading || restricted}
            >
              {submitting || isLoading ? 'Processing...' : restricted ? 'Waiting Period Active' : 'Continue'}
            </Button>
            
            <div className="flex items-center space-x-2 bg-primary/5 p-2 rounded-md mt-2">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                Abuse prevention active. One coupon per user per hour.
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CouponForm;
