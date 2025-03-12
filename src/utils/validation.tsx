
// Simple abuse prevention utilities

// Internal store for coupon management (in a real app, this would be in a database)
type Coupon = {
    id: string;
    code: string;
    discount: string;
    expiresAt: string;
    merchant: string;
    description: string;
    claimed: boolean;
    isRedeemed?: boolean;
    distributionOrder: number;
    claimedBy?: {
      name?: string;
      email?: string;
      claimedAt?: Date;
    };
  };
  
  // In-memory coupon store (would be replaced by a database in production)
  let coupons: Coupon[] = [
    {
      id: '1',
      code: 'SUMMER25',
      discount: '25% OFF',
      expiresAt: '2023-12-31',
      merchant: 'Fashion Outlet',
      description: 'Get 25% off on all summer collection items.',
      claimed: false,
      isRedeemed: false,
      distributionOrder: 1
    },
    {
      id: '2',
      code: 'TECH15',
      discount: '$15 OFF',
      expiresAt: '2023-11-30',
      merchant: 'TechGadgets',
      description: 'Save $15 on electronics over $100.',
      claimed: false,
      isRedeemed: false,
      distributionOrder: 2
    },
    {
      id: '3',
      code: 'FOOD10',
      discount: '10% OFF',
      expiresAt: '2023-10-15',
      merchant: 'GourmetEats',
      description: 'Enjoy 10% off your next meal order.',
      claimed: false,
      isRedeemed: false,
      distributionOrder: 3
    },
    {
      id: '4',
      code: 'BOOKS50',
      discount: '50% OFF',
      expiresAt: '2023-12-31',
      merchant: 'Book Haven',
      description: 'Half price on selected books.',
      claimed: false,
      isRedeemed: false,
      distributionOrder: 4
    },
    {
      id: '5',
      code: 'TRAVEL20',
      discount: '20% OFF',
      expiresAt: '2023-09-30',
      merchant: 'Travel Agency',
      description: 'Get 20% off on hotel bookings.',
      claimed: false,
      isRedeemed: false,
      distributionOrder: 5
    },
  ];
  
  // Track last assigned coupon for round-robin distribution
  let lastAssignedIndex = -1;
  
  // Check if the IP has made too many requests
  export const checkRateLimiting = async (ip: string): Promise<boolean> => {
    // In a real implementation, this would check against a database
    // For now, we'll simulate by always returning true (not rate limited)
    return true;
  };
  
  // Validate an email verification token
  export const validateEmailToken = async (token: string): Promise<{ valid: boolean, email?: string }> => {
    // In a real implementation, this would validate a token from the database
    // For demo purposes, we'll just check if the token looks legitimate
    if (token && token.length > 20) {
      // Simulate a valid token
      return { valid: true, email: 'demo@example.com' };
    }
    
    return { valid: false };
  };
  
  // Check if a user has already claimed this coupon campaign
  export const hasUserClaimedCoupon = async (email: string, campaignId: string): Promise<boolean> => {
    // Check if the user has already claimed a coupon
    return coupons.some(coupon => 
      coupon.claimed && 
      coupon.claimedBy?.email === email
    );
  };
  
  // Generate a verification token
  export const generateVerificationToken = (): string => {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('');
  };
  
  // Mock function to simulate email sending for verification
  export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
    console.log(`[MOCK] Sending verification email to ${email} with token ${token}`);
    // In a real implementation, this would send an actual email
    return true;
  };
  
  // Get all available coupons
  export const getAllCoupons = (): Coupon[] => {
    return [...coupons];
  };
  
  // Get the next available coupon for a user (round-robin distribution)
  export const getNextAvailableCoupon = (): Coupon | null => {
    // Find unclaimed coupons
    const unclaimedCoupons = coupons.filter(coupon => !coupon.claimed);
    
    if (unclaimedCoupons.length === 0) {
      return null; // No more coupons available
    }
    
    // Sort by distribution order for round-robin assignment
    unclaimedCoupons.sort((a, b) => a.distributionOrder - b.distributionOrder);
    
    // Get the next coupon in the round-robin sequence
    lastAssignedIndex = (lastAssignedIndex + 1) % unclaimedCoupons.length;
    return unclaimedCoupons[lastAssignedIndex];
  };
  
  // Claim a coupon for a guest user
  export const claimCoupon = (couponId: string, userData: { name: string, email: string }): Coupon | null => {
    const couponIndex = coupons.findIndex(c => c.id === couponId);
    
    if (couponIndex === -1 || coupons[couponIndex].claimed) {
      return null; // Coupon not found or already claimed
    }
    
    // Update the coupon as claimed
    coupons[couponIndex] = {
      ...coupons[couponIndex],
      claimed: true,
      claimedBy: {
        name: userData.name,
        email: userData.email,
        claimedAt: new Date()
      }
    };
    
    return coupons[couponIndex];
  };
  
  // For development - reset all coupons to unclaimed state
  export const resetAllCoupons = (): void => {
    coupons = coupons.map(coupon => ({
      ...coupon,
      claimed: false,
      claimedBy: undefined
    }));
    lastAssignedIndex = -1;
  };
  