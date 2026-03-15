import React, { useState } from 'react';
import styles from './NewsletterSignup.module.css';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className={styles.wrap}>
        <div className={styles.success}>
          <span className={styles.checkmark}>✓</span>
          <div>
            <strong>You're in!</strong>
            <p>We'll send you working codes every Monday morning.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <strong>Get codes every Monday</strong>
          <p>Working promo codes for all 8 games — delivered weekly, free.</p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Get Free Codes →
          </button>
        </form>
      </div>
    </div>
  );
}
