"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";

// import { useToast } from "@/components/ui/toaster";
import { checkoutCredits } from "@/lib/actions/transaction.action";

import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) => {
  const { toast } = useToast();

  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }, []);

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast({
        title: "Order placed!",
        description: "You will receive an email confirmation",
        duration: 5000,
        className: "success-toast",
      });
    }

    if (query.get("canceled")) {
      toast({
        title: "Order canceled!",
        description: "Continue to shop around and checkout when you're ready",
        duration: 5000,
        className: "error-toast",
      });
    }
  }, []);

  const onCheckout = async () => {
    const transaction = {
      plan,
      amount,
      credits,
      buyerId,
    };

    await checkoutCredits(transaction);
  };

  return (
    <form onSubmit={async (e) => {
        e.preventDefault();
        await onCheckout();
    }}>
      <section>
        <Button
          type="submit"
          role="link"
          variant="outline"
          className="credits-btn"
        >
          Buy Credit
        </Button>
      </section>
    </form>
  );
};

export default Checkout;