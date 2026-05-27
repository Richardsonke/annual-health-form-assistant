import { PDFDocument, PDFName } from 'pdf-lib';
import type { HealthFormData } from '../schema/formSchema';

export function wrapText(text: string, maxLineLength: number = 70): string[] {
  if (!text) return [];
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);
    let currentLine = '';
    
    for (const word of words) {
      if (!word) continue;
      
      if (word.length > maxLineLength) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        let remaining = word;
        while (remaining.length > maxLineLength) {
          lines.push(remaining.substring(0, maxLineLength));
          remaining = remaining.substring(maxLineLength);
        }
        currentLine = remaining;
      } else {
        if (!currentLine) {
          currentLine = word;
        } else if (currentLine.length + 1 + word.length <= maxLineLength) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  
  return lines;
}

export async function generateHealthFormPDF(data: HealthFormData): Promise<Blob> {
  const url = './680-001_AB.pdf';
  
  let existingPdfBytes: ArrayBuffer;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    existingPdfBytes = await res.arrayBuffer();
  } catch (err: any) {
    throw new Error(`Failed to load PDF template from '${url}': ${err?.message || err}`);
  }

  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(existingPdfBytes);
  } catch (err: any) {
    throw new Error(`Failed to parse PDF document. The template file might be corrupted or invalid: ${err?.message || err}`);
  }

  let form;
  try {
    form = pdfDoc.getForm();
  } catch (err: any) {
    throw new Error(`Failed to access interactive form fields: ${err?.message || err}`);
  }

  const setText = (fieldName: string, value: string) => {
    try {
      const field = form.getTextField(fieldName);
      if (field && value) field.setText(value);
    } catch (e) {
      // ignore
    }
  };

  const setCheck = (fieldName: string, value: boolean) => {
    try {
      const field = form.getCheckBox(fieldName);
      if (field) {
        if (value) field.check();
        else field.uncheck();
      }
    } catch (e) {
      // ignore
    }
  };

  const setYesNoCheck = (fieldName: string, value: boolean | undefined) => {
    try {
      const field = form.getField(fieldName);
      if (field) {
        let targetVal = 'Off';
        if (value === true) targetVal = 'Yes';
        else if (value === false) targetVal = 'No';

        // Set value in the field dictionary
        if (targetVal === 'Off') {
          field.acroField.dict.delete(PDFName.of('V'));
        } else {
          field.acroField.dict.set(PDFName.of('V'), PDFName.of(targetVal));
        }

        // Set appearance state (/AS) of each widget
        const widgets = field.acroField.getWidgets();
        for (let i = 0; i < widgets.length; i++) {
          const widget = widgets[i];
          const onValue = widget.getOnValue();
          if (onValue && onValue.toString() === `/${targetVal}`) {
            widget.dict.set(PDFName.of('AS'), PDFName.of(targetVal));
          } else {
            widget.dict.set(PDFName.of('AS'), PDFName.of('Off'));
          }
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // Page 1: BB device & participant restrictions (Youth only)
  if (data.participantType !== 'adult') {
    setCheck('Check Box 1', data.bbDevice === true);
    setCheck('Check Box 2', data.participantRestrictions === true);
    setText('Date of birth 1', data.restrictionsText || '');
  }

  // Sex/Gender: Check Box 3 has 2 widgets — Widget 0 (/Yes = Male), Widget 1 (/No = Female)
  // Must set both the field V dict entry AND the AS appearance state on each widget.
  try {
    const genderField = form.getField('Check Box 3');
    if (genderField) {
      let selectedValue: string;
      if (data.gender === 'male') {
        selectedValue = 'Yes';
      } else if (data.gender === 'female') {
        selectedValue = 'No';
      } else {
        selectedValue = 'Off';
      }
      // Set the field value
      if (selectedValue === 'Off') {
        genderField.acroField.dict.delete(PDFName.of('V'));
      } else {
        genderField.acroField.dict.set(PDFName.of('V'), PDFName.of(selectedValue));
      }
      // Update the appearance state of each widget individually
      const widgets = genderField.acroField.getWidgets();
      for (const widget of widgets) {
        const onValue = widget.getOnValue();
        if (onValue && onValue.toString() === `/${selectedValue}`) {
          widget.dict.set(PDFName.of('AS'), PDFName.of(selectedValue));
        } else {
          widget.dict.set(PDFName.of('AS'), PDFName.of('Off'));
        }
      }
    }
  } catch (e) {
    // ignore
  }

  setText('Full name', data.fullName);
  setText('Date of birth', data.dateOfBirth);
  setText('Age', data.age);
  setText('Address', data.address);
  setText('City', data.city);
  setText('State', data.state);
  setText('ZIP code', data.zipCode);
  setText('Phone', data.phone);
  setText('Unit No', data.unitNo);
  setText('Council Name/No', data.councilName);
  setText('Expedition/crew No', data.expeditionCrewNo || '');
  setText('Unit leader', data.unitLeader || '');
  setText('Unit leader\'s mobile #', data.unitLeaderPhone || '');
  setText('staff position', data.staffPosition || '');

  // Part A Insurance
  setText('Health/Accident Insurance Company', data.insuranceCompany || '');
  setText('Policy No', data.insurancePolicy || '');

  // Part A Emergency Contacts
  setText('Emergency Name', data.emergencyName);
  setText('Emergency Relationship', data.emergencyRelationship);
  setText('Emergency Home phone', data.emergencyPhone);
  setText('Emergency Address', data.emergencyAddress || '');
  setText('Emergency Other phone', data.emergencyOtherPhone || '');
  setText('Emergency Alternate contact name', data.emergencyAltName || '');
  setText('Emergency alternate\'s phone', data.emergencyAltPhone || '');

  // Part A Pickups (Youth only)
  if (data.participantType !== 'adult') {
    setText('Name of authorized', data.authPickupName1 || '');
    setText('Phone of authorized', data.authPickupPhone1 || '');
    setText('Name of authorized 2', data.authPickupName2 || '');
    setText('Phone of authorized 2', data.authPickupPhone2 || '');
    setText('Name of not authorized', data.notAuthPickupName1 || '');
    setText('Phone of not authorized', data.notAuthPickupPhone1 || '');
    setText('Name of not authorized 2', data.notAuthPickupName2 || '');
    setText('Phone of not authorized 2', data.notAuthPickupPhone2 || '');
  }

  let heightTotal = '';
  if (data.heightFt || data.heightIn) {
    const ft = parseInt(data.heightFt || '0', 10);
    const inch = parseInt(data.heightIn || '0', 10);
    const total = ft * 12 + inch;
    if (!isNaN(total) && total > 0) {
      heightTotal = total.toString();
    }
  }
  setText('Height', heightTotal);
  setText('Weight', data.weight || '');

  // Part B Allergies
  setYesNoCheck('Food', data.allergyFood);
  setText('Food explanation', data.allergyFoodExp || '');
  setYesNoCheck('Medication', data.allergyMedication);
  setText('Medication explanation', data.allergyMedicationExp || '');
  setYesNoCheck('Plants', data.allergyPlants);
  setText('Plants explanation', data.allergyPlantsExp || '');
  setYesNoCheck('Bugs', data.allergyBugs);
  setText('Bugs explanation', data.allergyBugsExp || '');
  setYesNoCheck('Epinephrine', data.epinephrine);
  setText('Autoinjector exp date', data.autoinjectorExpDate || '');

  // Part B Conditions
  setYesNoCheck('Asthma', data.condAsthma);
  setYesNoCheck('Rescue inhaler', data.rescueInhaler);
  setText('Inhaler exp date', data.inhalerExpDate || '');
  setText('Last attack date', data.lastAsthmaAttack || '');
  
  setYesNoCheck('Diabetes', data.condDiabetes);
  setText('Diabetes explanation', data.diabetesExplanation || '');
  setCheck('Insuliln', data.condInsulin === true);
  setText('Last HbA1c', data.lastHbA1c || '');
  
  setYesNoCheck('Heart disease', data.condHeartDisease);
  setText('Heart explanation', data.heartDiseaseExplanation || '');
  
  setYesNoCheck('Hypertension', data.condHypertension);
  setText('Hypertension explanation', data.hypertensionExplanation || '');

  setYesNoCheck('Stroke', data.condStroke);
  setText('Stroke explanation', data.strokeExplanation || '');

  setYesNoCheck('Respiratory', data.condRespiratory);
  setText('Lung explanation', data.lungExplanation || '');

  setYesNoCheck('COPD', data.condCOPD);
  setText('COPD explanation', data.copdExplanation || '');

  setYesNoCheck('Sleep', data.condSleep);
  setCheck('CPAP 2', data.condCPAP === true);
  setText('Sleep explanation', data.sleepExplanation || '');
  
  setYesNoCheck('Psychiatric', data.condPsychiatric);
  setText('Psychiatric explanation', data.psychiatricExplanation || '');
  
  setYesNoCheck('Neurological', data.condNeurological);
  setText('Neurological explanation', data.neurologicalExplanation || '');

  setYesNoCheck('Seizures', data.condSeizures);
  setText('Last seizure date', data.lastSeizureDate || '');
  
  setYesNoCheck('Fainting', data.condFainting);
  setText('Fainting explanation', data.faintingExplanation || '');
  
  setYesNoCheck('Stomach', data.condStomach);
  setText('Stomach explanation', data.stomachExplanation || '');

  setYesNoCheck('Kidney', data.condKidney);
  setText('Kidney explanation', data.kidneyExplanation || '');
  
  setYesNoCheck('Skin issues', data.condSkin);
  setText('Skin explanation', data.skinExplanation || '');

  setYesNoCheck('Thyroid', data.condThyroid);
  setText('Thyroid explanation', data.thyroidExplanation || '');

  setYesNoCheck('Blood disorders', data.condBlood);
  setText('Blood explanation', data.bloodExplanation || '');

  setYesNoCheck('EENSP', data.condEENSP);
  setText('EENS explanation', data.eenspExplanation || '');

  setYesNoCheck('Muscular/skeletal', data.condMuscular);
  setText('MSM explanation', data.muscularExplanation || '');

  setYesNoCheck('Head injury', data.condHeadInjury);
  setText('Head explanation', data.headExplanation || '');
  
  setYesNoCheck('Altitude', data.condAltitude);
  setText('Altitude sickness explanation', data.altitudeExplanation || '');

  setYesNoCheck('Surgeries', data.condSurgeries);
  setText('Last surgery date', data.lastSurgeryDate || '');

  setYesNoCheck('Family history', data.condFamilyHistory);
  setText('Heart disease explanation', data.familyHistoryExplanation || '');

  setYesNoCheck('Other', data.condOther);
  if (data.otherExplanation) setText('Other explanation', data.otherExplanation);

  // Medications
  setCheck('No medications', data.noMedications);

  if (!data.noMedications) {
    setYesNoCheck('Non-prescription exceptions', data.nonPrescriptionExceptions);
    setText('Non-prescrip exceptions', data.nonPrescriptionExceptionsText || '');
    setCheck('Additional space', data.medicationsAdditionalSpace);

    for (let idx = 1; idx <= 6; idx++) {
      const med = data.medications?.[idx - 1];
      setText(`Medication ${idx}`, med?.medication || '');
      setText(`Dose ${idx}`, med?.dose || '');
      setText(`Frequency ${idx}`, med?.frequency || '');
      setText(`Reason ${idx}`, med?.reason || '');
    }
  }

  // Immunizations
  setYesNoCheck('Exemption to immunizations', data.exemptionToImmunizations);
  setText('Exemption to other', data.immOtherExemption || '');
  setText('Exemption date', data.immOtherExemptionDate || '');

  setYesNoCheck('Tetanus', data.immTetanus);
  setText('Tetanus date', data.immTetanusDate || '');
  setText('Had tetanus', data.hadTetanus || '');

  setYesNoCheck('Pertussis', data.immPertussis);
  setText('Pertussis date', data.immPertussisDate || '');
  setText('Had pertussis', data.hadPertussis || '');

  setYesNoCheck('Diphtheria', data.immDiphtheria);
  setText('Diphtheria date', data.immDiphtheriaDate || '');
  setText('Had diphtheria', data.hadDiphtheria || '');

  setYesNoCheck('Polio', data.immPolio);
  setText('Polio date', data.immPolioDate || '');
  setText('Had Polio', data.hadPolio || '');

  setYesNoCheck('Measles/mumps/rubella', data.immMMR);
  setText('MMR date', data.immMMRDate || '');
  setText('Had MMR', data.hadMMR || '');

  setYesNoCheck('Chicken Pox', data.immChickenPox);
  setText('Chicken pox date', data.immChickenPoxDate || '');
  setText('Had chicken pox', data.hadChickenPox || '');

  setYesNoCheck('Hepatitis A', data.immHepA);
  setText('Hep A date', data.immHepADate || '');
  setText('Had HA', data.hadHepA || '');

  setYesNoCheck('Hepatitis B', data.immHepB);
  setText('Hep B date', data.immHepBDate || '');
  setText('Had HB', data.hadHepB || '');

  setYesNoCheck('Meningitis', data.immMeningitis);
  setText('Meningitis date', data.immMeningitisDate || '');
  setText('Had Pertussis', data.hadMeningitis || '');

  setYesNoCheck('Influenza', data.immInfluenza);
  setText('Influenza date', data.immInfluenzaDate || '');
  setText('Had Meningitis', data.hadInfluenza || '');

  setYesNoCheck('Other (i.e. HIB)', data.immOther);
  setText('Other date', data.immOtherDate || '');
  setText('Had other', data.hadOther || '');

  // Split and map additional medical history to Med history 1 through Med history 7
  const medHistoryLines = wrapText(data.additionalMedicalHistory || '', 72);
  for (let i = 0; i < 7; i++) {
    setText(`Med history ${i + 1}`, medHistoryLines[i] || '');
  }

  // Signature Embedding Helper
  const embedSignature = async (sigData: string | undefined, willSignLater: boolean, fieldName: string, pageNum: number) => {
    if (!willSignLater && sigData) {
      try {
        const pngImage = await pdfDoc.embedPng(sigData);
        const sigField = form.getSignature(fieldName);
        const widgets = sigField.acroField.getWidgets();
        
        if (widgets.length > 0) {
          const widget = widgets[0];
          const rect = widget.getRectangle();
          const pages = pdfDoc.getPages();
          
          const imgWidth = pngImage.width;
          const imgHeight = pngImage.height;
          const scale = Math.min(rect.width / imgWidth, rect.height / imgHeight);
          
          const width = imgWidth * scale;
          const height = imgHeight * scale;
          const x = rect.x;
          const y = rect.y + (rect.height - height) / 2;

          pages[pageNum].drawImage(pngImage, {
            x,
            y,
            width,
            height,
          });
        }
      } catch (e: any) {
        throw new Error(`Error embedding signature '${fieldName}' on page ${pageNum + 1}: ${e?.message || e}`);
      }
    }
  };

  // Embed the three signatures
  if (data.participantType !== 'adult') {
    await embedSignature(data.signatureData, data.willSignLater, 'Parent/guardian signature', 0);
  }
  await embedSignature(data.participantSignatureData, data.willParticipantSignLater, "Participant's Signature", 0);
  if (data.participantType !== 'adult') {
    await embedSignature(data.medicationsSignature, data.willSignMedsLater, 'Parent/guardian medications', 2);
  }

  // Date Signed field mapping
  if (data.participantType !== 'adult' && !data.willSignLater) {
    setText("Date of birth 3", data.parentSignatureDate || '');
  }
  if (!data.willParticipantSignLater) {
    setText("Parent's signature date", data.participantSignatureDate || '');
  }

  try {
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes.buffer as BlobPart], { type: 'application/pdf' });
  } catch (err: any) {
    throw new Error(`Failed to compile and save PDF document: ${err?.message || err}`);
  }
}
