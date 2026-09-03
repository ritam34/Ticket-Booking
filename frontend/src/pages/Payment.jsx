import React, { useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { paymentService, bookingService } from '../services';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payment() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [expiredWarning, setExpiredWarning] = useState(false);
  const lockExpiresInSeconds = location.state?.lockExpiresInSeconds || 300;
  const [changingReleasing, setChangingReleasing] = useState(false);

  // Explicit action instead of releasing on unmount — unmount-based cleanup is
  // unreliable here because React 18 StrictMode intentionally mounts→unmounts→
  // remounts every component once in development, which fired a real release
  // call against the server before the user ever clicked anything. Truly
  // abandoned bookings (tab closed, etc.) are still caught by the 10-minute
  // server-side auto-expiry — see bookingExpiry.js.
  const handleChangeSeats = async () => {
    setChangingReleasing(true);
    try {
      await bookingService.release(bookingId);
    } catch {
      // fine either way — if it's already expired/confirmed, there's nothing to release
    }
    navigate('/');
  };

  // The reservation window closing doesn't block payment anymore — if you pay
  // after this, the backend still confirms your seats as long as no one else
  // took them in the meantime (and refunds you automatically if they did).
  // This is just an honest heads-up that you're now racing other shoppers.
  const handleExpire = useCallback(() => {
    setExpiredWarning(true);
  }, []);

  const handlePay = async () => {
    setError('');
    setProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Could not load the payment gateway. Check your connection and try again.');
        setProcessing(false);
        return;
      }

      const { orderId, amount, currency, keyId } = await paymentService.createOrder(bookingId);

      const razorpay = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount,
        currency,
        name: 'RailBook',
        description: 'Train ticket booking',
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#0F1F38' },
        handler: async (response) => {
          try {
            const result = await paymentService.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            });
            navigate(`/confirmation/${bookingId}`, { state: { pnr: result.pnr } });
          } catch (err) {
            const message = err.response?.data?.message;
            if (err.response?.status === 409) {
              // Seats were taken by someone else while paying — backend already
              // auto-refunded. This is a real outcome, not a bug, so say so plainly.
              setError(message);
            } else {
              setError(message || 'Payment could not be verified. Contact support if you were charged.');
            }
          }
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      });

      razorpay.on('payment.failed', () => {
        setError('Payment failed. Please try again.');
        setProcessing(false);
      });

      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start payment.');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-rail-night mb-2">Complete payment</h1>
      <div className="mb-8">
        <CountdownTimer seconds={lockExpiresInSeconds} onExpire={handleExpire} />
      </div>

      {expiredWarning && !error && (
        <div className="mb-6 text-sm text-rail-amberdark bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 text-left">
          Your reservation window closed. You can still pay — if someone else books these seats first, you'll be refunded automatically.
        </div>
      )}

      {error && (
        <div className="mb-6 text-sm text-rail-alert bg-red-50 border border-red-200 rounded-sm px-3 py-2 text-left">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={processing}
        className="w-full bg-rail-amber text-rail-night rounded-sm py-3 font-medium hover:bg-rail-amberdark disabled:opacity-50"
      >
        {processing ? 'Opening payment…' : 'Pay now with Razorpay'}
      </button>

      <p className="text-xs text-rail-muted mt-4">
        You'll be redirected to Razorpay's secure checkout. Test mode: use card 4111 1111 1111 1111 with any future expiry and CVV.
      </p>

      <button
        onClick={handleChangeSeats}
        disabled={changingReleasing}
        className="w-full mt-4 text-sm text-rail-muted underline"
      >
        {changingReleasing ? 'Releasing…' : "Change seats / cancel this booking"}
      </button>
    </div>
  );
}