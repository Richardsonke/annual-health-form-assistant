import { useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, CheckCircle2, AlertCircle, X, CreditCard, PenLine } from 'lucide-react';
import { formSchema, type HealthFormData } from './schema/formSchema';
import { FormSectionPartA } from './components/FormSectionPartA';
import { FormSectionPartB } from './components/FormSectionPartB';
import { FormSectionMedications } from './components/FormSectionMedications';
import { FormSectionImmunizations } from './components/FormSectionImmunizations';
import { FormSectionSignature } from './components/FormSectionSignature';
import { generateHealthFormPDF } from './lib/pdfGenerator';
import './styles/index.css';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Pre-download Reminder Modal ---
interface ReminderModalProps {
  pendingData: HealthFormData;
  onConfirm: (data: HealthFormData) => void;
  onCancel: () => void;
}

function ReminderModal({ pendingData, onConfirm, onCancel }: ReminderModalProps) {
  const isAdult = pendingData.participantType === 'adult';
  const signLaterItems: string[] = [];
  if (!isAdult && pendingData.willSignLater) {
    signLaterItems.push('Parent/Guardian Consent — sign on the first page of the printed form');
  }
  if ((pendingData as any).willParticipantSignLater) {
    signLaterItems.push('Participant Consent — sign on the first page of the printed form');
  }
  if (!isAdult && (pendingData as any).willSignMedsLater) {
    signLaterItems.push('Medications Authorization — sign on the medications page of the printed form');
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeInUp 0.2s ease-out'
    }}>
      <div style={{
        background: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: '520px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-color), #7C3AED)',
          padding: '1.5rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Download size={22} color="white" />
            <h2 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
              Before You Download
            </h2>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Insurance card reminder — always shown */}
          <div style={{
            display: 'flex', gap: '1rem', alignItems: 'flex-start',
            background: '#EFF6FF', borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem', border: '1px solid #BFDBFE'
          }}>
            <CreditCard size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 600, color: '#1E40AF', marginBottom: '0.25rem' }}>Include a copy of your insurance card</p>
              <p style={{ fontSize: '0.9rem', color: '#3B82F6' }}>
                Attach a photocopy of the front <strong>and</strong> back of your insurance card to the completed form.
              </p>
            </div>
          </div>

          {/* Sign-later reminders — only shown when relevant */}
          {signLaterItems.length > 0 && (
            <div style={{
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
              background: '#FFFBEB', borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem', border: '1px solid #FDE68A'
            }}>
              <PenLine size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 600, color: '#92400E', marginBottom: '0.5rem' }}>Don't forget to sign with a pen</p>
                <ul style={{ paddingLeft: '1.1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {signLaterItems.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: '#B45309' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{
          padding: '1rem 2rem 1.5rem',
          display: 'flex', gap: '0.75rem', justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
          >
            Go Back
          </button>
          <button
            onClick={() => onConfirm(pendingData)}
            className="btn btn-primary"
            style={{ width: 'auto', padding: '0.75rem 1.75rem', background: 'var(--primary-color)' }}
          >
            <Download size={18} style={{ marginRight: '0.4rem' }} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main App ---
function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<HealthFormData | null>(null);

  const methods = useForm<HealthFormData>({
    resolver: zodResolver(formSchema) as any,
    mode: 'onTouched',
    defaultValues: {
      hasAllergies: false,
      willSignLater: false,
      parentSignatureDate: getTodayDateString(),
      participantSignatureDate: getTodayDateString()
    }
  });

  const handleLoadTestData = () => {
    methods.reset({
      participantType: 'youth',
      fullName: 'Test Participant Full Name',
      dateOfBirth: '2015-05-15',
      age: '11',
      gender: 'female',
      address: '123 Participant Address Street',
      city: 'Participant City',
      state: 'Participant State',
      zipCode: '12345',
      phone: '555-111-2222',
      unitNo: 'Pack 123',
      councilName: 'Great Trail Council',
      expeditionCrewNo: 'Expedition Crew 456',
      unitLeader: 'Unit Leader John Doe',
      unitLeaderPhone: '555-333-4444',
      staffPosition: 'Staff Position Assistant',
      insuranceCompany: 'Test Insurance Company Name',
      insurancePolicy: 'Policy No XYZ789',
      emergencyName: 'Primary Emergency Contact Name',
      emergencyRelationship: 'Parent',
      emergencyPhone: '555-555-5555',
      emergencyAddress: '123 Primary Emergency Address St',
      emergencyOtherPhone: '555-666-6666',
      emergencyAltName: 'Alternate Emergency Contact Name',
      emergencyAltPhone: '555-777-7777',
      authPickupName1: 'Authorized Pickup 1 Name',
      authPickupPhone1: '555-888-8888',
      authPickupName2: 'Authorized Pickup 2 Name',
      authPickupPhone2: '555-999-9999',
      notAuthPickupName1: 'Not Authorized Pickup 1 Name',
      notAuthPickupPhone1: '555-000-0000',
      notAuthPickupName2: 'Not Authorized Pickup 2 Name',
      notAuthPickupPhone2: '555-222-2222',
      bbDevice: true,
      participantRestrictions: false, // false = restrictions apply
      restrictionsText: 'No climbing activities due to recent knee surgery.',
      hasAllergies: true,
      allergyFood: true,
      allergyFoodExp: 'Food Allergy (Peanuts) Explanation',
      allergyMedication: true,
      allergyMedicationExp: 'Medication Allergy (Penicillin) Explanation',
      allergyPlants: true,
      allergyPlantsExp: 'Plants Allergy (Poison Ivy) Explanation',
      allergyBugs: true,
      allergyBugsExp: 'Insect Allergy (Bee Stings) Explanation',
      allergyOther: true,
      allergyOtherExp: 'Other Allergy Explanation',
      epinephrine: true,
      autoinjectorExpDate: '12/28',
      heightFt: '5',
      heightIn: '5',
      weight: '120',
      condDiabetes: true,
      lastHbA1c: '6.5% on 04/26',
      condInsulin: true,
      condHypertension: true,
      hypertensionExplanation: 'Hypertension (High Blood Pressure) Explanation',
      condHeartDisease: true,
      heartDiseaseExplanation: 'Congenital Heart Defect Explanation',
      condFamilyHistory: true,
      familyHistoryExplanation: 'Father had myocardial infarction at age 48.',
      condStroke: true,
      strokeExplanation: 'TIA Stroke Explanation',
      condAsthma: true,
      lastAsthmaAttack: '11/25',
      condRespiratory: true,
      lungExplanation: 'Respiratory Disease Explanation',
      condCOPD: true,
      copdExplanation: 'COPD Explanation',
      condEENSP: true,
      eenspExplanation: 'Chronic Sinusitis Explanation',
      condMuscular: true,
      muscularExplanation: 'Scoliosis Muscle/Bone Explanation',
      condHeadInjury: true,
      headExplanation: 'Mild Concussion 2024 Explanation',
      condAltitude: true,
      altitudeExplanation: 'Altitude Sickness 2023 Explanation',
      condPsychiatric: true,
      psychiatricExplanation: 'Mild Anxiety Explanation',
      condNeurological: true,
      neurologicalExplanation: 'Neurological/ADHD Explanation',
      condBlood: true,
      bloodExplanation: 'Sickle Cell Trait Explanation',
      condFainting: true,
      faintingExplanation: 'Vasovagal Syncope Explanation',
      condKidney: true,
      kidneyExplanation: 'Kidney Nephritis Explanation',
      condSeizures: true,
      lastSeizureDate: '01/26',
      condStomach: true,
      stomachExplanation: 'Acid Reflux Stomach Explanation',
      condThyroid: true,
      thyroidExplanation: 'Hypothyroidism Thyroid Explanation',
      condSkin: true,
      skinExplanation: 'Eczema Skin Explanation',
      condSleep: true,
      condCPAP: true,
      sleepExplanation: 'Sleep Apnea CPAP Explanation',
      condSurgeries: true,
      lastSurgeryDate: '08/24 - Appendectomy Surgery',
      condOther: true,
      otherExplanation: 'Other Medical Conditions Explanation',
      noMedications: false,
      nonPrescriptionExceptions: true,
      nonPrescriptionExceptionsText: 'Non-prescription exceptions list: Tylenol only',
      medicationsAdditionalSpace: true,
      medications: [
        { medication: 'Med 1 Name', dose: '10mg', frequency: 'Daily', reason: 'Reason 1' },
        { medication: 'Med 2 Name', dose: '20mg', frequency: 'Twice daily', reason: 'Reason 2' },
        { medication: 'Med 3 Name', dose: '500mg', frequency: 'As needed', reason: 'Reason 3' },
        { medication: 'Med 4 Name', dose: '1 puff', frequency: 'Every 4 hours', reason: 'Reason 4' },
        { medication: 'Med 5 Name', dose: '5mg', frequency: 'Nightly', reason: 'Reason 5' },
        { medication: 'Med 6 Name', dose: '250mg', frequency: 'Weekly', reason: 'Reason 6' }
      ],
      rescueInhaler: true,
      inhalerExpDate: '10/27',
      exemptionToImmunizations: false,
      immTetanus: true,
      immTetanusDate: '2022',
      hadTetanus: 'Had Tetanus',
      immPertussis: true,
      immPertussisDate: '2020',
      hadPertussis: 'Had Pertussis',
      immDiphtheria: true,
      immDiphtheriaDate: '2020',
      hadDiphtheria: 'Had Diphtheria',
      immPolio: true,
      immPolioDate: '2005',
      hadPolio: 'Had Polio',
      immMMR: true,
      immMMRDate: '2010',
      hadMMR: 'Had MMR',
      immChickenPox: true,
      immChickenPoxDate: '2008',
      hadChickenPox: 'Had Chicken Pox',
      immHepA: true,
      immHepADate: '2015',
      hadHepA: 'Had Hep A',
      immHepB: true,
      immHepBDate: '2012',
      hadHepB: 'Had Hep B',
      immMeningitis: true,
      immMeningitisDate: '2018',
      hadMeningitis: 'Had Meningitis',
      immInfluenza: true,
      immInfluenzaDate: '2025',
      hadInfluenza: 'Had Influenza',
      immOther: true,
      immOtherDate: '2003',
      hadOther: 'Had Other (HIB)',
      additionalMedicalHistory: 'Frequent mild asthma symptoms during heavy physical exercise. Uses rescue albuterol inhaler. Past history of seasonal grass allergies but no anaphylaxis. Underwent uncomplicated minor appendectomy in August 2024. All vitals normal. No other history of hospitalization, blood transfusions, or serious chronic illnesses. Participant maintains an active lifestyle, participating in weekly hiking, swimming, and outdoor scouts camping trips without restriction.',
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      participantSignatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      medicationsSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      parentSignatureDate: getTodayDateString(),
      participantSignatureDate: getTodayDateString()
    });
  };

  const handleLoadTestDataNo = () => {
    methods.reset({
      participantType: 'youth',
      fullName: 'Test Participant Full Name',
      dateOfBirth: '2015-05-15',
      age: '11',
      gender: 'female',
      address: '123 Participant Address Street',
      city: 'Participant City',
      state: 'Participant State',
      zipCode: '12345',
      phone: '555-111-2222',
      unitNo: 'Pack 123',
      councilName: 'Great Trail Council',
      expeditionCrewNo: 'Expedition Crew 456',
      unitLeader: 'Unit Leader John Doe',
      unitLeaderPhone: '555-333-4444',
      staffPosition: 'Staff Position Assistant',
      insuranceCompany: 'Test Insurance Company Name',
      insurancePolicy: 'Policy No XYZ789',
      emergencyName: 'Primary Emergency Contact Name',
      emergencyRelationship: 'Parent',
      emergencyPhone: '555-555-5555',
      emergencyAddress: '123 Primary Emergency Address St',
      emergencyOtherPhone: '555-666-6666',
      emergencyAltName: 'Alternate Emergency Contact Name',
      emergencyAltPhone: '555-777-7777',
      authPickupName1: 'Authorized Pickup 1 Name',
      authPickupPhone1: '555-888-8888',
      authPickupName2: 'Authorized Pickup 2 Name',
      authPickupPhone2: '555-999-9999',
      notAuthPickupName1: 'Not Authorized Pickup 1 Name',
      notAuthPickupPhone1: '555-000-0000',
      notAuthPickupName2: 'Not Authorized Pickup 2 Name',
      notAuthPickupPhone2: '555-222-2222',
      bbDevice: false,
      participantRestrictions: true, // true = None (no restrictions)
      hasAllergies: true,
      allergyFood: false,
      allergyMedication: false,
      allergyPlants: false,
      allergyBugs: false,
      allergyOther: false,
      epinephrine: false,
      heightFt: '5',
      heightIn: '5',
      weight: '120',
      condDiabetes: false,
      condInsulin: false,
      condHypertension: false,
      condHeartDisease: false,
      condFamilyHistory: false,
      condStroke: false,
      condAsthma: false,
      condRespiratory: false,
      condCOPD: false,
      condEENSP: false,
      condMuscular: false,
      condHeadInjury: false,
      condAltitude: false,
      condPsychiatric: false,
      condNeurological: false,
      condBlood: false,
      condFainting: false,
      condKidney: false,
      condSeizures: false,
      condStomach: false,
      condThyroid: false,
      condSkin: false,
      condSleep: false,
      condCPAP: false,
      condSurgeries: false,
      condOther: false,
      noMedications: true,
      nonPrescriptionExceptions: false,
      medicationsAdditionalSpace: false,
      medications: [],
      rescueInhaler: false,
      exemptionToImmunizations: false,
      immTetanus: false,
      immPertussis: false,
      immDiphtheria: false,
      immPolio: false,
      immMMR: false,
      immChickenPox: false,
      immHepA: false,
      immHepB: false,
      immMeningitis: false,
      immInfluenza: false,
      immOther: false,
      additionalMedicalHistory: 'No significant additional medical history, hospitalizations, or chronic medical conditions to report. Participant is in overall excellent health, active in sports, and fully cleared to participate in all strenuous outdoor scout camp activities without any limitations or special accommodations.',
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      participantSignatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      medicationsSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      parentSignatureDate: getTodayDateString(),
      participantSignatureDate: getTodayDateString()
    });
  };

  const executePdfDownload = useCallback(async (data: HealthFormData) => {
    setPendingFormData(null);
    try {
      setIsGenerating(true);

      const blob = await generateHealthFormPDF(data);
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Scouting_Health_Form_${data.fullName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Intercept submit to show reminder modal first
  const onSubmit = useCallback((data: HealthFormData) => {
    setPendingFormData(data);
  }, []);

  return (
    <>
      {pendingFormData && (
        <ReminderModal
          pendingData={pendingFormData}
          onConfirm={executePdfDownload}
          onCancel={() => setPendingFormData(null)}
        />
      )}
      <div className="app-container">
        <header className="header">
          <img src="./headericon.png" width="64" height="64" style={{ marginBottom: '1rem' }} />
          <h1>Health Form Filler</h1>
          <p>Complete the Scouting America Medical Release Form (Parts A & B).<br /><br /></p>
          <p><strong>Private & Secure:</strong> All data is processed entirely in your browser. Nothing is ever sent to any server.</p>
          <p>Secure storage of the generated PDF is your responsiblity.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={handleLoadTestData}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            >
              Load Test Data (Yes)
            </button>
            <button
              type="button"
              onClick={handleLoadTestDataNo}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            >
              Load Test Data (No)
            </button>
          </div>
        </header>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <FormSectionPartA />
            <FormSectionPartB />
            <FormSectionMedications />
            <FormSectionImmunizations />
            <FormSectionSignature />

            <div className="form-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isGenerating}
                style={{ fontSize: '1.125rem', padding: '1.25rem 2rem' }}
              >
                <Download size={24} style={{ marginRight: '0.5rem' }} />
                {isGenerating ? 'Generating PDF...' : 'Download Completed PDF'}
              </button>

              {isSuccess && (
                <div style={{ marginTop: '1rem', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeInUp 0.3s ease-out' }}>
                  <CheckCircle2 size={20} />
                  <span>PDF generated successfully!</span>
                </div>
              )}

              {Object.keys(methods.formState.errors).length > 0 && (
                <div style={{ marginTop: '1rem', color: 'var(--error-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeInUp 0.3s ease-out' }}>
                  <AlertCircle size={20} />
                  <span>Please fix the errors above before downloading.</span>
                </div>
              )}
            </div>
          </form>
        </FormProvider>

        <footer style={{
          marginTop: '3rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          padding: '1.5rem 0',
          borderTop: '1px solid var(--border-color)'
        }}>
          This application is not affiliated with, sponsored by, or endorsed by Scouting America. It is an independent, volunteer-created utility.
        </footer>
      </div>
    </>
  );
}

export default App;
