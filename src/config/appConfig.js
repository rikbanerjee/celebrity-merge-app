// Application Configuration
// Centralized configuration for easy management

export const APP_CONFIG = {
  // Usage limits
  USAGE: {
    FREE_LIMIT: 0,           // Free usage limit
    PAYMENT_AMOUNT: 0.99,    // Cost for additional uses
    PAYMENT_USES: 2,         // Number of uses after payment
    WARNING_THRESHOLD: 1,    // Show warning at this usage count
  },

  // Stripe configuration
  STRIPE: {
    CURRENCY: 'usd',
    DESCRIPTION: 'Additional image generations',
  },

  // UI Configuration
  UI: {
    SHOW_USAGE_WARNING: true,    // Show warning when approaching limit
    ENABLE_PAYMENT_MODAL: true,  // Enable payment functionality
    SHOW_OFFLINE_MODE: true,     // Show offline mode indicator
  },

  // API Configuration
  API: {
    TIMEOUT: 60000,              // 60 seconds timeout
    RETRY_ATTEMPTS: 3,           // Number of retry attempts
    RATE_LIMIT_DELAY: 5000,      // Delay between retries (ms)
  },

  // Firebase Configuration
  FIREBASE: {
    ENABLE_OFFLINE_MODE: true,   // Enable localStorage fallback
    SYNC_INTERVAL: 30000,        // Sync interval when offline (ms)
  }
};

// Helper functions for configuration
export const getUsageLimit = () => APP_CONFIG.USAGE.FREE_LIMIT;
export const getPaymentAmount = () => APP_CONFIG.USAGE.PAYMENT_AMOUNT;
export const getPaymentUses = () => APP_CONFIG.USAGE.PAYMENT_USES;
export const getWarningThreshold = () => APP_CONFIG.USAGE.WARNING_THRESHOLD;
export const shouldShowWarning = (currentUsage) => 
  APP_CONFIG.UI.SHOW_USAGE_WARNING && currentUsage >= getWarningThreshold();

// Configuration validation
export const validateConfig = () => {
  const errors = [];
  
  if (APP_CONFIG.USAGE.FREE_LIMIT < 1) {
    errors.push('FREE_LIMIT must be at least 1');
  }
  
  if (APP_CONFIG.USAGE.PAYMENT_AMOUNT <= 0) {
    errors.push('PAYMENT_AMOUNT must be greater than 0');
  }
  
  if (APP_CONFIG.USAGE.PAYMENT_USES < 1) {
    errors.push('PAYMENT_USES must be at least 1');
  }
  
  if (APP_CONFIG.USAGE.WARNING_THRESHOLD >= APP_CONFIG.USAGE.FREE_LIMIT) {
    errors.push('WARNING_THRESHOLD must be less than FREE_LIMIT');
  }
  
  return errors;
};

// Log configuration on load
console.log('App Configuration loaded:', APP_CONFIG);
const configErrors = validateConfig();
if (configErrors.length > 0) {
  console.warn('Configuration validation errors:', configErrors);
}
