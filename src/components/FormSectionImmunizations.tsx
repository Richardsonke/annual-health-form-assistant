import { useFormContext, useWatch } from 'react-hook-form';
import { FormField } from './FormField';

interface ImmRowProps {
  name: string;
  label: string;
  dateName?: string;
  hadDiseaseName?: string;
  extraTriggerFields?: string[];
}

const ImmRow: React.FC<ImmRowProps> = ({ 
  name, 
  label, 
  dateName, 
  hadDiseaseName,
  extraTriggerFields
}) => {
  const isChecked = useWatch({ name });
  const { setValue, formState: { errors }, trigger, register } = useFormContext();
  const hasError = !!(errors as any)[name];
  const errorMsg: string | undefined = (errors as any)[name]?.message;
  const hasDateError = dateName ? !!(errors as any)[dateName] : false;
  const dateErrorMsg = dateName ? (errors as any)[dateName]?.message : undefined;

  const handleYesChange = () => {
    setValue(name, isChecked === true ? undefined : true, { shouldDirty: true, shouldValidate: true });
    if (extraTriggerFields?.length) trigger(extraTriggerFields as any);
  };

  const handleNoChange = () => {
    setValue(name, isChecked === false ? undefined : false, { shouldDirty: true, shouldValidate: true });
    if (extraTriggerFields?.length) trigger(extraTriggerFields as any);
  };

  return (
    <tr>
      <td className={`col-yes text-center${hasError ? ' row-required-error' : ''}`} style={{ width: '60px' }}>
        <label 
          title="Has been immunized"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer' }}
        >
          <input 
            type="checkbox" 
            className="checkbox-input" 
            checked={isChecked === true} 
            onChange={handleYesChange} 
          />
        </label>
      </td>
      <td className={`col-no text-center${hasError ? ' row-required-error' : ''}`} style={{ width: '60px' }}>
        <label 
          title="Has not been immunized"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer' }}
        >
          <input 
            type="checkbox" 
            className="checkbox-input" 
            checked={isChecked === false} 
            onChange={handleNoChange} 
          />
        </label>
      </td>
      <td className="col-label" style={{ fontWeight: 500, width: '30%' }}>
        {label}
        {hasError && errorMsg && (
          <span style={{ display: 'block', color: 'var(--error-color)', fontSize: '0.8rem', fontWeight: 400, marginTop: '0.25rem' }}>
            {errorMsg}
          </span>
        )}
      </td>
      <td className="col-details" style={{ width: '30%' }}>
        {dateName && (
          <div>
            <input
              type="text"
              placeholder="Immunization Date(s)"
              className={`form-input form-table-group${hasDateError ? ' error' : ''}`}
              style={{ padding: '0.4rem 0.75rem' }}
              disabled={isChecked !== true}
              {...register(dateName)}
            />
            {hasDateError && (
              <span style={{ color: 'var(--error-color)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                {dateErrorMsg}
              </span>
            )}
          </div>
        )}
      </td>
      <td className="col-details" style={{ width: '30%' }}>
        {hadDiseaseName ? (
          <FormField name={hadDiseaseName} placeholder="Had Disease (Year)" containerClass="form-table-group" />
        ) : (
          <div style={{ background: 'var(--border-color)', height: '42px', borderRadius: 'var(--radius-md)', opacity: 0.25 }}></div>
        )}
      </td>
    </tr>
  );
};

export const FormSectionImmunizations = () => {
  return (
    <div className="form-card">
      <h2 className="section-title">Immunizations</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
        The following immunizations are recommended. Tetanus immunization is required and must have been received within the last 10 years. If you had the disease, check the disease column and list the date. If immunized, check yes and provide the year received.
      </p>
      
      <table className="form-table table-responsive-yesno">
        <thead>
          <tr>
            <th style={{ width: '60px', textAlign: 'center' }}>Yes</th>
            <th style={{ width: '60px', textAlign: 'center' }}>No</th>
            <th>Immunization</th>
            <th>Date(s)</th>
            <th>Had Disease (Year)</th>
          </tr>
        </thead>
        <tbody>
          <ImmRow name="immTetanus" label="Tetanus" dateName="immTetanusDate" hadDiseaseName="hadTetanus" />
          <ImmRow name="immPertussis" label="Pertussis" dateName="immPertussisDate" hadDiseaseName="hadPertussis" />
          <ImmRow name="immDiphtheria" label="Diphtheria" dateName="immDiphtheriaDate" hadDiseaseName="hadDiphtheria" />
          <ImmRow name="immMMR" label="Measles/mumps/rubella" dateName="immMMRDate" hadDiseaseName="hadMMR" />
          <ImmRow name="immPolio" label="Polio" dateName="immPolioDate" hadDiseaseName="hadPolio" />
          <ImmRow name="immChickenPox" label="Chicken Pox" dateName="immChickenPoxDate" hadDiseaseName="hadChickenPox" />
          <ImmRow name="immHepA" label="Hepatitis A" dateName="immHepADate" hadDiseaseName="hadHepA" />
          <ImmRow name="immHepB" label="Hepatitis B" dateName="immHepBDate" hadDiseaseName="hadHepB" />
          <ImmRow name="immMeningitis" label="Meningitis" dateName="immMeningitisDate" hadDiseaseName="hadMeningitis" />
          <ImmRow name="immInfluenza" label="Influenza" dateName="immInfluenzaDate" hadDiseaseName="hadInfluenza" />
          <ImmRow name="immOther" label="Other (i.e. HIB)" dateName="immOtherDate" hadDiseaseName="hadOther" />
          <ImmRow name="exemptionToImmunizations" label="Exemption to immunizations (form required)" dateName="immOtherExemptionDate" hadDiseaseName="immOtherExemption" extraTriggerFields={['immTetanus', 'immTetanusDate']} />
        </tbody>
      </table>
    </div>
  );
};
