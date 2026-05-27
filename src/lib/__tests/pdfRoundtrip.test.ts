import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateHealthFormPDF } from '../pdfGenerator';
import { parseHealthFormPDF } from '../pdfParser';
import type { HealthFormData } from '../../schema/formSchema';

// Mock global fetch to return the template PDF
beforeAll(() => {
  (globalThis as any).fetch = async (url: any) => {
    if (url === './680-001_AB.pdf') {
      const filePath = path.resolve(process.cwd(), 'public/680-001_AB.pdf');
      const buffer = fs.readFileSync(filePath);
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
      } as any;
    }
    throw new Error(`Unexpected fetch URL: ${url}`);
  };
});

const sampleYouthData: HealthFormData = {
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
  participantRestrictions: false, // Restrictions apply
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
  otherExplanation: 'Other explanation details',
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
  immTetanusDate: '08/15/2022',
  hadTetanus: '2018',
  immPertussis: true,
  immPertussisDate: '05/20/2020',
  hadPertussis: '2012',
  immDiphtheria: true,
  immDiphtheriaDate: '05/20/2020',
  hadDiphtheria: '2012',
  immPolio: true,
  immPolioDate: '09/10/2005, 11/12/2007',
  hadPolio: '2008',
  immMMR: true,
  immMMRDate: '03/12/2010, 06/15/2013',
  hadMMR: '2010',
  immChickenPox: true,
  immChickenPoxDate: '06/18/2008',
  hadChickenPox: '2006',
  immHepA: true,
  immHepADate: '04/10/2015, 10/12/2015',
  hadHepA: '2014',
  immHepB: true,
  immHepBDate: '01/15/2012, 02/15/2012, 07/15/2012',
  hadHepB: '2011',
  immMeningitis: true,
  immMeningitisDate: '09/20/2018',
  hadMeningitis: '2017',
  immInfluenza: true,
  immInfluenzaDate: '10/15/2025',
  hadInfluenza: '2024',
  immOther: true,
  immOtherDate: '08/22/2003',
  hadOther: '2004',
  additionalMedicalHistory: 'Frequent mild asthma symptoms during heavy physical exercise. Uses rescue albuterol inhaler. Past history of seasonal grass allergies but no anaphylaxis. Underwent uncomplicated minor appendectomy in August 2024. All vitals normal. No other history of hospitalization, blood transfusions, or serious chronic illnesses. Participant maintains an active lifestyle, participating in weekly hiking, swimming, and outdoor scouts camping trips without restriction.',
  signatureData: 'data:image/png;base64,iVBORw0KGgoAAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
  participantSignatureData: 'data:image/png;base64,iVBORw0KGgoAAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
  medicationsSignature: 'data:image/png;base64,iVBORw0KGgoAAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
  parentSignatureDate: '2026-05-25',
  participantSignatureDate: '2026-05-25',
  willSignLater: true,
  willParticipantSignLater: true,
  willSignMedsLater: true
};

const sampleAdultData: HealthFormData = {
  participantType: 'adult',
  fullName: 'Adult Leader Name',
  dateOfBirth: '1988-11-12',
  age: '37',
  gender: 'male',
  address: '456 Adult Leader Lane',
  city: 'Leader City',
  state: 'Leader State',
  zipCode: '54321',
  phone: '555-222-3333',
  unitNo: 'Troop 100',
  councilName: 'Great Trail Council',
  insuranceCompany: 'Adult Insurance Co',
  insurancePolicy: 'Policy No 12345678',
  emergencyName: 'Emergency Spouse Name',
  emergencyRelationship: 'Spouse',
  emergencyPhone: '555-555-6666',
  emergencyAddress: '456 Adult Leader Lane',
  emergencyAltName: 'Alt Emergency Friend Name',
  emergencyAltPhone: '555-777-8888',
  heightFt: '6',
  heightIn: '1',
  weight: '185',
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
  medications: [],
  exemptionToImmunizations: false,
  immTetanus: true,
  immTetanusDate: '2023',
  hadTetanus: '',
  immPertussis: true,
  immPertussisDate: '2023',
  hadPertussis: '',
  immDiphtheria: true,
  immDiphtheriaDate: '2023',
  hadDiphtheria: '',
  immPolio: true,
  immPolioDate: '2000',
  hadPolio: '',
  immMMR: true,
  immMMRDate: '2000',
  hadMMR: '',
  immChickenPox: true,
  immChickenPoxDate: '2000',
  hadChickenPox: '',
  immHepA: true,
  immHepADate: '2010',
  hadHepA: '',
  immHepB: true,
  immHepBDate: '2010',
  hadHepB: '',
  immMeningitis: false,
  immInfluenza: false,
  immOther: false,
  additionalMedicalHistory: '',
  participantSignatureDate: '2026-05-25',
  bbDevice: false,
  hasAllergies: false,
  medicationsAdditionalSpace: false,
  willSignMedsLater: false,
  willSignLater: false,
  willParticipantSignLater: false
};

async function testScenario(sampleData: HealthFormData) {
  const today = new Date().toISOString().split('T')[0];
  const data = {
    ...sampleData,
    participantSignatureDate: today
  };
  if (data.participantType === 'youth') {
    data.parentSignatureDate = today;
  }

  const pdfBlob = await generateHealthFormPDF(data);
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const parsedData = await parseHealthFormPDF(arrayBuffer);

  const ignoreFields = [
    'signatureData',
    'participantSignatureData',
    'medicationsSignature',
    'willSignLater',
    'willParticipantSignLater',
    'willSignMedsLater'
  ];

  if (data.participantType === 'adult') {
    ignoreFields.push(
      'authPickupName1', 'authPickupPhone1',
      'authPickupName2', 'authPickupPhone2',
      'notAuthPickupName1', 'notAuthPickupPhone1',
      'notAuthPickupName2', 'notAuthPickupPhone2',
      'bbDevice', 'participantRestrictions', 'restrictionsText',
      'parentSignatureDate', 'nonPrescriptionExceptions', 'nonPrescriptionExceptionsText',
      'medicationsAdditionalSpace'
    );
  }

  for (const key of Object.keys(data)) {
    if (ignoreFields.includes(key)) continue;

    const expected = (data as any)[key];
    const actual = (parsedData as any)[key];

    expect(actual).toEqual(expected);
  }
}

describe('PDF Generation and Parsing Roundtrip', () => {
  it('should generate and parse youth data cleanly', async () => {
    await testScenario(sampleYouthData);
  });

  it('should generate and parse adult data cleanly', async () => {
    await testScenario(sampleAdultData);
  });
});
