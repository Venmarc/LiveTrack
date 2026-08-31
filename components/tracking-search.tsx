'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TRACKING_PATTERN = /^LTK-[A-Z0-9]{9}$/;

const EMPTY_ERROR =
  'Enter a tracking number to search. Tracking numbers look like LTK-A1B2C3D4E.';
const FORMAT_ERROR =
  'That number does not match the tracking format. Tracking numbers look like LTK-A1B2C3D4E. Check the number and try again.';
const NOT_FOUND_ERROR =
  'No shipment was found for that tracking number. The number may be mistyped, or the shipment was removed. Try one of the live demo shipments below.';
const NETWORK_ERROR =
  'The tracking service could not be reached. Check the connection and try again.';

type SubmitStatus = 'idle' | 'submitting' | 'not-found' | 'error';

export function TrackingSearch() {
  const [value, setValue] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();

  const submitting = submitStatus === 'submitting';
  const message = fieldError ?? (submitStatus === 'not-found'
    ? NOT_FOUND_ERROR
    : submitStatus === 'error'
      ? NETWORK_ERROR
      : null);

  const normalize = (raw: string) => raw.trim().toUpperCase();

  const handleBlur = () => {
    if (value.trim() === '') return;
    setFieldError(TRACKING_PATTERN.test(normalize(value)) ? null : FORMAT_ERROR);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    if (fieldError) setFieldError(null);
    if (submitStatus !== 'idle') setSubmitStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const candidate = normalize(value);
    if (candidate === '') {
      setFieldError(EMPTY_ERROR);
      return;
    }
    if (!TRACKING_PATTERN.test(candidate)) {
      setFieldError(FORMAT_ERROR);
      return;
    }
    setFieldError(null);
    setSubmitStatus('submitting');
    const { data, error } = await supabase
      .from('shipments')
      .select('tracking_number')
      .eq('tracking_number', candidate)
      .maybeSingle();
    if (error) {
      setSubmitStatus('error');
      return;
    }
    if (!data) {
      setSubmitStatus('not-found');
      return;
    }
    router.push(`/tracking/${candidate}`);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="lt-search">
      <label htmlFor={inputId} className="lt-search-label">
        Tracking number
      </label>
      <div className="lt-search-row">
        <div className="lt-search-field">
          <Search aria-hidden="true" className="lt-search-icon" />
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="LTK-A1B2C3D4E"
            autoComplete="off"
            spellCheck={false}
            className="lt-search-input"
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? errorId : undefined}
          />
        </div>
        <button
          type="submit"
          className="lt-primary-action lt-search-submit"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? <span className="lt-spinner" aria-hidden="true" /> : null}
          <span>{submitting ? 'Checking…' : 'Track shipment'}</span>
        </button>
      </div>
      {message ? (
        <p id={errorId} className="lt-form-error" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
