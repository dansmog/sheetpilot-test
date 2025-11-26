/**
POST /api/stripe/checkout (Stripe Checkout)
Purpose: Create NEW subscriptions or make plan changes with payment
Used for:

Initial signup - user selecting a plan for the first time
Upgrading plans (Starter → Growth)
Downgrading plans (if payment required)
Adding payment method for the first time

User clicks "Subscribe to Growth Plan"
    ↓
Your API creates checkout session
    ↓
Redirect to Stripe-hosted checkout page
    ↓
User enters payment details
    ↓
User completes payment
    ↓
Redirect back to your app

What it does:

Collects payment information
Processes payment immediately
Creates or updates subscription
Handles 3D Secure authentication
Applies promo codes
Calculates tax

 */
