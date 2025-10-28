import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import '../styles/Payment.css';

const PaymentCancel = () => {
  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-icon cancel">
          <FaTimesCircle />
        </div>
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges have been made to your account.</p>
        <div className="payment-actions">
          <Link to="/courses">
            <button className="btn btn-primary">Browse Courses</button>
          </Link>
          <Link to="/dashboard">
            <button className="btn btn-outline">Go to Dashboard</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;

