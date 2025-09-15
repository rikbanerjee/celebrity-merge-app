#!/bin/bash

echo "🔧 Setting up Stripe Test Keys for Firebase Functions"
echo "=================================================="
echo ""
echo "Please get your test keys from: https://dashboard.stripe.com/test/apikeys"
echo ""
echo "1. Test Secret Key (starts with sk_test_):"
read -p "Enter your Stripe Test Secret Key: " STRIPE_SECRET_KEY
echo ""
echo "2. Test Publishable Key (starts with pk_test_):"
read -p "Enter your Stripe Test Publishable Key: " STRIPE_PUBLISHABLE_KEY
echo ""

# Update Firebase Functions config
echo "📝 Updating Firebase Functions config..."
firebase functions:config:set stripe.secret_key="$STRIPE_SECRET_KEY"

# Update frontend .env file
echo "📝 Updating frontend .env file..."
if [ -f .env ]; then
    # Update existing .env file
    if grep -q "VITE_STRIPE_PUBLISHABLE_KEY" .env; then
        sed -i '' "s/VITE_STRIPE_PUBLISHABLE_KEY=.*/VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY/" .env
    else
        echo "VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY" >> .env
    fi
else
    # Create new .env file
    echo "VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY" > .env
fi

echo ""
echo "✅ Configuration updated!"
echo ""
echo "🚀 Next steps:"
echo "1. Deploy functions: firebase deploy --only functions"
echo "2. Build and deploy frontend: npm run build && firebase deploy --only hosting"
echo ""
echo "💳 Test with these card numbers:"
echo "   Success: 4242 4242 4242 4242"
echo "   Decline: 4000 0000 0000 0002"
echo "   Expiry: 12/25, CVC: 123, ZIP: 12345"
