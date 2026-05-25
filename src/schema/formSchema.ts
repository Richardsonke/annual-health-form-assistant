import { z } from 'zod';

export const formSchema = z.object({
  // Part A: General Information
  participantType: z.enum(['youth', 'adult'], { message: "Participant type is required" }),
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  age: z.string().min(1, "Age is required"),
  gender: z.enum(['male', 'female'], { message: "Sex is required" }),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  phone: z.string().min(10, "Phone number is required"),

  unitNo: z.string().min(1, "Unit number is required"),
  councilName: z.string().min(1, "Council name is required"),
  expeditionCrewNo: z.string().optional(),
  unitLeader: z.string().optional(),
  unitLeaderPhone: z.string().optional(),
  staffPosition: z.string().optional(),

  // Insurance Details
  insuranceCompany: z.string().min(1, "Insurance company is required"),
  insurancePolicy: z.string().min(1, "Policy number is required"),

  // Emergency Contacts
  emergencyName: z.string().min(2, "Emergency contact name is required"),
  emergencyRelationship: z.string().min(2, "Relationship is required"),
  emergencyPhone: z.string().min(10, "Emergency phone is required"),
  emergencyAddress: z.string().min(5, "Emergency contact address is required"),
  emergencyOtherPhone: z.string().optional(),
  emergencyAltName: z.string().min(2, "Alternate contact name is required"),
  emergencyAltPhone: z.string().min(10, "Alternate phone is required"),

  // Authorized / Unauthorized Pickups
  authPickupName1: z.string().optional(),
  authPickupPhone1: z.string().optional(),
  authPickupName2: z.string().optional(),
  authPickupPhone2: z.string().optional(),
  notAuthPickupName1: z.string().optional(),
  notAuthPickupPhone1: z.string().optional(),
  notAuthPickupName2: z.string().optional(),
  notAuthPickupPhone2: z.string().optional(),

  // BB Device & Participant Restrictions (Page 1)
  bbDevice: z.boolean().default(false),
  participantRestrictions: z.boolean().optional(),
  restrictionsText: z.string().optional(),

  // Part B: Allergies
  hasAllergies: z.boolean().default(false),
  allergyFood: z.boolean().optional(),
  allergyMedication: z.boolean().optional(),
  allergyPlants: z.boolean().optional(),
  allergyBugs: z.boolean().optional(),
  allergyOther: z.boolean().optional(),
  epinephrine: z.boolean().optional(),
  autoinjectorExpDate: z.string().optional(),
  allergyFoodExp: z.string().optional(),
  allergyMedicationExp: z.string().optional(),
  allergyPlantsExp: z.string().optional(),
  allergyBugsExp: z.string().optional(),
  allergyOtherExp: z.string().optional(),

  // Part B: Physical Guidelines
  heightFt: z.string().min(1, "Height (feet) is required").regex(/^\d+$/, "Must be a number"),
  heightIn: z.string().min(1, "Height (inches) is required").regex(/^\d+$/, "Must be a number"),
  weight: z.string().min(1, "Weight is required").regex(/^\d+$/, "Must be a number"),

  // Part B: Medical Conditions
  condAsthma: z.boolean().optional(),
  rescueInhaler: z.boolean().optional(),
  inhalerExpDate: z.string().optional(),
  lastAsthmaAttack: z.string().optional(),
  condDiabetes: z.boolean().optional(),
  condInsulin: z.boolean().default(false),
  lastHbA1c: z.string().optional(),
  condHeartDisease: z.boolean().optional(),
  condHypertension: z.boolean().optional(),
  condStroke: z.boolean().optional(),
  condRespiratory: z.boolean().optional(),
  condCOPD: z.boolean().optional(),
  condSleep: z.boolean().optional(),
  condCPAP: z.boolean().default(false),
  condPsychiatric: z.boolean().optional(),
  condNeurological: z.boolean().optional(),
  condSeizures: z.boolean().optional(),
  lastSeizureDate: z.string().optional(),
  condFainting: z.boolean().optional(),
  condHeadInjury: z.boolean().optional(),
  condAltitude: z.boolean().optional(),
  condStomach: z.boolean().optional(),
  condKidney: z.boolean().optional(),
  condSkin: z.boolean().optional(),
  condThyroid: z.boolean().optional(),
  condBlood: z.boolean().optional(),
  condEENSP: z.boolean().optional(),
  condMuscular: z.boolean().optional(),
  condSurgeries: z.boolean().optional(),
  lastSurgeryDate: z.string().optional(),
  condFamilyHistory: z.boolean().optional(),
  condOther: z.boolean().optional(),

  // Explanations for Conditions
  diabetesExplanation: z.string().optional(),
  heartDiseaseExplanation: z.string().optional(),
  familyHistoryExplanation: z.string().optional(),
  hypertensionExplanation: z.string().optional(),
  strokeExplanation: z.string().optional(),
  lungExplanation: z.string().optional(),
  copdExplanation: z.string().optional(),
  sleepExplanation: z.string().optional(),
  psychiatricExplanation: z.string().optional(),
  neurologicalExplanation: z.string().optional(),
  faintingExplanation: z.string().optional(),
  headExplanation: z.string().optional(),
  altitudeExplanation: z.string().optional(),
  stomachExplanation: z.string().optional(),
  kidneyExplanation: z.string().optional(),
  skinExplanation: z.string().optional(),
  thyroidExplanation: z.string().optional(),
  bloodExplanation: z.string().optional(),
  eenspExplanation: z.string().optional(),
  muscularExplanation: z.string().optional(),
  otherExplanation: z.string().optional(),

  // Medications
  noMedications: z.boolean().default(false),
  nonPrescriptionExceptions: z.boolean().default(false),
  nonPrescriptionExceptionsText: z.string().optional(),
  medicationsAdditionalSpace: z.boolean().default(false),
  medications: z.array(z.object({
    medication: z.string().optional(),
    dose: z.string().optional(),
    frequency: z.string().optional(),
    reason: z.string().optional()
  })).max(6, "Maximum of 6 medications allowed").default([]),
  medicationsSignature: z.string().optional(),
  willSignMedsLater: z.boolean().default(false),

  // Immunizations
  exemptionToImmunizations: z.boolean().optional(),
  immTetanus: z.boolean().optional(),
  immTetanusDate: z.string().optional(),
  hadTetanus: z.string().optional(),
  immPertussis: z.boolean().optional(),
  immPertussisDate: z.string().optional(),
  hadPertussis: z.string().optional(),
  immDiphtheria: z.boolean().optional(),
  immDiphtheriaDate: z.string().optional(),
  hadDiphtheria: z.string().optional(),
  immPolio: z.boolean().optional(),
  immPolioDate: z.string().optional(),
  hadPolio: z.string().optional(),
  immMMR: z.boolean().optional(),
  immMMRDate: z.string().optional(),
  hadMMR: z.string().optional(),
  immChickenPox: z.boolean().optional(),
  immChickenPoxDate: z.string().optional(),
  hadChickenPox: z.string().optional(),
  immHepA: z.boolean().optional(),
  immHepADate: z.string().optional(),
  hadHepA: z.string().optional(),
  immHepB: z.boolean().optional(),
  immHepBDate: z.string().optional(),
  hadHepB: z.string().optional(),
  immMeningitis: z.boolean().optional(),
  immMeningitisDate: z.string().optional(),
  hadMeningitis: z.string().optional(),
  immInfluenza: z.boolean().optional(),
  immInfluenzaDate: z.string().optional(),
  hadInfluenza: z.string().optional(),
  hadOther: z.string().optional(),

  immOther: z.boolean().optional(),
  immOtherDate: z.string().optional(),
  immOtherExemption: z.string().optional(),
  immOtherExemptionDate: z.string().optional(),
  additionalMedicalHistory: z.string().max(490, "Maximum of 490 characters allowed").optional(),

  // Signature Handling
  signatureData: z.string().optional(),
  willSignLater: z.boolean().default(false),
  parentSignatureDate: z.string().optional(),

  participantSignatureData: z.string().optional(),
  willParticipantSignLater: z.boolean().default(false),
  participantSignatureDate: z.string().optional(),
}).superRefine((data, ctx) => {
  // 1. Parent/Guardian Signature (only required for youth)
  if (data.participantType !== 'adult' && !data.willSignLater && (!data.signatureData || data.signatureData.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Parent/guardian signature is required",
      path: ["signatureData"]
    });
  }

  // 2. Participant Signature
  if (!data.willParticipantSignLater && (!data.participantSignatureData || data.participantSignatureData.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Participant signature is required",
      path: ["participantSignatureData"]
    });
  }

  // 3. Medications Signature (only required for youth if non-prescription exceptions are authorized/active)
  if (data.participantType !== 'adult' && data.nonPrescriptionExceptions === true && !data.willSignMedsLater && (!data.medicationsSignature || data.medicationsSignature.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Medications authorization signature is required",
      path: ["medicationsSignature"]
    });
  }

  // 4. Required Yes/No table fields — must have either Yes or No selected
  const requiredYesNoFields = [
    // Allergies table
    'allergyFood', 'allergyMedication', 'allergyPlants', 'allergyBugs', 'allergyOther', 'epinephrine', 'rescueInhaler',
    // Medical Conditions table
    'condAsthma', 'condDiabetes', 'condHeartDisease', 'condHypertension', 'condStroke', 'condRespiratory', 'condCOPD',
    'condSleep', 'condPsychiatric', 'condNeurological', 'condSeizures', 'condFainting', 'condHeadInjury', 'condAltitude',
    'condStomach', 'condKidney', 'condSkin', 'condThyroid', 'condBlood', 'condEENSP', 'condMuscular', 'condSurgeries',
    'condFamilyHistory', 'condOther',
    // Immunizations table
    'exemptionToImmunizations', 'immTetanus', 'immPertussis', 'immDiphtheria', 'immPolio', 'immMMR', 'immChickenPox',
    'immHepA', 'immHepB', 'immMeningitis', 'immInfluenza', 'immOther',
  ];
  for (const field of requiredYesNoFields) {
    if ((data as any)[field] === undefined || (data as any)[field] === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select Yes or No",
        path: [field]
      });
    }
  }

  // 5. Participant restrictions required for youth
  if (data.participantType !== 'adult') {
    if (data.participantRestrictions === undefined || data.participantRestrictions === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select either 'None' or 'Restrictions apply'",
        path: ["participantRestrictions"]
      });
    }
  }

  // 6. Immunization dates required when Yes is checked (must be a valid 4-digit year in range)
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 120;
  const immDatePairs: [string, string][] = [
    ['immTetanus', 'immTetanusDate'],
    ['immPertussis', 'immPertussisDate'],
    ['immDiphtheria', 'immDiphtheriaDate'],
    ['immPolio', 'immPolioDate'],
    ['immMMR', 'immMMRDate'],
    ['immChickenPox', 'immChickenPoxDate'],
    ['immHepA', 'immHepADate'],
    ['immHepB', 'immHepBDate'],
    ['immMeningitis', 'immMeningitisDate'],
    ['immInfluenza', 'immInfluenzaDate'],
    ['immOther', 'immOtherDate'],
  ];
  for (const [checkField, dateField] of immDatePairs) {
    if ((data as any)[checkField] === true) {
      const yearStr = String((data as any)[dateField] ?? '');
      const year = parseInt(yearStr, 10);
      const isValidFormat = yearStr.length === 4 && !isNaN(year);
      // Skip immTetanus — handled separately below with a more specific message
      if (checkField !== 'immTetanus') {
        if (!yearStr || !isValidFormat) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Year is required (YYYY)', path: [dateField] });
        } else if (year > currentYear) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Year cannot be in the future`, path: [dateField] });
        } else if (year < minYear) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Year cannot be more than 120 years ago`, path: [dateField] });
        }
      }
    }
  }

  // 7. Tetanus must be current (within 10 years) unless exemption is marked Yes
  //    Compare today against Dec 31 of the entered year (most lenient)
  if (data.exemptionToImmunizations !== true) {
    if (data.immTetanus !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tetanus vaccination is required (or mark Exemption to immunizations)',
        path: ['immTetanus']
      });
    } else {
      const yearStr = String(data.immTetanusDate ?? '');
      const year = parseInt(yearStr, 10);
      const isValidFormat = yearStr.length === 4 && !isNaN(year);
      if (!yearStr || !isValidFormat) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tetanus year is required (YYYY)', path: ['immTetanusDate'] });
      } else if (year > currentYear) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Year cannot be in the future', path: ['immTetanusDate'] });
      } else if (year < minYear) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Year cannot be more than 120 years ago', path: ['immTetanusDate'] });
      } else {
        // Dec 31 of the entered year is the most lenient end date for the 10-year check
        const dec31OfYear = new Date(year, 11, 31);
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        if (dec31OfYear < tenYearsAgo) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tetanus must have been within the last 10 years', path: ['immTetanusDate'] });
        }
      }
    }
  }
});

export type HealthFormData = z.infer<typeof formSchema>;
