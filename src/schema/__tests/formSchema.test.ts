import { describe, it, expect } from 'vitest';
import { formSchema } from '../formSchema';

const baseValidYouthData = {
  participantType: 'youth',
  fullName: 'Alice Smith',
  dateOfBirth: '2015-05-15',
  age: '11',
  gender: 'female',
  address: '123 Forest Trail',
  city: 'Scouttown',
  state: 'OH',
  zipCode: '44240',
  phone: '330-555-0199',
  unitNo: 'Troop 123',
  councilName: 'Great Trail Council',
  unitLeader: 'John Smith',
  unitLeaderPhone: '330-555-0111',
  insuranceCompany: 'Blue Cross Blue Shield',
  insurancePolicy: 'XYZ1234567',
  emergencyName: 'Jane Smith',
  emergencyRelationship: 'Mother',
  emergencyPhone: '330-555-0100',
  emergencyAddress: '123 Forest Trail, Scouttown, OH 44240',
  emergencyAltName: 'John Smith',
  emergencyAltPhone: '330-555-0111',
  bbDevice: false,
  participantRestrictions: true, // None
  heightFt: '5',
  heightIn: '2',
  weight: '110',
  
  // Mandatory Yes/No table fields (Allergies)
  allergyFood: false,
  allergyMedication: false,
  allergyPlants: false,
  allergyBugs: false,
  epinephrine: false,
  rescueInhaler: false,

  // Medical Conditions
  condAsthma: false,
  condDiabetes: false,
  condHeartDisease: false,
  condHypertension: false,
  condStroke: false,
  condRespiratory: false,
  condCOPD: false,
  condSleep: false,
  condPsychiatric: false,
  condNeurological: false,
  condSeizures: false,
  condFainting: false,
  condHeadInjury: false,
  condAltitude: false,
  condStomach: false,
  condKidney: false,
  condSkin: false,
  condThyroid: false,
  condBlood: false,
  condEENSP: false,
  condMuscular: false,
  condSurgeries: false,
  condFamilyHistory: false,
  condOther: false,

  // Medications
  noMedications: true,
  nonPrescriptionExceptions: false,

  // Immunizations
  exemptionToImmunizations: false,
  immTetanus: true,
  immTetanusDate: '2022',
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

  // Signatures
  willSignLater: true,
  willParticipantSignLater: true,
  parentSignatureDate: '2026-05-25',
  participantSignatureDate: '2026-05-25'
};

const baseValidAdultData = {
  ...baseValidYouthData,
  participantType: 'adult',
  // Adult does not require participantRestrictions or nonPrescriptionExceptions,
  // but we can omit them or keep them since they are optional.
  willSignLater: false,
  signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANS...', // Mock signature data
  willParticipantSignLater: true
};

