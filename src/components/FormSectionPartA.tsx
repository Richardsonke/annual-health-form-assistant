import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { FormField } from './FormField';

export const FormSectionPartA: React.FC = () => {
  const { register, control, setValue, formState: { errors } } = useFormContext();
  const participantType = useWatch({ control, name: 'participantType' });
  const participantRestrictions = useWatch({ control, name: 'participantRestrictions' });

  return (
    <div className="form-card">
      <h2 className="section-title">Part A: Informed Consent, Release Agreement, and Authorization</h2>

      {/* Youth vs Adult Selector */}
      <div className="form-group" style={{ marginBottom: '2rem' }}>
        <label className="form-label" style={{ fontWeight: 600 }}>Participant Type</label>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <label className="checkbox-group" style={{
            padding: '0.85rem 1.5rem',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            flex: '1 1 200px',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer',
            borderColor: participantType === 'youth' ? 'var(--primary-color)' : 'var(--border-color)',
            backgroundColor: participantType === 'youth' ? 'var(--primary-light)' : 'transparent'
          }}>
            <input type="radio" value="youth" className="checkbox-input" style={{ borderRadius: '50%' }} {...register('participantType')} />
            <span style={{ fontWeight: 600, color: participantType === 'youth' ? 'var(--primary-color)' : 'var(--text-main)' }}>Youth Participant</span>
          </label>

          <label className="checkbox-group" style={{
            padding: '0.85rem 1.5rem',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            flex: '1 1 200px',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer',
            borderColor: participantType === 'adult' ? 'var(--primary-color)' : 'var(--border-color)',
            backgroundColor: participantType === 'adult' ? 'var(--primary-light)' : 'transparent'
          }}>
            <input type="radio" value="adult" className="checkbox-input" style={{ borderRadius: '50%' }} {...register('participantType')} />
            <span style={{ fontWeight: 600, color: participantType === 'adult' ? 'var(--primary-color)' : 'var(--text-main)' }}>Adult Participant / Leader</span>
          </label>
        </div>
        {errors.participantType && (
          <span className="error-message" style={{ marginTop: '0.5rem' }}>
            <AlertCircle size={16} />
            {errors.participantType.message?.toString()}
          </span>
        )}
      </div>

      <h3 className="section-title" style={{ fontSize: '1.2rem', marginTop: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
        Participant Information
      </h3>
      <div className="form-grid-2">
        <FormField name="fullName" label="Full Name" placeholder="e.g., Alex Johnson" />
        <FormField name="dateOfBirth" label="Date of Birth" type="date" />
      </div>

      <div className="form-grid-3" style={{ marginTop: '0.5rem' }}>
        <FormField name="age" label="Age" type="number" />
        <div className="form-group">
          <label className="form-label" htmlFor="gender">Sex</label>
          <select id="gender" className={`form-input ${errors.gender ? 'error' : ''}`} {...register('gender')}>
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && (
            <span className="error-message">
              <AlertCircle size={16} />
              {errors.gender.message?.toString()}
            </span>
          )}
        </div>
        <FormField name="phone" label="Phone Number" placeholder="555-555-5555" />
      </div>

      <div className="form-group" style={{ marginTop: '0.5rem' }}>
        <FormField name="address" label="Address" />
      </div>

      <div className="form-grid-2">
        <FormField name="city" label="City" />
        <FormField name="state" label="State" />
        <FormField name="zipCode" label="ZIP Code" />
      </div>

      <h3 className="section-title" style={{ fontSize: '1.2rem', marginTop: '2rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
        Scouting Information
      </h3>
      <div className="form-grid-2">
        <FormField name="unitNo" label="Unit Number" placeholder="e.g., Troop 123" />
        <FormField name="councilName" label="Council Name/Number" placeholder="e.g., Greater Alabama Council" />
      </div>
      <div className="form-grid-2" style={{ marginTop: '0.5rem' }}>
        <FormField name="unitLeader" label="Unit Leader Name" placeholder="e.g., John Smith" />
        <FormField name="unitLeaderPhone" label="Unit Leader Mobile #" placeholder="555-555-5555" />
      </div>

      <div style={{
        backgroundColor: '#F1F5F9',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        marginTop: '2rem',
        marginBottom: '2rem'
      }}>
        <h3 className="section-title" style={{ 
          fontSize: '1.2rem', 
          marginTop: '0', 
          color: 'var(--text-main)', 
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem',
          marginBottom: '1rem'
        }}>
          High-Adventure Base Participants Only (optional)
        </h3>
        <div className="form-grid-2">
          <FormField name="expeditionCrewNo" label="Expedition/Crew No." placeholder="e.g., Philmont Crew 715-A" />
          <FormField name="staffPosition" label="Staff Position (if applicable)" placeholder="e.g., Counselor" />
        </div>
      </div>

      <h3 className="section-title" style={{ fontSize: '1.2rem', marginTop: '2rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
        Health &amp; Accident Insurance Details
      </h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
        Please attach a photocopy of both sides of the insurance card. If you do not have medical insurance, enter “none” below.
      </p>
      <div className="form-grid-2">
        <FormField name="insuranceCompany" label="Health/Accident Insurance Company" placeholder="e.g., Blue Cross" />
        <FormField name="insurancePolicy" label="Policy Number" placeholder="e.g., X12345Y" />
      </div>

      <h3 className="section-title" style={{ fontSize: '1.2rem', marginTop: '2rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
        Emergency Contacts
      </h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
        In case of emergency, notify the person below:
      </p>
      <div className="form-grid-2" style={{ gap: '2rem' }}>
        <div>
          <h4 style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--primary-color)' }}>Primary Emergency Contact</h4>
          <FormField name="emergencyName" label="Contact Name" placeholder="e.g., Jane Johnson" />
          <FormField name="emergencyRelationship" label="Relationship" placeholder="e.g., Parent" />
          <FormField name="emergencyPhone" label="Primary Home Phone" placeholder="555-555-5555" />
          <FormField name="emergencyOtherPhone" label="Other Phone" placeholder="555-555-5555" />
          <FormField name="emergencyAddress" label="Address" placeholder="e.g., 123 Emergency Way, City, ST 12345" />
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--primary-color)' }}>Alternate Contact</h4>
          <FormField name="emergencyAltName" label="Alternate Contact Name" placeholder="e.g., Bob Johnson" />
          <FormField name="emergencyAltPhone" label="Alternate Phone" placeholder="555-555-5555" />
        </div>
      </div>

      {participantType === 'youth' && (
        <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
          <h3 className="section-title" style={{ fontSize: '1.2rem', marginTop: '2.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
            Authorized / Unauthorized Transportation Pickups (optional)
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Specify who is authorized or NOT authorized to take the participant to and from events. You must designate at least one adult. Please include a phone number.
          </p>
          <table className="form-table table-responsive-pickups">
            <thead>
              <tr>
                <th style={{ width: '50%', fontWeight: 600 }}>Authorized Persons</th>
                <th className="col-header-not-auth" style={{ width: '50%', fontWeight: 600 }}>NOT Authorized Persons</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col-auth">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <FormField name="authPickupName1" placeholder="1. Full Name" containerClass="form-table-group" />
                    <FormField name="authPickupPhone1" placeholder="Phone Number" containerClass="form-table-group" />
                  </div>
                </td>
                <td className="col-not-auth" style={{ backgroundColor: '#F1F5F9' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <FormField name="notAuthPickupName1" placeholder="1. Full Name" containerClass="form-table-group" />
                    <FormField name="notAuthPickupPhone1" placeholder="Phone Number" containerClass="form-table-group" />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="col-auth">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <FormField name="authPickupName2" placeholder="2. Full Name" containerClass="form-table-group" />
                    <FormField name="authPickupPhone2" placeholder="Phone Number" containerClass="form-table-group" />
                  </div>
                </td>
                <td className="col-not-auth" style={{ backgroundColor: '#F1F5F9' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <FormField name="notAuthPickupName2" placeholder="2. Full Name" containerClass="form-table-group" />
                    <FormField name="notAuthPickupPhone2" placeholder="Phone Number" containerClass="form-table-group" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* BB Device & Participant Restrictions */}
      <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {participantType === 'youth' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'fadeInUp 0.3s ease-out' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
              Every person who furnishes any BB device to any minor, without the express or implied permission
              of the parent or legal guardian of the minor, is guilty of a misdemeanor. (California Penal Code
              Section 19915[a]) My signature below on this form indicates my permission.
              <span style={{ display: 'block', marginTop: '0.5rem' }}>
                I give permission for my child to use a BB device. (Note: Not all events will include BB devices.)
              </span>
            </p>
            <label className="checkbox-group" style={{ alignItems: 'flex-start', gap: '0.75rem' }}>
              <input
                type="checkbox"
                className="checkbox-input"
                style={{ marginTop: '2px', flexShrink: 0 }}
                {...register('bbDevice')}
              />
              <span style={{ lineHeight: 1.5 }}>
                <strong>DO NOT</strong> want child to use a BB device
              </span>
            </label>
          </div>
        )}

        {participantType === 'youth' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'fadeInUp 0.3s ease-out' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
              <strong>NOTE:</strong> Due to the nature of programs and activities, the Boy Scouts of America
              and local councils cannot continually monitor compliance of program
              participants or any limitations imposed upon them by parents or medical
              providers. However, so that leaders can be as familiar as possible with any
              limitations, list any restrictions imposed on a child participant in connection
              with programs or activities below.
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '2rem', 
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: errors.participantRestrictions ? '2px solid var(--error-color)' : '2px solid transparent',
              backgroundColor: errors.participantRestrictions ? 'var(--error-bg)' : 'transparent',
              transition: 'all var(--transition-fast)'
            }}>
              <label className="checkbox-group" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={participantRestrictions === true}
                  onChange={() => {
                    setValue('participantRestrictions', participantRestrictions === true ? undefined : true, { shouldDirty: true });
                    setValue('restrictionsText', ''); // Clear description text if None is selected
                  }}
                />
                <span>None</span>
              </label>

              <label className="checkbox-group" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={participantRestrictions === false}
                  onChange={() => setValue('participantRestrictions', participantRestrictions === false ? undefined : false, { shouldDirty: true })}
                />
                <span>Restrictions apply</span>
              </label>
            </div>
            
            {errors.participantRestrictions && (
              <span className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '-0.25rem' }}>
                <AlertCircle size={16} />
                {errors.participantRestrictions.message?.toString()}
              </span>
            )}

            {participantRestrictions === false && (
              <div style={{ marginTop: '0.25rem', animation: 'fadeInUp 0.2s ease-out' }}>
                <FormField
                  name="restrictionsText"
                  placeholder="Describe any restrictions on programs or activities..."
                  containerClass="form-group"
                />
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
