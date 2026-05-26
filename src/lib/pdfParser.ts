import { PDFDocument, PDFName, PDFTextField, PDFCheckBox } from 'pdf-lib';
import type { HealthFormData } from '../schema/formSchema';

export async function parseHealthFormPDF(fileBuffer: ArrayBuffer): Promise<Partial<HealthFormData>> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const form = pdfDoc.getForm();
  
  const data: Partial<HealthFormData> = {};

  const getTextFieldVal = (name: string): string => {
    try {
      const field = form.getField(name);
      if (field instanceof PDFTextField) {
        return field.getText() || '';
      }
    } catch {}
    return '';
  };

  const getCheckBoxVal = (name: string): boolean => {
    try {
      const field = form.getField(name);
      if (field instanceof PDFCheckBox) {
        return field.isChecked();
      }
    } catch {}
    return false;
  };

  const getYesNoCheckVal = (name: string): boolean | undefined => {
    try {
      const field = form.getField(name);
      if (field) {
        const valSymbol = field.acroField.dict.get(PDFName.of('V'));
        if (valSymbol instanceof PDFName) {
          const valStr = valSymbol.decodeText();
          if (valStr === 'Yes') return true;
          if (valStr === 'No') return false;
        }
      }
    } catch {}
    return undefined;
  };

  // General Details
  data.fullName = getTextFieldVal('Full name');
  data.dateOfBirth = getTextFieldVal('Date of birth');
  data.age = getTextFieldVal('Age');
  data.address = getTextFieldVal('Address');
  data.city = getTextFieldVal('City');
  data.state = getTextFieldVal('State');
  data.zipCode = getTextFieldVal('ZIP code');
  data.phone = getTextFieldVal('Phone');
  data.unitNo = getTextFieldVal('Unit No');
  data.councilName = getTextFieldVal('Council Name/No');
  data.expeditionCrewNo = getTextFieldVal('Expedition/crew No');
  data.unitLeader = getTextFieldVal('Unit leader');
  data.unitLeaderPhone = getTextFieldVal("Unit leader's mobile #");
  data.staffPosition = getTextFieldVal('staff position');

  // Determine if youth or adult
  const ageStr = getTextFieldVal('Age');
  const ageVal = parseInt(ageStr, 10);

  const hasBBCheck = getCheckBoxVal('Check Box 1');
  const hasRestrictionsCheck = getCheckBoxVal('Check Box 2');
  const restrictionsText = getTextFieldVal('Date of birth 1');

  const hasPickups = [
    'Name of authorized',
    'Phone of authorized',
    'Name of authorized 2',
    'Phone of authorized 2',
    'Name of not authorized',
    'Phone of not authorized',
    'Name of not authorized 2',
    'Phone of not authorized 2'
  ].some(name => getTextFieldVal(name) !== '');

  const hasParentSignatureDate = getTextFieldVal('Date of birth 3') !== '';

  const isYouth =
    hasBBCheck ||
    hasRestrictionsCheck ||
    restrictionsText !== '' ||
    hasPickups ||
    hasParentSignatureDate ||
    (!isNaN(ageVal) && ageVal < 18);

  if (isYouth) {
    data.participantType = 'youth';
    data.bbDevice = hasBBCheck;
    data.participantRestrictions = hasRestrictionsCheck ? true : false;
    data.restrictionsText = restrictionsText;
  } else {
    data.participantType = 'adult';
  }

  // Gender/Sex (Check Box 3)
  try {
    const genderField = form.getField('Check Box 3');
    const genderSymbol = genderField.acroField.dict.get(PDFName.of('V'));
    if (genderSymbol instanceof PDFName) {
      const valStr = genderSymbol.decodeText();
      if (valStr === 'Yes') data.gender = 'male';
      else if (valStr === 'No') data.gender = 'female';
    }
  } catch {}

  // Insurance
  data.insuranceCompany = getTextFieldVal('Health/Accident Insurance Company');
  data.insurancePolicy = getTextFieldVal('Policy No');

  // Emergency Contacts
  data.emergencyName = getTextFieldVal('Emergency Name');
  data.emergencyRelationship = getTextFieldVal('Emergency Relationship');
  data.emergencyPhone = getTextFieldVal('Emergency Home phone');
  data.emergencyAddress = getTextFieldVal('Emergency Address');
  data.emergencyOtherPhone = getTextFieldVal('Emergency Other phone');
  data.emergencyAltName = getTextFieldVal('Emergency Alternate contact name');
  data.emergencyAltPhone = getTextFieldVal("Emergency alternate's phone");

  // Authorized / Unauthorized Pickups
  if (data.participantType === 'youth') {
    data.authPickupName1 = getTextFieldVal('Name of authorized');
    data.authPickupPhone1 = getTextFieldVal('Phone of authorized');
    data.authPickupName2 = getTextFieldVal('Name of authorized 2');
    data.authPickupPhone2 = getTextFieldVal('Phone of authorized 2');
    data.notAuthPickupName1 = getTextFieldVal('Name of not authorized');
    data.notAuthPickupPhone1 = getTextFieldVal('Phone of not authorized');
    data.notAuthPickupName2 = getTextFieldVal('Name of not authorized 2');
    data.notAuthPickupPhone2 = getTextFieldVal('Phone of not authorized 2');
  }

  // Height / Weight (Convert height from total inches back to Ft/In)
  const heightTotalStr = getTextFieldVal('Height');
  if (heightTotalStr) {
    const totalInches = parseInt(heightTotalStr, 10);
    if (!isNaN(totalInches) && totalInches > 0) {
      data.heightFt = Math.floor(totalInches / 12).toString();
      data.heightIn = (totalInches % 12).toString();
    }
  }
  data.weight = getTextFieldVal('Weight');

  // Allergies
  data.allergyFood = getYesNoCheckVal('Food');
  data.allergyFoodExp = getTextFieldVal('Food explanation');
  data.allergyMedication = getYesNoCheckVal('Medication');
  data.allergyMedicationExp = getTextFieldVal('Medication explanation');
  data.allergyPlants = getYesNoCheckVal('Plants');
  data.allergyPlantsExp = getTextFieldVal('Plants explanation');
  data.allergyBugs = getYesNoCheckVal('Bugs');
  data.allergyBugsExp = getTextFieldVal('Bugs explanation');
  data.allergyOtherExp = getTextFieldVal('Other explanation');

  // Reconstruct allergyOther and hasAllergies (allergyOther checkbox isn't in PDF, so we infer it from explanation)
  data.allergyOther = !!data.allergyOtherExp;
  data.hasAllergies = !!(
    data.allergyFood ||
    data.allergyMedication ||
    data.allergyPlants ||
    data.allergyBugs ||
    data.allergyOther
  );

  data.epinephrine = getYesNoCheckVal('Epinephrine');
  data.autoinjectorExpDate = getTextFieldVal('Autoinjector exp date');

  // Conditions
  data.condAsthma = getYesNoCheckVal('Asthma');
  data.rescueInhaler = getYesNoCheckVal('Rescue inhaler');
  data.inhalerExpDate = getTextFieldVal('Inhaler exp date');
  data.lastAsthmaAttack = getTextFieldVal('Last attack date');
  data.condDiabetes = getYesNoCheckVal('Diabetes');
  data.diabetesExplanation = getTextFieldVal('Diabetes explanation');
  data.condInsulin = getCheckBoxVal('Insuliln');
  data.lastHbA1c = getTextFieldVal('Last HbA1c');
  data.condHeartDisease = getYesNoCheckVal('Heart disease');
  data.heartDiseaseExplanation = getTextFieldVal('Heart explanation');
  data.condHypertension = getYesNoCheckVal('Hypertension');
  data.hypertensionExplanation = getTextFieldVal('Hypertension explanation');
  data.condStroke = getYesNoCheckVal('Stroke');
  data.strokeExplanation = getTextFieldVal('Stroke explanation');
  data.condRespiratory = getYesNoCheckVal('Respiratory');
  data.lungExplanation = getTextFieldVal('Lung explanation');
  data.condCOPD = getYesNoCheckVal('COPD');
  data.copdExplanation = getTextFieldVal('COPD explanation');
  data.condSleep = getYesNoCheckVal('Sleep');
  data.condCPAP = getCheckBoxVal('CPAP 2');
  data.sleepExplanation = getTextFieldVal('Sleep explanation');
  data.condPsychiatric = getYesNoCheckVal('Psychiatric');
  data.psychiatricExplanation = getTextFieldVal('Psychiatric explanation');
  data.condNeurological = getYesNoCheckVal('Neurological');
  data.neurologicalExplanation = getTextFieldVal('Neurological explanation');
  data.condSeizures = getYesNoCheckVal('Seizures');
  data.lastSeizureDate = getTextFieldVal('Last seizure date');
  data.condFainting = getYesNoCheckVal('Fainting');
  data.faintingExplanation = getTextFieldVal('Fainting explanation');
  data.condStomach = getYesNoCheckVal('Stomach');
  data.stomachExplanation = getTextFieldVal('Stomach explanation');
  data.condKidney = getYesNoCheckVal('Kidney');
  data.kidneyExplanation = getTextFieldVal('Kidney explanation');
  data.condSkin = getYesNoCheckVal('Skin issues');
  data.skinExplanation = getTextFieldVal('Skin explanation');
  data.condThyroid = getYesNoCheckVal('Thyroid');
  data.thyroidExplanation = getTextFieldVal('Thyroid explanation');
  data.condBlood = getYesNoCheckVal('Blood disorders');
  data.bloodExplanation = getTextFieldVal('Blood explanation');
  data.condEENSP = getYesNoCheckVal('EENSP');
  data.eenspExplanation = getTextFieldVal('EENS explanation');
  data.condMuscular = getYesNoCheckVal('Muscular/skeletal');
  data.muscularExplanation = getTextFieldVal('MSM explanation');
  data.condHeadInjury = getYesNoCheckVal('Head injury');
  data.headExplanation = getTextFieldVal('Head explanation');
  data.condAltitude = getYesNoCheckVal('Altitude');
  data.altitudeExplanation = getTextFieldVal('Altitude sickness explanation');
  data.condSurgeries = getYesNoCheckVal('Surgeries');
  data.lastSurgeryDate = getTextFieldVal('Last surgery date');
  data.condFamilyHistory = getYesNoCheckVal('Family history');
  data.familyHistoryExplanation = getTextFieldVal('Heart disease explanation');
  data.condOther = getYesNoCheckVal('Other');
  data.otherExplanation = getTextFieldVal('Other explanation');

  // Medications
  data.noMedications = getCheckBoxVal('No medications');
  if (!data.noMedications) {
    data.nonPrescriptionExceptions = getYesNoCheckVal('Non-prescription exceptions');
    data.nonPrescriptionExceptionsText = getTextFieldVal('Non-prescrip exceptions');
    data.medicationsAdditionalSpace = getCheckBoxVal('Additional space');

    const meds = [];
    for (let idx = 1; idx <= 6; idx++) {
      const medication = getTextFieldVal(`Medication ${idx}`);
      const dose = getTextFieldVal(`Dose ${idx}`);
      const frequency = getTextFieldVal(`Frequency ${idx}`);
      const reason = getTextFieldVal(`Reason ${idx}`);
      if (medication || dose || frequency || reason) {
        meds.push({ medication, dose, frequency, reason });
      }
    }
    data.medications = meds;
  } else {
    data.medications = [];
  }

  // Immunizations
  data.exemptionToImmunizations = getYesNoCheckVal('Exemption to immunizations');
  data.immOtherExemption = getTextFieldVal('Exemption to other');
  data.immOtherExemptionDate = getTextFieldVal('Exemption date');

  data.immTetanus = getYesNoCheckVal('Tetanus');
  data.immTetanusDate = getTextFieldVal('Tetanus date');
  data.hadTetanus = getTextFieldVal('Had tetanus');

  data.immPertussis = getYesNoCheckVal('Pertussis');
  data.immPertussisDate = getTextFieldVal('Pertussis date');
  data.hadPertussis = getTextFieldVal('Had pertussis');

  data.immDiphtheria = getYesNoCheckVal('Diphtheria');
  data.immDiphtheriaDate = getTextFieldVal('Diphtheria date');
  data.hadDiphtheria = getTextFieldVal('Had diphtheria');

  data.immPolio = getYesNoCheckVal('Polio');
  data.immPolioDate = getTextFieldVal('Polio date');
  data.hadPolio = getTextFieldVal('Had Polio');

  data.immMMR = getYesNoCheckVal('Measles/mumps/rubella');
  data.immMMRDate = getTextFieldVal('MMR date');
  data.hadMMR = getTextFieldVal('Had MMR');

  data.immChickenPox = getYesNoCheckVal('Chicken Pox');
  data.immChickenPoxDate = getTextFieldVal('Chicken pox date');
  data.hadChickenPox = getTextFieldVal('Had chicken pox');

  data.immHepA = getYesNoCheckVal('Hepatitis A');
  data.immHepADate = getTextFieldVal('Hep A date');
  data.hadHepA = getTextFieldVal('Had HA');

  data.immHepB = getYesNoCheckVal('Hepatitis B');
  data.immHepBDate = getTextFieldVal('Hep B date');
  data.hadHepB = getTextFieldVal('Had HB');

  data.immMeningitis = getYesNoCheckVal('Meningitis');
  data.immMeningitisDate = getTextFieldVal('Meningitis date');
  data.hadMeningitis = getTextFieldVal('Had Pertussis');

  data.immInfluenza = getYesNoCheckVal('Influenza');
  data.immInfluenzaDate = getTextFieldVal('Influenza date');
  data.hadInfluenza = getTextFieldVal('Had Meningitis');

  data.immOther = getYesNoCheckVal('Other (i.e. HIB)');
  data.immOtherDate = getTextFieldVal('Other date');
  data.hadOther = getTextFieldVal('Had other');

  // Med history lines (Reconstruct the wrapped text using spaces)
  const historyLines: string[] = [];
  for (let idx = 1; idx <= 7; idx++) {
    const line = getTextFieldVal(`Med history ${idx}`).trim();
    if (line) historyLines.push(line);
  }
  data.additionalMedicalHistory = historyLines.join(' ');

  // Signatures default settings (user will re-sign on canvas or select sign later)
  data.willSignLater = false;
  data.willParticipantSignLater = false;
  data.willSignMedsLater = false;

  // Set dates from PDF if available, otherwise default to today
  const today = new Date().toISOString().split('T')[0];
  const parsedParentDate = getTextFieldVal('Date of birth 3');
  const parsedParticipantDate = getTextFieldVal("Parent's signature date");

  data.parentSignatureDate = parsedParentDate || today;
  data.participantSignatureDate = parsedParticipantDate || today;

  return data;
}
