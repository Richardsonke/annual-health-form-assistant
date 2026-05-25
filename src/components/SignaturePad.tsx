import React, { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useFormContext } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

interface SignaturePadProps {
  name: string;
  willSignLaterName?: string;
  label: string;
  willSignLaterLabel?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  name,
  willSignLaterName,
  label,
  willSignLaterLabel = "I will sign with a pen after printing"
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  
  const willSignLater = willSignLaterName ? watch(willSignLaterName) : false;
  const currentValue = watch(name) as string | undefined;
  const error = errors[name];

  // Draw pre-loaded signature data onto the canvas when the stored value changes
  // (e.g. when test data is loaded via the Load Test Data button)
  useEffect(() => {
    if (!sigCanvas.current || willSignLater) return;
    if (currentValue && currentValue.startsWith('data:')) {
      sigCanvas.current.fromDataURL(currentValue);
    } else {
      sigCanvas.current.clear();
    }
  }, [currentValue, willSignLater]);

  const handleEnd = () => {
    if (sigCanvas.current) {
      setValue(name, sigCanvas.current.toDataURL('image/png'), { shouldValidate: true });
    }
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setValue(name, '', { shouldValidate: true });
    }
  };

  // Register the hidden field manually
  useEffect(() => {
    register(name);
  }, [register, name]);

  const hasValue = !!(currentValue && currentValue.startsWith('data:'));

  return (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <label className="form-label" style={{ fontWeight: 600 }}>{label}</label>

      {willSignLaterName && (
        <label className="checkbox-group" style={{ marginBottom: '1rem' }}>
          <input 
            type="checkbox" 
            className="checkbox-input"
            {...register(willSignLaterName)}
            onChange={(e) => {
              setValue(willSignLaterName, e.target.checked);
              if (e.target.checked) clearSignature();
            }}
          />
          <span>{willSignLaterLabel}</span>
        </label>
      )}

      {!willSignLater && (
        <>
          <div
            className={`signature-container ${error && !hasValue ? 'error' : ''}`}
            style={error && !hasValue
              ? { borderColor: 'var(--error-color)', display: 'block' }
              : { display: 'block' }
            }
          >
            <SignatureCanvas 
              ref={sigCanvas}
              onEnd={handleEnd}
              penColor="black"
              canvasProps={{
                className: 'sigCanvas',
                style: { width: '100%', height: '75px', cursor: 'crosshair', display: 'block' }
              }}
            />
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={clearSignature} 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
          >
            Clear Signature
          </button>
        </>
      )}

      {error && !willSignLater && (
        <span className="error-message">
          <AlertCircle size={16} />
          {error.message?.toString()}
        </span>
      )}
    </div>
  );
};
