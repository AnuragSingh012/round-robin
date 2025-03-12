// Utilities for preventing abuse in the coupon system

import { toast } from "sonner";

// Track IP addresses and their last claim time
type IPRecord = {
  lastClaimTime: number;
  attempts: number;
};

const ipRecords: Record<string, IPRecord> = {};
const RESTRICTION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const RATE_LIMIT_DURATION = 10 * 1000; // 10 seconds for rate limiting
const MAX_ATTEMPTS = 5; // Maximum number of attempts before rate limiting

// Check if a user is restricted from claiming
export const isUserRestricted = (): boolean => {
  // Check cookie restriction
  if (document.cookie.includes('coupon_claimed=true')) {
    return true;
  }
  
  // Get user IP (in a real app, this would come from the server)
  const userIP = getUserIP();
  
  // Check IP restriction
  if (ipRecords[userIP]) {
    const timeSinceClaim = Date.now() - ipRecords[userIP].lastClaimTime;
    if (timeSinceClaim < RESTRICTION_DURATION) {
      return true;
    }
  }
  
  return false;
};

// Get time remaining in restriction period
export const getRestrictionTimeRemaining = (): number => {
  const userIP = getUserIP();
  
  if (ipRecords[userIP]) {
    const timeSinceClaim = Date.now() - ipRecords[userIP].lastClaimTime;
    if (timeSinceClaim < RESTRICTION_DURATION) {
      return RESTRICTION_DURATION - timeSinceClaim;
    }
  }
  
  return 0;
};

// Track a claim attempt
export const trackClaimAttempt = (): boolean => {
  const userIP = getUserIP();
  
  // Initialize IP record if it doesn't exist
  if (!ipRecords[userIP]) {
    ipRecords[userIP] = { lastClaimTime: 0, attempts: 0 };
  }
  
  // Check for rate limiting
  const record = ipRecords[userIP];
  const currentTime = Date.now();
  
  // Reset attempts if sufficient time has passed
  if (currentTime - record.lastClaimTime > RATE_LIMIT_DURATION) {
    record.attempts = 0;
  }
  
  // Increment attempts
  record.attempts += 1;
  
  // Apply rate limiting if too many attempts
  if (record.attempts > MAX_ATTEMPTS) {
    toast.error("Too many attempts. Please try again later.");
    return false;
  }
  
  return true;
};

// Record a successful claim
export const recordSuccessfulClaim = (): void => {
  const userIP = getUserIP();
  
  // Update IP record
  ipRecords[userIP] = {
    lastClaimTime: Date.now(),
    attempts: 0,
  };
  
  // Set a cookie to track the claim
  setCouponClaimedCookie();
};

// Mock function to get user IP (in a real app, this would be server-side)
const getUserIP = (): string => {
  // For demo purposes, generate a fixed IP based on browser fingerprint
  const userAgent = navigator.userAgent;
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    hash = ((hash << 5) - hash) + userAgent.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Generate a fake IP for demonstration
  return `192.168.1.${Math.abs(hash) % 255}`;
};

// Set a cookie to track that a user has claimed a coupon
const setCouponClaimedCookie = (): void => {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + RESTRICTION_DURATION);
  document.cookie = `coupon_claimed=true; expires=${expiryDate.toUTCString()}; path=/`;
};

// Check if we should clear the cookie restriction
export const checkAndClearCookieRestriction = (): void => {
  if (document.cookie.includes('coupon_claimed=true')) {
    // Check if the IP restriction is also still valid
    const userIP = getUserIP();
    if (ipRecords[userIP]) {
      const timeSinceClaim = Date.now() - ipRecords[userIP].lastClaimTime;
      if (timeSinceClaim >= RESTRICTION_DURATION) {
        // Clear the cookie if the restriction period is over
        document.cookie = 'coupon_claimed=true; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } else {
      // Clear the cookie if there's no IP record
      document.cookie = 'coupon_claimed=true; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }
};
