import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
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

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      immTetanusDate: '2020-01-01',
      hadTetanus: 'Had Tetanus',
      immPertussis: true,
      immPertussisDate: '2020-01-02',
      hadPertussis: 'Had Pertussis',
      immDiphtheria: true,
      immDiphtheriaDate: '2020-01-03',
      hadDiphtheria: 'Had Diphtheria',
      immPolio: true,
      immPolioDate: '2020-01-04',
      hadPolio: 'Had Polio',
      immMMR: true,
      immMMRDate: '2020-01-05',
      hadMMR: 'Had MMR',
      immChickenPox: true,
      immChickenPoxDate: '2020-01-06',
      hadChickenPox: 'Had Chicken Pox',
      immHepA: true,
      immHepADate: '2020-01-07',
      hadHepA: 'Had Hep A',
      immHepB: true,
      immHepBDate: '2020-01-08',
      hadHepB: 'Had Hep B',
      immMeningitis: true,
      immMeningitisDate: '2020-01-09',
      hadMeningitis: 'Had Meningitis',
      immInfluenza: true,
      immInfluenzaDate: '2025-10-10',
      hadInfluenza: 'Had Influenza',
      immOther: true,
      immOtherDate: '2020-01-11',
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

  const onSubmit = async (data: HealthFormData) => {
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
  };

  return (
    <div className="app-container">
      <header className="header">
        <FileText size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
        <h1>Health Form Filler</h1>
        <p>Complete the Scouting America Medical Release Form (Parts A & B) locally and securely.</p>
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
        This page is not in any way sponsored or approved by Scouting America.
      </footer>
    </div>
  );
}

export default App;
