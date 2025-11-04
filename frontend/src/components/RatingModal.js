import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import api from '../utils/api';
import '../styles/RatingModal.css';

const RatingModal = ({ open, onClose, courseId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/reviews/${courseId}`, { rating, comment });
      toast.success('Thanks — your review was posted');
      setComment('');
      setRating(5);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rating-modal-backdrop" role="dialog" aria-modal="true">
      <div className="rating-modal">
        <h3 className="rating-modal-title">Rate this course</h3>

        <div className="rating-stars">
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              type="button"
              className={s <= rating ? 'star-btn filled' : 'star-btn'}
              onClick={() => setRating(s)}
              aria-label={`Set rating ${s}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          className="rating-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write an optional comment (helpful feedback)"
          rows={4}
        />

        <div className="rating-actions">
          <button className="btn btn-outline" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

RatingModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  courseId: PropTypes.string,
  onSuccess: PropTypes.func
};

export default RatingModal;
