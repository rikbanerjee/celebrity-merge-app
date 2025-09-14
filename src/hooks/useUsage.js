import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getUsageLimit, getPaymentUses, getWarningThreshold, shouldShowWarning } from '../config/appConfig';

const useUsage = (userId) => {
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseAvailable, setFirebaseAvailable] = useState(true);

  // Load user's usage data
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadUsage = async () => {
      try {
        setLoading(true);
        
        // Test Firestore connection first
        console.log('Testing Firestore connection...');
        const userDoc = doc(db, 'users', userId);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUsageCount(userData.usageCount || 0);
        } else {
          // Create new user document with initial usage count
          await setDoc(userDoc, {
            usageCount: 0,
            createdAt: serverTimestamp(),
            lastUsed: null
          });
          setUsageCount(0);
        }
      } catch (err) {
        console.error('Error loading usage:', err);
        
        // Handle Firebase connection errors gracefully
        if (err.code === 'unavailable' || err.message.includes('offline') || 
            err.message.includes('CORS') || err.message.includes('access control')) {
          console.warn('Firebase connection issue. Using local storage as fallback.');
          setFirebaseAvailable(false);
          // Try to get usage from localStorage as fallback
          const localUsage = localStorage.getItem(`usage_${userId}`);
          if (localUsage) {
            setUsageCount(parseInt(localUsage, 10));
          } else {
            setUsageCount(0);
          }
          setError('Connection issue. Using offline mode.');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUsage();
  }, [userId]);

  // Increment usage count
  const incrementUsage = async () => {
    if (!userId) return false;

    // If Firebase is not available, use localStorage only
    if (!firebaseAvailable) {
      const newCount = usageCount + 1;
      localStorage.setItem(`usage_${userId}`, newCount.toString());
      setUsageCount(newCount);
      return true;
    }

    try {
      const userDoc = doc(db, 'users', userId);
      const newCount = usageCount + 1;
      
      await updateDoc(userDoc, {
        usageCount: newCount,
        lastUsed: serverTimestamp()
      });
      
      setUsageCount(newCount);
      return true;
    } catch (err) {
      console.error('Error incrementing usage:', err);
      
      // Handle Firebase connection errors gracefully
      if (err.code === 'unavailable' || err.message.includes('offline') || 
          err.message.includes('CORS') || err.message.includes('access control')) {
        console.warn('Firebase connection issue. Using local storage as fallback.');
        setFirebaseAvailable(false);
        const newCount = usageCount + 1;
        localStorage.setItem(`usage_${userId}`, newCount.toString());
        setUsageCount(newCount);
        setError('Connection issue. Usage saved locally.');
        return true;
      } else {
        setError(err.message);
        return false;
      }
    }
  };

  // Add payment uses (after payment)
  const addPaymentUses = async () => {
    if (!userId) return false;

    try {
      const userDoc = doc(db, 'users', userId);
      // When buying credits, reset usage to 0 and set limit to payment uses
      // This gives them 0/2 (0 used out of 2 available)
      const newCount = 0;
      
      await updateDoc(userDoc, {
        usageCount: newCount,
        lastUsed: serverTimestamp()
      });
      
      setUsageCount(newCount);
      return true;
    } catch (err) {
      console.error('Error adding payment uses:', err);
      
      // Handle Firebase connection errors gracefully
      if (err.code === 'unavailable' || err.message.includes('offline') || 
          err.message.includes('CORS') || err.message.includes('access control')) {
        console.warn('Firebase connection issue. Using local storage as fallback.');
        const newCount = 0;
        localStorage.setItem(`usage_${userId}`, newCount.toString());
        setUsageCount(newCount);
        setError('Connection issue. Payment uses added locally.');
        return true;
      } else {
        setError(err.message);
        return false;
      }
    }
  };

  // Reset usage count (legacy function - kept for compatibility)
  const resetUsage = async () => {
    return addPaymentUses();
  };

  // Check if user has reached limit
  const hasReachedLimit = () => {
    // Get the effective limit (free limit or payment uses)
    const effectiveLimit = getEffectiveUsageLimit();
    return usageCount >= effectiveLimit;
  };

  // Get remaining uses
  const getRemainingUses = () => {
    // If user has 0 usage and 0 free limit, they have 0 remaining
    if (usageCount === 0 && getUsageLimit() === 0) {
      return 0;
    }
    // If user has paid credits, calculate remaining from payment uses
    if (getUsageLimit() === 0 && usageCount >= 0) {
      return Math.max(0, getPaymentUses() - usageCount);
    }
    // Otherwise, calculate remaining uses
    return Math.max(0, getUsageLimit() - usageCount);
  };

  // Get effective usage limit (considers paid users)
  const getEffectiveUsageLimit = () => {
    // If user has 0 free limit but has usage count, they must have paid
    if (getUsageLimit() === 0 && usageCount >= 0) {
      return getPaymentUses(); // Show payment uses as the limit
    }
    // If user has used more than free limit, they must have paid
    if (usageCount > getUsageLimit()) {
      return usageCount + getRemainingUses();
    }
    return getUsageLimit();
  };

  // Check if user should see warning
  const shouldShowUsageWarning = () => {
    return shouldShowWarning(usageCount);
  };

  // Get usage limit for display
  const getUsageLimitForDisplay = () => {
    return getUsageLimit();
  };

  return {
    usageCount,
    loading,
    error,
    incrementUsage,
    resetUsage,
    addPaymentUses,
    hasReachedLimit,
    getRemainingUses,
    shouldShowUsageWarning,
    getUsageLimitForDisplay,
    getEffectiveUsageLimit
  };
};

export default useUsage;