describe('formSchema Validation', () => {
  it('should validate a correct youth dataset successfully', () => {
    const result = formSchema.safeParse(baseValidYouthData);
    expect(result.success).toBe(true);
  });

  it('should validate a correct adult dataset successfully', () => {
    const result = formSchema.safeParse(baseValidAdultData);
    expect(result.success).toBe(true);
  });

  it('should fail if required general fields are missing', () => {
    const invalidData = { ...baseValidYouthData };
    delete (invalidData as any).fullName;
    delete (invalidData as any).gender;
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorPaths = result.error.issues.map(i => i.path[0]);
      expect(errorPaths).toContain('fullName');
      expect(errorPaths).toContain('gender');
    }
  });

  it('should require insurance details', () => {
    const invalidData = { ...baseValidYouthData };
    delete (invalidData as any).insuranceCompany;
    delete (invalidData as any).insurancePolicy;
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorPaths = result.error.issues.map(i => i.path[0]);
      expect(errorPaths).toContain('insuranceCompany');
      expect(errorPaths).toContain('insurancePolicy');
    }
  });

  it('should enforce numeric values for height and weight', () => {
    const invalidData = {
      ...baseValidYouthData,
      heightFt: 'abc',
      weight: ''
    };
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some(i => i.path[0] === 'heightFt')).toBe(true);
      expect(issues.some(i => i.path[0] === 'weight')).toBe(true);
    }
  });

  it('should enforce range constraints for heightFt (0 to 10)', () => {
    const invalidData1 = { ...baseValidYouthData, heightFt: '-1' };
    const invalidData2 = { ...baseValidYouthData, heightFt: '11' };
    
    expect(formSchema.safeParse(invalidData1).success).toBe(false);
    expect(formSchema.safeParse(invalidData2).success).toBe(false);
  });

  it('should enforce range constraints for heightIn (0 to 11)', () => {
    const invalidData1 = { ...baseValidYouthData, heightIn: '-1' };
    const invalidData2 = { ...baseValidYouthData, heightIn: '12' };
    
    expect(formSchema.safeParse(invalidData1).success).toBe(false);
    expect(formSchema.safeParse(invalidData2).success).toBe(false);
  });

  it('should enforce range constraints for weight (1 to 1000)', () => {
    const invalidData1 = { ...baseValidYouthData, weight: '0' };
    const invalidData2 = { ...baseValidYouthData, weight: '1001' };
    
    expect(formSchema.safeParse(invalidData1).success).toBe(false);
    expect(formSchema.safeParse(invalidData2).success).toBe(false);
  });

  it('should require parent signature for youth if willSignLater is false', () => {
    const invalidData = {
      ...baseValidYouthData,
      willSignLater: false,
      signatureData: '' // missing
    };
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some(i => i.path[0] === 'signatureData')).toBe(true);
    }
  });

  it('should require participant signature if willParticipantSignLater is false', () => {
    const invalidData = {
      ...baseValidYouthData,
      willParticipantSignLater: false,
      participantSignatureData: '' // missing
    };
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some(i => i.path[0] === 'participantSignatureData')).toBe(true);
    }
  });

  it('should require non-prescription medication consent selection for youth', () => {
    const invalidData = { ...baseValidYouthData };
    delete (invalidData as any).nonPrescriptionExceptions;
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some(i => i.path[0] === 'nonPrescriptionExceptions')).toBe(true);
    }
  });

  it('should require either at least one medication row or noMedications checked', () => {
    const invalidData = {
      ...baseValidYouthData,
      noMedications: false,
      medications: [] // empty
    };
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some(i => i.path[0] === 'noMedications')).toBe(true);
    }
  });

  it('should require all 4 columns for each medication row', () => {
    const invalidData = {
      ...baseValidYouthData,
      noMedications: false,
      medications: [
        { medication: 'Tylenol', dose: '500mg', frequency: '', reason: 'Headache' } // missing frequency
      ]
    };
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some(i => i.path.join('.') === 'medications.0.frequency')).toBe(true);
    }
  });

  it('should require explicit selection on all Yes/No table checkboxes', () => {
    const invalidData = { ...baseValidYouthData };
    delete (invalidData as any).allergyFood;
    delete (invalidData as any).condAsthma;
    delete (invalidData as any).immPolio;
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorPaths = result.error.issues.map(i => i.path[0]);
      expect(errorPaths).toContain('allergyFood');
      expect(errorPaths).toContain('condAsthma');
      expect(errorPaths).toContain('immPolio');
    }
  });

  it('should require tetanus year if checked Yes', () => {
    const invalidData = {
      ...baseValidYouthData,
      immTetanus: true,
      immTetanusDate: '' // empty year
    };
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some(i => i.path[0] === 'immTetanusDate')).toBe(true);
    }
  });

  it('should fail if tetanus year is not within 10 years and exemption is not checked', () => {
    const invalidData = {
      ...baseValidYouthData,
      exemptionToImmunizations: false,
      immTetanus: true,
      immTetanusDate: '2010' // older than 10 years from 2026
    };
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some(i => i.path[0] === 'immTetanusDate')).toBe(true);
    }
  });

  it('should pass if tetanus year is older than 10 years but exemption is checked', () => {
    const validData = {
      ...baseValidYouthData,
      exemptionToImmunizations: true,
      immTetanus: true,
      immTetanusDate: '2010'
    };
    
    const result = formSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
