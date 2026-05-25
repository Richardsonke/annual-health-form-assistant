import { useFormContext, useWatch } from 'react-hook-form';
import { SignaturePad } from './SignaturePad';
import { FormField } from './FormField';

export const FormSectionSignature = () => {
  const { control } = useFormContext();
  const participantType = useWatch({ control, name: 'participantType' });
  const willSignLater = useWatch({ control, name: 'willSignLater' });
  const willParticipantSignLater = useWatch({ control, name: 'willParticipantSignLater' });
  const showParentConsent = participantType !== 'adult';

  return (
    <div className="form-card">
      <h2 className="section-title">Part A: Consent & Signatures</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        By signing below, you acknowledge and agree to the informed consent, release agreement, and authorization details.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {showParentConsent && (
          <div>
            <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--primary-color)' }}>Parent/Guardian Consent</h3>
            <SignaturePad 
              name="signatureData" 
              willSignLaterName="willSignLater" 
              label="Parent/Guardian Signature" 
              willSignLaterLabel="I will sign with a pen after printing"
            />
            {!willSignLater && (
              <div style={{ marginTop: '1rem', animation: 'fadeInUp 0.2s ease-out' }}>
                <FormField name="parentSignatureDate" label="Date Signed" type="date" disabled={true} />
              </div>
            )}
          </div>
        )}

        {showParentConsent && <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0' }} />}
        
        <div>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--primary-color)' }}>Participant Consent</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            The participant must sign to acknowledge the code of conduct and safety rules.
          </p>
          <SignaturePad 
            name="participantSignatureData" 
            willSignLaterName="willParticipantSignLater" 
            label="Participant's Signature" 
            willSignLaterLabel="Participant will sign with a pen after printing"
          />
          {!willParticipantSignLater && (
            <div style={{ marginTop: '1rem', animation: 'fadeInUp 0.2s ease-out' }}>
              <FormField name="participantSignatureDate" label="Date Signed" type="date" disabled={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
