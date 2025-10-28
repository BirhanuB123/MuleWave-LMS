import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/Payment.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    processPayment();
  }, []);

  const processPayment = async () => {
    const paymentId = searchParams.get('paymentId');
    const PayerID = searchParams.get('PayerID');
    const paymentDbId = searchParams.get('paymentDbId');

    if (paymentId && PayerID && paymentDbId) {
      try {
        await api.post('/payments/execute', {
          paymentId,
          PayerID,
          paymentDbId
        });
        toast.success('Payment successful! You can now access the course.');
      } catch (error) {
        console.error('Payment execution error:', error);
        toast.error('Payment processing failed');
      }
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-icon success">
          <FaCheckCircle />
        </div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. You can now access your course.</p>
        <div className="payment-actions">
          <Link to="/my-courses">
            <button className="btn btn-primary">Go to My Courses</button>
          </Link>
          <Link to="/courses">
            <button className="btn btn-outline">Browse More Courses</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

