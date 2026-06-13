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
  councilName: 'Dan Beard Council (#438)',
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

  // Authorized Pickups
  authPickupName1: 'Jane Smith',
  authPickupPhone1: '330-555-0199',

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

  it('should enforce numeric values and range constraints for age (0 to 150)', () => {
    const invalidData1 = { ...baseValidYouthData, age: 'abc' };
    const invalidData2 = { ...baseValidYouthData, age: '-1' };
    const invalidData3 = { ...baseValidYouthData, age: '151' };
    const validData1 = { ...baseValidYouthData, age: '0' };
    const validData2 = { ...baseValidYouthData, age: '150' };

    expect(formSchema.safeParse(invalidData1).success).toBe(false);
    expect(formSchema.safeParse(invalidData2).success).toBe(false);
    expect(formSchema.safeParse(invalidData3).success).toBe(false);
    expect(formSchema.safeParse(validData1).success).toBe(true);
    expect(formSchema.safeParse(validData2).success).toBe(true);
  });

  it('should require the first authorized pickup name and phone number for youth participants', () => {
    const invalidName = { ...baseValidYouthData };
    delete (invalidName as any).authPickupName1;
    const invalidPhone = { ...baseValidYouthData };
    delete (invalidPhone as any).authPickupPhone1;

    expect(formSchema.safeParse(invalidName).success).toBe(false);
    expect(formSchema.safeParse(invalidPhone).success).toBe(false);
  });

  it('should not require authorized pickup details for adult participants', () => {
    const validAdult = { ...baseValidAdultData };
    delete (validAdult as any).authPickupName1;
    delete (validAdult as any).authPickupPhone1;

    expect(formSchema.safeParse(validAdult).success).toBe(true);
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

  describe('Phone Number Formatting (XXX-XXX-XXXX)', () => {
    it('should fail if required phone number is empty or in wrong format', () => {
      const dataWithEmptyPhone = {
        ...baseValidYouthData,
        phone: ''
      };
      const resultEmpty = formSchema.safeParse(dataWithEmptyPhone);
      expect(resultEmpty.success).toBe(false);
      if (!resultEmpty.success) {
        expect(resultEmpty.error.issues[0].message).toBe('Phone number is required');
      }

      const dataWith10DigitPhone = {
        ...baseValidYouthData,
        phone: '1234567890'
      };
      const result10Digit = formSchema.safeParse(dataWith10DigitPhone);
      expect(result10Digit.success).toBe(false);
      if (!result10Digit.success) {
        expect(result10Digit.error.issues[0].message).toBe('Phone number must be formatted as XXX-XXX-XXXX');
      }

      const dataWithPartialFormattedPhone = {
        ...baseValidYouthData,
        phone: '123-456-789'
      };
      const resultPartial = formSchema.safeParse(dataWithPartialFormattedPhone);
      expect(resultPartial.success).toBe(false);
      if (!resultPartial.success) {
        expect(resultPartial.error.issues[0].message).toBe('Phone number must be formatted as XXX-XXX-XXXX');
      }
    });

    it('should fail if optional phone number is filled but in wrong format', () => {
      const dataWithInvalidOptional = {
        ...baseValidYouthData,
        emergencyOtherPhone: '123-456-7890' // 12 chars but wrong format/no hyphen or too long? wait, 12 chars is right format. Let's use 1234567890
      };
      dataWithInvalidOptional.emergencyOtherPhone = '1234567890';
      const result = formSchema.safeParse(dataWithInvalidOptional);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Other phone must be formatted as XXX-XXX-XXXX');
      }
    });

    it('should pass if optional phone number is empty, null, or undefined', () => {
      const dataWithEmptyOptional = {
        ...baseValidYouthData,
        emergencyOtherPhone: ''
      };
      const resultEmpty = formSchema.safeParse(dataWithEmptyOptional);
      expect(resultEmpty.success).toBe(true);

      const dataWithUndefinedOptional = {
        ...baseValidYouthData,
        emergencyOtherPhone: undefined
      };
      const resultUndefined = formSchema.safeParse(dataWithUndefinedOptional);
      expect(resultUndefined.success).toBe(true);
    });
  });
});

