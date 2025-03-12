import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Copy, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AnimatedIcon from '@/components/ui/AnimatedIcon';
import { toast } from 'sonner';

export type Coupon = {
  id: string;
  code: string;
  discount: string;
  expiresAt: string;
  merchant: string;
  description: string;
  claimed: boolean;
  isRedeemed?: boolean;
};

interface CouponCardProps {
  coupon: Coupon;
  onClaim?: (id: string) => void;
  className?: string;
}

const CouponCard = ({ coupon, onClaim, className }: CouponCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success('Coupon code copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };
  
  const handleClaim = () => {
    if (onClaim) {
      onClaim(coupon.id);
    }
  };

  const expiryDate = new Date(coupon.expiresAt);
  const isExpired = expiryDate < new Date();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          'overflow-hidden smooth-transition',
          coupon.claimed ? 'bg-secondary/50' : 'bg-card',
          isHovered && !coupon.claimed ? 'shadow-lg' : 'shadow-sm',
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <AnimatedIcon 
                icon={<Ticket className="text-primary" />} 
                animation={isHovered ? 'bounce' : 'none'}
                size="md"
              />
              {coupon.merchant}
            </CardTitle>
            <span className="text-xl font-bold text-primary">{coupon.discount}</span>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground mb-3">{coupon.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {isExpired 
                ? <span className="text-destructive">Expired</span> 
                : `Expires: ${expiryDate.toLocaleDateString()}`
              }
            </div>
            
            {coupon.claimed && (
              <div className={`text-xs font-medium ${coupon.isRedeemed ? 'text-muted-foreground' : 'text-primary'}`}>
                {coupon.isRedeemed ? 'Redeemed' : 'Ready to use'}
              </div>
            )}
          </div>
          
          {coupon.claimed && (
            <div className="mt-4 p-2 bg-secondary rounded-md flex items-center justify-between">
              <code className="text-sm font-mono">{coupon.code}</code>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </CardContent>
        
        {!coupon.claimed && (
          <CardFooter className="pt-0">
            <Button 
              onClick={handleClaim} 
              className="w-full group"
              disabled={isExpired}
            >
              <span>Claim Coupon</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default CouponCard;
