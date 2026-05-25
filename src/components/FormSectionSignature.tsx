import { useFormContext, useWatch } from 'react-hook-form';
import { SignaturePad } from './SignaturePad';
import { FormField } from './FormField';

export const FormSectionSignature = () => {
  const { control } = useFormContext();
  const participantType = useWatch({ control, name: 'participantType' });
  const willSignLater = useWatch({ control, name: 'willSignLater' });
  const willParticipantSignLater = useWatch({ control, name: 'willParticipantSignLater' });
  const showParentConsent = participantType !== 'adult';

  return (
    <div className="form-card">
      <h2 className="section-title">Part A: Consent &amp; Signatures</h2>

      {/* Consent text verbatim from the official form */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem 1.75rem',
        marginBottom: '2rem',
        fontSize: '0.875rem',
        lineHeight: '1.7',
        color: 'var(--text-muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <p>I understand that participation in Scouting activities involves the risk of personal injury, including death, due to the physical, mental, and emotional challenges in the activities offered. Information about those activities may be obtained from the venue, activity coordinators, or your local council. I also understand that participation in these activities is entirely voluntary and requires participants to follow instructions and abide by all applicable rules and the standards of conduct.</p>
        <p>In case of an emergency involving me or my child, I understand that efforts will be made to contact the individual listed as the emergency contact person by the medical provider and/or adult leader. In the event that this person cannot be reached, permission is hereby given to the medical provider selected by the adult leader in charge to secure proper treatment, including hospitalization, anesthesia, surgery, or injections of medication for me or my child. Medical providers are authorized to disclose protected health information to the adult in charge, camp medical staff, camp management, and/or any physician or health-care provider involved in providing medical care to the participant. Protected Health Information/Confidential Health Information (PHI/CHI) under the Standards for Privacy of Individually Identifiable Health Information, 45 C.F.R. §§160.103, 164.501, etc. seq., as amended from time to time, includes examination findings, test results, and treatment provided for purposes of medical evaluation of the participant, follow-up and communication with the participant's parents or guardian, and/or determination of the participant's ability to continue in the program activities.</p>
        <p>(If applicable) I have carefully considered the risk involved and hereby give my informed consent for my child to participate in all activities offered in the program. I further authorize the sharing of the information on this form with any BSA volunteers or professionals who need to know of medical conditions that may require special consideration in conducting Scouting activities.</p>
        <p>With appreciation of the dangers and risks associated with programs and activities, on my own behalf and/or on behalf of my child, I hereby fully and completely release and waive any and all claims for personal injury, death, or loss that may arise against the Boy Scouts of America, the local council, the activity coordinators, and all employees, volunteers, related parties, or other organizations associated with any program or activity.</p>
        <p>I also hereby assign and grant to the local council and the Boy Scouts of America, as well as their authorized representatives, the right and permission to use and publish the photographs/film/videotapes/electronic representations and/or sound recordings made of me or my child at all Scouting activities, and I hereby release the Boy Scouts of America, the local council, the activity coordinators, and all employees, volunteers, related parties, or other organizations associated with the activity from any and all liability from such use and publication. I further authorize the reproduction, sale, copyright, exhibit, broadcast, electronic storage, and/or distribution of said photographs/film/videotapes/electronic representations and/or sound recordings without limitation at the discretion of the BSA, and I specifically waive any right to any compensation I may have for any of the foregoing.</p>
        <p>I understand that, if any information I/we have provided is found to be inaccurate, it may limit and/or eliminate the opportunity for participation in any event or activity. If I am participating at Philmont Scout Ranch, Philmont Training Center, Northern Tier, Sea Base, or the Summit Bechtel Reserve, I have also read and understand the supplemental risk advisories, including height and weight requirements and restrictions, and understand that the participant will not be allowed to participate in applicable high-adventure programs if those requirements are not met. The participant has permission to engage in all high-adventure activities described, except as specifically noted by me or the health-care provider. If the participant is under the age of 18, a parent or guardian's signature is required.</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {showParentConsent && (
          <div>
            <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--primary-color)' }}>Parent/Guardian Consent</h3>
            <SignaturePad 
              name="signatureData" 
              willSignLaterName="willSignLater" 
              label="Parent/Guardian Signature" 
              willSignLaterLabel="I will sign with a pen after printing"
            />
            {!willSignLater && (
              <div style={{ marginTop: '1rem', animation: 'fadeInUp 0.2s ease-out' }}>
                <FormField name="parentSignatureDate" label="Date Signed" type="date" disabled={true} />
              </div>
            )}
          </div>
        )}

        {showParentConsent && <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0' }} />}
        
        <div>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--primary-color)' }}>Participant Consent</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            The participant must sign to acknowledge the code of conduct and safety rules.
          </p>
          <SignaturePad 
            name="participantSignatureData" 
            willSignLaterName="willParticipantSignLater" 
            label="Participant's Signature" 
            willSignLaterLabel="Participant will sign with a pen after printing"
          />
          {!willParticipantSignLater && (
            <div style={{ marginTop: '1rem', animation: 'fadeInUp 0.2s ease-out' }}>
              <FormField name="participantSignatureDate" label="Date Signed" type="date" disabled={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
