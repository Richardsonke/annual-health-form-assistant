import { useFormContext, useWatch } from 'react-hook-form';
import { FormField } from './FormField';

export const FormSectionImmunizations = () => {
  const { setValue } = useFormContext();

  const ImmRow = ({ 
    name, 
    label, 
    dateName, 
    hadDiseaseName 
  }: { 
    name: string, 
    label: string, 
    dateName?: string, 
    hadDiseaseName?: string 
  }) => {
    const isChecked = useWatch({ name });
    const { formState: { errors } } = useFormContext();
    const hasError = !!(errors as any)[name];

    const handleYesChange = () => {
      setValue(name, isChecked === true ? undefined : true, { shouldDirty: true });
    };

    const handleNoChange = () => {
      setValue(name, isChecked === false ? undefined : false, { shouldDirty: true });
    };

    return (
      <tr>
        <td className={`text-center${hasError ? ' row-required-error' : ''}`} style={{ width: '60px' }}>
          <input 
            type="checkbox" 
            className="checkbox-input" 
            checked={isChecked === true} 
            onChange={handleYesChange} 
          />
        </td>
        <td className={`text-center${hasError ? ' row-required-error' : ''}`} style={{ width: '60px' }}>
          <input 
            type="checkbox" 
            className="checkbox-input" 
            checked={isChecked === false} 
            onChange={handleNoChange} 
          />
        </td>
        <td style={{ fontWeight: 500, width: '30%' }}>{label}</td>
        <td style={{ width: '30%' }}>
          {dateName && isChecked === true ? (
            <FormField name={dateName} type="date" containerClass="form-table-group" />
          ) : (
            <div style={{ background: 'var(--border-color)', height: '42px', borderRadius: 'var(--radius-md)', opacity: 0.25 }}></div>
          )}
        </td>
        <td style={{ width: '30%' }}>
          {hadDiseaseName && isChecked === true ? (
            <FormField name={hadDiseaseName} placeholder="Detail / Year" containerClass="form-table-group" />
          ) : (
            <div style={{ background: 'var(--border-color)', height: '42px', borderRadius: 'var(--radius-md)', opacity: 0.25 }}></div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="form-card">
      <h2 className="section-title">Immunizations</h2>
      
      <table className="form-table">
        <thead>
          <tr>
            <th style={{ width: '60px', textAlign: 'center' }}>Yes</th>
            <th style={{ width: '60px', textAlign: 'center' }}>No</th>
            <th>Immunization</th>
            <th>Date (MM/DD/YYYY)</th>
            <th>Had Disease (Details)</th>
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
          <ImmRow name="exemptionToImmunizations" label="Exemption to immunizations (form required)" dateName="immOtherExemptionDate" hadDiseaseName="immOtherExemption" />
        </tbody>
      </table>
    </div>
  );
};
