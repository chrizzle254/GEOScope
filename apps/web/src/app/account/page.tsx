'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeCardElementChangeEvent } from '@stripe/stripe-js';
import { toast } from 'sonner';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontFamily: '"Roboto Mono", monospace',
      fontSize: '14px',
      color: '#1E1E1E',
      '::placeholder': {
        color: 'rgba(117, 117, 117, 0.6)',
      },
    },
    invalid: {
      color: '#1E1E1E',
    },
  },
};

export default function AccountPage() {
  return (
    <Elements stripe={stripePromise}>
      <BillingForm />
    </Elements>
  );
}

function BillingForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cardFocused, setCardFocused] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function handleCardChange(e: StripeCardElementChangeEvent) {
    setCardComplete(e.complete);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe is not initialised. Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.');
      return;
    }

    if (!cardComplete) {
      toast.error('Please complete the card details.');
      return;
    }

    setIsSaving(true);
    try {
      // Stub: payment method creation would go here before calling the billing API.
      await new Promise((r) => setTimeout(r, 600));
      toast.success('Details saved.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex max-w-xl flex-col gap-8">
      <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
        Do you take it seriously?
      </h2>

      {/* Credit card */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Credit card
        </label>
        <div
          className={`flex h-12 w-full items-center border-4 bg-background px-4 transition-colors ${
            cardFocused ? 'border-foreground' : 'border-input'
          }`}
        >
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            className="w-full"
            onChange={handleCardChange}
            onFocus={() => setCardFocused(true)}
            onBlur={() => setCardFocused(false)}
          />
        </div>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="name"
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Name on card"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 w-full border-4 border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-foreground"
        />
      </div>

      {/* Address */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="address"
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Address
        </label>
        <input
          id="address"
          type="text"
          autoComplete="street-address"
          placeholder="Billing address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="h-12 w-full border-4 border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-foreground"
        />
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground">
        You won&apos;t be charged anything. We just want to verify that you are not spamming.
      </p>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="border-4 border-foreground bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-widest text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border-4 border-border px-6 py-3 text-sm font-bold uppercase tracking-widest text-foreground transition-colors hover:border-foreground"
        >
          Back
        </button>
      </div>
    </form>
  );
}
