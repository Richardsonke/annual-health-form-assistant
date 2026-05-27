import { useFormContext, useWatch } from 'react-hook-form';
import { FormField } from './FormField';
import { AlertCircle } from 'lucide-react';

interface ConditionRowProps {
  name: string;
  label: string;
  expName?: string;
  dateName?: string;
  datePlaceholder?: string;
  extraContent?: React.ReactNode;
}

const ConditionRow: React.FC<ConditionRowProps> = ({
  name,
  label,
  expName,
  dateName,
  datePlaceholder,
  extraContent
}) => {
  const isChecked = useWatch({ name });
  const { setValue, formState: { errors } } = useFormContext();
  const hasError = !!(errors as any)[name];

  const handleYesChange = () => {
    setValue(name, isChecked === true ? undefined : true, { shouldDirty: true, shouldValidate: true });
  };

  const handleNoChange = () => {
    setValue(name, isChecked === false ? undefined : false, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <tr>
      <td className={`col-yes text-center${hasError ? ' row-required-error' : ''}`} style={{ width: '60px' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer' }}>
          <input
            type="checkbox"
            className="checkbox-input"
            checked={isChecked === true}
            onChange={handleYesChange}
          />
        </label>
      </td>
      <td className={`col-no text-center${hasError ? ' row-required-error' : ''}`} style={{ width: '60px' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer' }}>
          <input
            type="checkbox"
            className="checkbox-input"
            checked={isChecked === false}
            onChange={handleNoChange}
          />
        </label>
      </td>
      <td className="col-label" style={{ fontWeight: 500, width: '40%' }}>{label}</td>
      <td className="col-details">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {dateName && isChecked === true && (
            <FormField
              name={dateName}
              placeholder={datePlaceholder || "Date/Result"}
              containerClass="form-table-group"
            />
          )}
          {expName && isChecked === true && (
            <FormField
              name={expName}
              placeholder={`Explain...`}
              containerClass="form-table-group"
            />
          )}
          {extraContent && isChecked === true && extraContent}
        </div>
      </td>
    </tr>
  );
};

export const FormSectionPartB = () => {
  const { setValue, formState: { errors } } = useFormContext();
  const isInsulinChecked = useWatch({ name: 'condInsulin' });
  const isCPAPChecked = useWatch({ name: 'condCPAP' });

  return (
    <div className="form-card">
      <h2 className="section-title">Part B: Health History</h2>

      <h3 className="section-title" style={{ fontSize: '1.2rem', marginTop: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
        Physical Guidelines
      </h3>
      <div className="form-grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label">Height</label>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <FormField name="heightFt" type="number" placeholder="Ft" containerClass="" showErrorMsg={false} />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>Feet</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <FormField name="heightIn" type="number" placeholder="In" containerClass="" showErrorMsg={false} />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>Inches</span>
            </div>
          </div>
          {(errors.heightFt || errors.heightIn) && (
            <span className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
              <AlertCircle size={16} />
              {errors.heightFt?.message?.toString() || errors.heightIn?.message?.toString()}
            </span>
          )}
        </div>
        <FormField name="weight" label="Weight (lbs)" type="number" placeholder="e.g., 150" />
      </div>

      <h3 className="section-title" style={{ fontSize: '1.2rem', marginTop: '2rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
        Allergies / Medical Alerts
      </h3>
      <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        Are you allergic to or do you have any adverse reaction to any of the following?
      </p>
      <table className="form-table table-responsive-yesno">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>Yes</th>
            <th style={{ width: '60px' }}>No</th>
            <th style={{ width: '35%' }}>Allergy/Alert</th>
            <th>Explain / Details</th>
          </tr>
        </thead>
        <tbody>
          <ConditionRow name="allergyFood" label="Food Allergies" expName="allergyFoodExp" />
          <ConditionRow name="allergyMedication" label="Medicines" expName="allergyMedicationExp" />
          <ConditionRow name="allergyPlants" label="Plants" expName="allergyPlantsExp" />
          <ConditionRow name="allergyBugs" label="Insect Bites/Stings" expName="allergyBugsExp" />
          <ConditionRow name="epinephrine" label="Epinephrine Auto-injector" dateName="autoinjectorExpDate" datePlaceholder="Auto-injector Exp. Date (MM/YYYY)" />
          <ConditionRow name="rescueInhaler" label="Rescue Inhaler" dateName="inhalerExpDate" datePlaceholder="Inhaler Expiration Date (MM/YYYY)" />
        </tbody>
      </table>

      <h3 className="section-title" style={{ fontSize: '1.2rem', marginTop: '2.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
        Medical Conditions
      </h3>
      <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        Do you currently have or have you ever been treated for any of the following?
      </p>
      <table className="form-table table-responsive-yesno">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>Yes</th>
            <th style={{ width: '60px' }}>No</th>
            <th style={{ width: '40%' }}>Condition</th>
            <th>Explain / Details</th>
          </tr>
        </thead>
        <tbody>
          <ConditionRow
            name="condDiabetes"
            label="Diabetes"
            dateName="lastHbA1c"
            datePlaceholder="Last HbA1c percentage and date:"
            extraContent={
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Insulin pump:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={isInsulinChecked === true}
                    onChange={() => setValue('condInsulin', isInsulinChecked === true ? undefined : true, { shouldDirty: true })}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={isInsulinChecked === false}
                    onChange={() => setValue('condInsulin', isInsulinChecked === false ? undefined : false, { shouldDirty: true })}
                  />
                  No
                </label>
              </div>
            }
          />
          <ConditionRow name="condHypertension" label="Hypertension (high blood pressure)" expName="hypertensionExplanation" />
          <ConditionRow name="condHeartDisease" label="Adult or congenital heart disease/heart attack/chest pain (angina)/heart murmur/coronary artery disease. Any heart surgery or procedure. Explain all 'yes' answers." expName="heartDiseaseExplanation" />
          <ConditionRow name="condFamilyHistory" label="Family history of heart disease or any sudden heart-related death of a family member before age 50." expName="familyHistoryExplanation" />
          <ConditionRow name="condStroke" label="Stroke/TIA" expName="strokeExplanation" />
          <ConditionRow name="condAsthma" label="Asthma/reactive airway disease" dateName="lastAsthmaAttack" datePlaceholder="Last attack date (MM/YYYY)" />
          <ConditionRow name="condRespiratory" label="Lung/respiratory disease" expName="lungExplanation" />
          <ConditionRow name="condCOPD" label="COPD" expName="copdExplanation" />
          <ConditionRow name="condEENSP" label="Ear/eyes/nose/sinus problems" expName="eenspExplanation" />
          <ConditionRow name="condMuscular" label="Muscular/skeletal condition/muscle or bone issues" expName="muscularExplanation" />
          <ConditionRow name="condHeadInjury" label="Head injury/concussion/TBI" expName="headExplanation" />
          <ConditionRow name="condAltitude" label="Altitude sickness" expName="altitudeExplanation" />
          <ConditionRow name="condPsychiatric" label="Psychiatric/psychological or emotional difficulties" expName="psychiatricExplanation" />
          <ConditionRow name="condNeurological" label="Neurological/behavioral disorders" expName="neurologicalExplanation" />
          <ConditionRow name="condBlood" label="Blood disorders/sickle cell disease" expName="bloodExplanation" />
          <ConditionRow name="condFainting" label="Fainting spells and dizziness" expName="faintingExplanation" />
          <ConditionRow name="condKidney" label="Kidney disease" expName="kidneyExplanation" />
          <ConditionRow name="condSeizures" label="Seizures or epilepsy" dateName="lastSeizureDate" datePlaceholder="Last seizure date (MM/YYYY)" />
          <ConditionRow name="condStomach" label="Abdominal/stomach/digestive problems" expName="stomachExplanation" />
          <ConditionRow name="condThyroid" label="Thyroid disease" expName="thyroidExplanation" />
          <ConditionRow name="condSkin" label="Skin issues" expName="skinExplanation" />
          <ConditionRow
            name="condSleep"
            label="Obstructive sleep apnea/sleep disorders"
            expName="sleepExplanation"
            extraContent={
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>CPAP:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={isCPAPChecked === true}
                    onChange={() => setValue('condCPAP', isCPAPChecked === true ? undefined : true, { shouldDirty: true })}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={isCPAPChecked === false}
                    onChange={() => setValue('condCPAP', isCPAPChecked === false ? undefined : false, { shouldDirty: true })}
                  />
                  No
                </label>
              </div>
            }
          />
          <ConditionRow name="condSurgeries" label="List all surgeries and hospitalizations" dateName="lastSurgeryDate" datePlaceholder="Last surgery date and explanation" />
          <ConditionRow name="condOther" label="List any other medical conditions not covered above" expName="otherExplanation" />
        </tbody>
      </table>

      <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'left' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary-color)' }}>
          Additional Medical History (optional)
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
          Please list any additional information about your medical history (maximum 500 characters):
        </p>
        <FormField
          name="additionalMedicalHistory"
          type="textarea"
          placeholder="e.g. details of other medical alerts, allergies, surgeries, or family history..."
          containerClass="form-group"
          maxLength={500}
        />
      </div>
    </div>
  );
};
