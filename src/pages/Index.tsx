import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Tag, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CouponCard, { Coupon } from '@/components/coupon/CouponCard';
import CouponForm from '@/components/coupon/CouponForm';
import AnimatedIcon from '@/components/ui/AnimatedIcon';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  generateVerificationToken, 
  sendVerificationEmail, 
  getAllCoupons,
  getNextAvailableCoupon,
  claimCoupon,
  checkRateLimiting,
  hasUserClaimedCoupon
} from '@/utils/validation';
import { isUserRestricted } from '@/utils/abusePreventionUtils';
import { toast } from 'sonner';

const features = [
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Fair Distribution',
    description: 'Ensures every user gets an equal opportunity to claim limited coupons in a round-robin fashion.'
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Abuse Prevention',
    description: 'Sophisticated verification processes prevent bots and duplicate claims.'
  },
  {
    icon: <Tag className="h-6 w-6" />,
    title: 'Seamless Redemption',
    description: 'Easy-to-use interface for both coupon providers and end users.'
  }
];

const Index = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  useEffect(() => {
    const availableCoupons = getAllCoupons();
    setCoupons(availableCoupons);
  }, []);
  
  const handleClaimCoupon = (id: string) => {
    if (isUserRestricted()) {
      toast.error("You've recently claimed a coupon. Please try again later.");
      return;
    }
    
    const coupon = coupons.find(c => c.id === id);
    if (coupon) {
      setSelectedCoupon(coupon);
      setDialogOpen(true);
    }
  };
  
  const handleGetNextCoupon = () => {
    if (isUserRestricted()) {
      toast.error("You've recently claimed a coupon. Please try again later.");
      return;
    }
    
    const nextCoupon = getNextAvailableCoupon();
    if (nextCoupon) {
      setSelectedCoupon(nextCoupon);
      setDialogOpen(true);
      toast.info("We've selected the next available coupon for you!");
    } else {
      toast.error("Sorry, all coupons have been claimed!");
    }
  };
  
  const handleFormSubmit = async (data: { email: string, name: string }) => {
    if (!selectedCoupon) {
      toast.error("No coupon selected");
      return;
    }
    
    const userIP = "127.0.0.1";
    const isRateLimited = !(await checkRateLimiting(userIP));
    
    if (isRateLimited) {
      toast.error("Too many requests. Please try again later.");
      return;
    }
    
    const hasClaimedBefore = await hasUserClaimedCoupon(data.email, "campaign-1");
    if (hasClaimedBefore) {
      toast.error("You've already claimed a coupon from this campaign.");
      return;
    }
    
    const token = generateVerificationToken();
    
    await sendVerificationEmail(data.email, token);
    
    setVerificationSent(true);
    
    setTimeout(() => {
      const claimedCoupon = claimCoupon(selectedCoupon.id, { 
        name: data.name, 
        email: data.email 
      });
      
      if (claimedCoupon) {
        const updatedCoupons = coupons.map(c => 
          c.id === claimedCoupon.id ? claimedCoupon : c
        );
        
        setCoupons(updatedCoupons);
        setDialogOpen(false);
        setVerificationSent(false);
        toast.success('Coupon claimed successfully!', {
          description: `Coupon code: ${claimedCoupon.code}`,
        });
      } else {
        toast.error('Sorry, this coupon is no longer available');
        setDialogOpen(false);
        setVerificationSent(false);
      }
    }, 2000);
  };
  
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <section className="pt-28 pb-20 px-6 md:pt-36 md:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/50 to-transparent -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Fair Coupon Distribution with
              <span className="text-primary block mt-2">Intelligent Protection</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto">
              Ensure your limited coupons reach genuine users through our smart round-robin system with built-in abuse prevention.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8" onClick={handleGetNextCoupon}>
                Claim a Coupon
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                Learn More
              </Button>
            </div>
            
            <button 
              onClick={scrollToFeatures}
              className="flex items-center justify-center mx-auto mt-16 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <span>Discover Features</span>
              <ChevronDown className="h-4 w-4 ml-1 animate-bounce-subtle" />
            </button>
          </motion.div>
        </div>
      </section>
      
      <section id="features" className="py-20 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform combines elegant design with powerful functionality to create the perfect coupon distribution system.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card p-6 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <AnimatedIcon 
                    icon={React.cloneElement(feature.icon as React.ReactElement, { 
                      className: 'text-primary' 
                    })} 
                    animation="pulse"
                  />
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">Available Coupons</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Browse and claim available coupons from our partners. New coupons are added regularly.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon, index) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onClaim={handleClaimCoupon}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleGetNextCoupon}
            >
              Get Next Available Coupon
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our streamlined process ensures fair distribution while preventing fraud.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/4 left-[calc(16.67%-8px)] right-[calc(16.67%-8px)] h-0.5 bg-border" />
            
            {['Browse Coupons', 'Verify Identity', 'Claim & Redeem'].map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg mb-6 relative z-10">
                  {index + 1}
                </div>
                <h3 className="text-xl font-medium mb-2">{step}</h3>
                <p className="text-muted-foreground max-w-xs">
                  {index === 0 && "Browse through available coupons from our partnered merchants."}
                  {index === 1 && "Complete a simple verification process to prevent abuse."}
                  {index === 2 && "Receive your unique coupon code and redeem it at the merchant."}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Start Distributing Coupons?</h2>
            <p className="mb-8 opacity-90">
              Join thousands of businesses that use our platform to fairly distribute their promotional offers.
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90"
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Claim Your Coupon</DialogTitle>
            <DialogDescription>
              {verificationSent 
                ? "Verification email sent! Check your inbox to complete the process."
                : selectedCoupon ? `Claim "${selectedCoupon.discount}" coupon from ${selectedCoupon.merchant}` : "Complete this form to claim your coupon."
              }
            </DialogDescription>
          </DialogHeader>
          
          {!verificationSent ? (
            <CouponForm 
              onSubmit={handleFormSubmit} 
              couponCode={selectedCoupon?.code}
            />
          ) : (
            <div className="py-6 text-center">
              <div className="animate-pulse mb-4">
                <Shield className="h-12 w-12 mx-auto text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                For demo purposes, the coupon will be automatically claimed in a few seconds.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
