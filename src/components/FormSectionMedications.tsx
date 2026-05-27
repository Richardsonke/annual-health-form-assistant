import { useEffect } from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { FormField } from './FormField';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
export const FormSectionMedications = () => {
  const { register, control, setValue, trigger, formState: { errors, isSubmitted } } = useFormContext();
  
  const isNoMeds = useWatch({ name: 'noMedications' });
  const isNonPrescExceptions = useWatch({ name: 'nonPrescriptionExceptions' });
  const participantType = useWatch({ control, name: 'participantType' });
  const showMedsSignature = participantType !== 'adult';
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications"
  });

  const medicationsVal = useWatch({ control, name: 'medications' });

  // Re-trigger validation on 'noMedications' when medications change after form submission
  useEffect(() => {
    if (isSubmitted) {
      trigger('noMedications');
    }
  }, [medicationsVal, trigger, isSubmitted]);
  return (
    <div className="form-card">
      <h2 className="section-title">Medications</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <label className="checkbox-group">
          <input 
            type="checkbox" 
            className="checkbox-input" 
            {...register('noMedications', {
              onChange: (e) => {
                setValue('noMedications', e.target.checked, { shouldDirty: true, shouldValidate: true });
              }
            })} 
          />
          <span style={{ fontWeight: 500 }}>Participant takes NO medications</span>
        </label>
        {errors.noMedications && (
          <span className="error-message">
            <AlertCircle size={16} />
            {errors.noMedications.message?.toString()}
          </span>
        )}
      </div>

      {isNoMeds ? (
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: 'var(--background-color)', 
          borderRadius: 'var(--radius-md)', 
          border: '1px dashed var(--border-color)', 
          color: 'var(--text-muted)', 
          textAlign: 'center',
          marginBottom: '2rem',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          Participant is marked as taking no medications. Uncheck the option above to add medications.
        </div>
      ) : (
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.3s ease-out' }}>
          {fields.length === 0 ? (
            <div style={{ 
              padding: '2rem', 
              backgroundColor: 'var(--background-color)', 
              borderRadius: 'var(--radius-md)', 
              border: '2px dashed var(--border-color)', 
              textAlign: 'center', 
              color: 'var(--text-muted)',
              marginBottom: '1rem'
            }}>
              No medications added yet. Click "Add Medication" below to document a medication.
            </div>
          ) : (
            <table className="form-table table-responsive-medications" style={{ marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Medication</th>
                  <th style={{ width: '15%' }}>Dose</th>
                  <th style={{ width: '20%' }}>Frequency</th>
                  <th style={{ width: '25%' }}>Reason</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-med-name">
                      <FormField 
                        name={`medications.${index}.medication`} 
                        placeholder="Medication name" 
                        containerClass="form-table-group"
                      />
                    </td>
                    <td className="col-med-dose">
                      <FormField 
                        name={`medications.${index}.dose`} 
                        placeholder="Dose" 
                        containerClass="form-table-group"
                      />
                    </td>
                    <td className="col-med-freq">
                      <FormField 
                        name={`medications.${index}.frequency`} 
                        placeholder="Frequency" 
                        containerClass="form-table-group"
                      />
                    </td>
                    <td className="col-med-reason">
                      <FormField 
                        name={`medications.${index}.reason`} 
                        placeholder="Reason" 
                        containerClass="form-table-group"
                      />
                    </td>
                    <td className="col-med-action text-center">
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => remove(index)}
                        title="Remove medication"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => append({ medication: '', dose: '', frequency: '', reason: '' })}
              disabled={fields.length >= 6}
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            >
              <Plus size={18} />
              {fields.length >= 6 ? 'Maximum Limit Reached (6)' : 'Add Medication'}
            </button>
            <label className="checkbox-group">
              <input type="checkbox" className="checkbox-input" {...register('medicationsAdditionalSpace')} />
              <span>Additional space is needed (use extra sheet)</span>
            </label>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <span style={{ fontWeight: 600 }}>Non-prescription medication administration is authorized:</span>
          {errors.nonPrescriptionExceptions && (
            <span style={{ color: 'var(--error-color)', fontSize: '0.8rem', marginTop: '-0.25rem', display: 'block' }}>
              {errors.nonPrescriptionExceptions.message?.toString()}
            </span>
          )}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                className="checkbox-input" 
                checked={isNonPrescExceptions === true} 
                onChange={() => setValue('nonPrescriptionExceptions', isNonPrescExceptions === true ? undefined : true, { shouldDirty: true, shouldValidate: true })} 
              />
              Yes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                className="checkbox-input" 
                checked={isNonPrescExceptions === false} 
                onChange={() => setValue('nonPrescriptionExceptions', isNonPrescExceptions === false ? undefined : false, { shouldDirty: true, shouldValidate: true })} 
              />
              No
            </label>
          </div>
        </div>
      </div>

      {/* Exceptions and signature box, rendered only if Yes is selected */}
      {isNonPrescExceptions === true && (
        <div style={{ marginTop: '1.5rem', animation: 'fadeInUp 0.3s ease-out' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary-color)' }}>Non-prescription Medication Exceptions (optional)</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              List any non-prescription medications that are NOT authorized (exceptions):
            </p>
            <FormField 
              name="nonPrescriptionExceptionsText" 
              placeholder="List exceptions (e.g. Tylenol, Ibuprofen as directed)" 
              containerClass="form-group"
            />
          </div>

          {showMedsSignature && (
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary-color)' }}>Medications Consent & Authorization</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                I hereby authorize healthcare providers or Scouting America leaders to administer these medications to the participant.
              </p>
              <SignaturePad 
                name="medicationsSignature" 
                willSignLaterName="willSignMedsLater" 
                label="Parent/Guardian Medications Authorization Signature" 
                willSignLaterLabel="I will sign the medications authorization with a pen after printing"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
