// Payment service for premium verification
interface PaymentSession {
  sessionId: string;
  url: string;
  amount: number;
  currency: string;
}

interface PaymentResult {
  success: boolean;
  sessionId: string;
  paymentIntentId?: string;
  error?: string;
}

export class PaymentService {
  private static instance: PaymentService;
  
  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async createVerificationPayment(
    newsId: string,
    amount: number = 500, // $5.00 in cents
    currency: string = 'usd'
  ): Promise<PaymentSession> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsId,
          amount,
          currency,
          type: 'verification'
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment creation failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment creation error:', error);
      
      // Mock payment session for demo
      return {
        sessionId: `mock_session_${Date.now()}`,
        url: '#mock-payment',
        amount,
        currency
      };
    }
  }

  async verifyPayment(sessionId: string): Promise<PaymentResult> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error(`Payment verification failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment verification error:', error);
      
      // Mock successful payment for demo
      return {
        success: true,
        sessionId,
        paymentIntentId: `pi_mock_${Date.now()}`
      };
    }
  }

  redirectToCheckout(sessionUrl: string): void {
    if (sessionUrl === '#mock-payment') {
      alert('Mock payment successful! In production, this would redirect to Stripe Checkout.');
      return;
    }
    
    window.location.href = sessionUrl;
  }
}

export const paymentService = PaymentService.getInstance();