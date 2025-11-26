/**

POST /api/stripe/portal (Stripe Customer Portal)

Purpose: Self-service billing management for EXISTING customers

Used for:

Viewing invoice history
Downloading receipts
Updating payment method (card expired)
Canceling subscription
Viewing upcoming charges
Managing billing information

User Experience:
User clicks "Manage Billing" in dashboard
↓
Your API creates portal session
↓
Redirect to Stripe-hosted portal page
↓
User manages their subscription
↓
Redirect back to your app

What it does:

Shows all past invoices
Allows card updates without new payment
Shows current subscription details
Handles cancellations
No new payment collection (unless updating card)

 */
