import React, { useState, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { getPaymentAmount, getPaymentUses } from '../config/appConfig';
import { AuthContext } from '../AuthWrapper';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Debug Stripe configuration
console.log('Stripe publishable key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Present' : 'Missing');

const PaymentForm = ({ onSuccess, onError, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useContext(AuthContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    console.log('Payment form submitted');
    console.log('Stripe available:', !!stripe);
    console.log('Elements available:', !!elements);

    if (!stripe || !elements) {
      console.error('Stripe or Elements not available');
      setError('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('Starting payment process...');
      
      // Create payment intent on your backend
      const response = await fetch('https://us-central1-celebrity-merge.cloudfunctions.net/createPaymentIntent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(getPaymentAmount() * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            userId: user?.uid || 'anonymous',
            userEmail: user?.email || 'unknown',
            paymentUses: getPaymentUses()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      console.log('Payment intent created:', clientSecret);

      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (error) {
        console.log('Payment failed:', error.message);
        setError(error.message);
        onError && onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment successful:', paymentIntent.id);
        
        // Call your backend to update user's usage
        const updateResponse = await fetch('https://us-central1-celebrity-merge.cloudfunctions.net/updateUsage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.uid || 'anonymous',
            paymentIntentId: paymentIntent.id,
            uses: getPaymentUses()
          }),
        });

        if (updateResponse.ok) {
          onSuccess && onSuccess();
        } else {
          throw new Error('Failed to update usage');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
      onError && onError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
      console.log('Payment process completed');
    }
  };

  const handleRetry = () => {
    setError(null);
    // Reset the form
    if (elements) {
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        cardElement.clear();
      }
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Buy {getPaymentUses()} More Uses
        </h3>
        <p className="text-gray-600 mb-4">
          Get {getPaymentUses()} additional image generations for just ${getPaymentAmount()}
        </p>
        <div className="text-2xl font-bold text-indigo-600">
          ${getPaymentAmount()}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Card Information
        </label>
        <div className="p-3 border border-gray-300 rounded-lg bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Payment Failed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
        {error ? (
          <button
            type="button"
            onClick={handleRetry}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Retry Payment
          </button>
        ) : (
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              `Pay $${getPaymentAmount()}`
            )}
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        Secure payment powered by Stripe
      </div>
    </form>
  );
};

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [paymentError, setPaymentError] = useState(null);

  const handleSuccess = () => {
    setPaymentError(null);
    onSuccess && onSuccess();
  };

  const handleError = (error) => {
    setPaymentError(error);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Upgrade Your Usage
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <Elements stripe={stripePromise}>
                  <PaymentForm 
                    onSuccess={handleSuccess}
                    onError={handleError}
                    onClose={onClose}
                  />
                </Elements>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
