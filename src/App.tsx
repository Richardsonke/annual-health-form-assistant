import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, CheckCircle2, AlertCircle, X, CreditCard, PenLine, FileText, ExternalLink, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { formSchema, type HealthFormData } from './schema/formSchema';
import { COUNCILS } from './schema/councilsData';
import { FormSectionPartA } from './components/FormSectionPartA';
import { FormSectionPartB } from './components/FormSectionPartB';
import { FormSectionMedications } from './components/FormSectionMedications';
import { FormSectionImmunizations } from './components/FormSectionImmunizations';
import { FormSectionSignature } from './components/FormSectionSignature';
import { generateHealthFormPDF } from './lib/pdfGenerator';
import { parseHealthFormPDF } from './lib/pdfParser';
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeInUp 0.2s ease-out'
      }}
    >
      <div style={{
        background: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
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
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', flex: 1 }}>
          {/* Review responsibility warning — always first */}
          <div style={{
            display: 'flex', gap: '1rem', alignItems: 'flex-start',
            background: '#FFFBEB', borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem', border: '1px solid #FDE68A'
          }}>
            <AlertCircle size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 600, color: '#92400E', marginBottom: '0.25rem' }}>Important: Review Form Content</p>
              <p style={{ fontSize: '0.9rem', color: '#B45309', margin: 0 }}>
                You are responsible for reviewing the content of the generated health form for completeness and accuracy before submitting it.
              </p>
            </div>
          </div>

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

          {/* Additional sheet reminder */}
          {pendingData.medicationsAdditionalSpace && (
            <div style={{
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
              background: '#F0FDF4', borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem', border: '1px solid #BBF7D0'
            }}>
              <FileText size={22} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 600, color: '#166534', marginBottom: '0.25rem' }}>Include additional medication sheet</p>
                <p style={{ fontSize: '0.9rem', color: '#166534' }}>
                  You checked "Additional space is needed". Please attach a printed sheet listing all your additional medications (including name, dose, frequency, and reason) to the completed form.
                </p>
              </div>
            </div>
          )}

          {/* Immunization exemption request form reminder */}
          {pendingData.exemptionToImmunizations && (
            <div style={{
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
              background: '#FFFBEB', borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem', border: '1px solid #FDE68A'
            }}>
              <FileText size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 600, color: '#92400E', marginBottom: '0.25rem' }}>Include Immunization Exemption Form</p>
                <p style={{ fontSize: '0.9rem', color: '#B45309', margin: 0 }}>
                  You selected immunization exemption. You must attach the completed{' '}
                  <a
                    href="https://filestore.scouting.org/filestore/pdf/680-451.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#92400E', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    Immunization Exemption Request Form
                  </a>
                  {' '}to your completed health history form.
                </p>
              </div>
            </div>
          )}

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

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ title, message, onConfirm, onCancel }: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeInUp 0.2s ease-out'
      }}
    >
      <div style={{
        background: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          padding: '1.25rem 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={24} color="white" />
            <h2 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
              {title}
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
        <div style={{ padding: '1.75rem', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
          {message}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.75rem 1.5rem',
          display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '0.6rem 1.5rem' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary"
            style={{ 
              width: 'auto', 
              padding: '0.6rem 1.75rem', 
              background: '#D97706' 
            }}
          >
            Overwrite
          </button>
        </div>
      </div>
    </div>
  );
}

interface AlertModalProps {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

function AlertModal({ title, message, type, onClose }: AlertModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getHeaderGradient = () => {
    switch (type) {
      case 'success':
        return 'linear-gradient(135deg, #10B981, #059669)';
      case 'error':
        return 'linear-gradient(135deg, #EF4444, #DC2626)';
      case 'info':
      default:
        return 'linear-gradient(135deg, var(--primary-color), #7C3AED)';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={24} color="white" />;
      case 'error':
      case 'info':
      default:
        return <AlertCircle size={24} color="white" />;
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeInUp 0.2s ease-out'
      }}
    >
      <div style={{
        background: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: getHeaderGradient(),
          padding: '1.25rem 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {getIcon()}
            <h2 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.75rem', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
          {message}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.75rem 1.5rem',
          display: 'flex', justifyContent: 'flex-end',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ 
              width: 'auto', 
              padding: '0.6rem 1.75rem', 
              background: type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : 'var(--primary-color)' 
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

const getHashParam = (name: string): string => {
  if (typeof window === 'undefined') return '';
  const hash = window.location.hash.replace(/^#/, '');
  return new URLSearchParams(hash).get(name) || '';
};

// --- Leader Link Builder Modal ---
interface LeaderLinkModalProps {
  onClose: () => void;
}

function LeaderLinkModal({ onClose }: LeaderLinkModalProps) {
  const [unitNo, setUnitNo] = useState('');
  const [councilName, setCouncilName] = useState('');
  const [unitLeader, setUnitLeader] = useState('');
  const [unitLeaderPhone, setUnitLeaderPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.substring(0, 10);
    let formatted = '';
    if (value.length > 0) formatted += value.substring(0, 3);
    if (value.length > 3) formatted += '-' + value.substring(3, 6);
    if (value.length > 6) formatted += '-' + value.substring(6, 10);
    setUnitLeaderPhone(formatted);
    setGeneratedLink('');
    setPhoneError('');
  };

  const handleGenerate = () => {
    setPhoneError('');
    if (unitLeaderPhone.trim()) {
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
      if (!phoneRegex.test(unitLeaderPhone.trim())) {
        setPhoneError('Mobile number must be formatted as XXX-XXX-XXXX');
        return;
      }
    }

    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const params = new URLSearchParams();
    if (unitNo.trim()) params.set('unitNo', unitNo.trim());
    if (councilName) params.set('councilName', councilName);
    if (unitLeader.trim()) params.set('unitLeader', unitLeader.trim());
    if (unitLeaderPhone.trim()) params.set('unitLeaderPhone', unitLeaderPhone.trim());

    const url = `${origin}${pathname}#${params.toString()}`;
    setGeneratedLink(url);
    setCopied(false);

    // Scroll body to the bottom so the generated link block is fully visible
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTo({
          top: bodyRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeInUp 0.2s ease-out'
      }}
    >
      <div style={{
        background: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-color), #7C3AED)',
          padding: '1.5rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LinkIcon size={22} color="white" />
            <h2 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
              Leader Pre-filled Link Builder
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div ref={bodyRef} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', flex: 1 }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Enter your unit details below to build a customized link. Parents who click this link will have their form fields pre-filled automatically.
          </p>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Unit Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Troop/Pack/Crew 123"
              value={unitNo}
              onChange={e => { setUnitNo(e.target.value); setGeneratedLink(''); }}
              maxLength={20}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Council Name/Number</label>
            <select
              className="form-input"
              value={councilName}
              onChange={e => { setCouncilName(e.target.value); setGeneratedLink(''); }}
            >
              <option value="">Select Council...</option>
              {COUNCILS.map(c => (
                <option key={c.number} value={`${c.name} (#${c.number})`}>
                  {c.name} ({c.number})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Unit Leader Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., John Smith"
              value={unitLeader}
              onChange={e => { setUnitLeader(e.target.value); setGeneratedLink(''); }}
              maxLength={80}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Unit Leader Mobile #</label>
            <input
              type="tel"
              className={`form-input ${phoneError ? 'error' : ''}`}
              placeholder="XXX-XXX-XXXX"
              value={unitLeaderPhone}
              onChange={handlePhoneChange}
              maxLength={12}
            />
            {phoneError && (
              <span className="error-message">
                <AlertCircle size={16} />
                {phoneError}
              </span>
            )}
          </div>

          {generatedLink && (
            <div style={{
              background: 'var(--background-color)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginTop: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              animation: 'fadeInUp 0.3s ease-out'
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Generated Link:</span>
              <div style={{
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                wordBreak: 'break-all',
                color: 'var(--primary-color)',
                maxHeight: '80px',
                overflowY: 'auto'
              }}>
                {generatedLink}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-secondary"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                  borderColor: copied ? 'var(--secondary-color)' : 'var(--border-color)',
                  color: copied ? 'var(--secondary-color)' : 'var(--text-main)'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{
          padding: '1rem 2rem 1.5rem',
          display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
          >
            Close
          </button>
          <button
            onClick={handleGenerate}
            className="btn btn-primary"
            style={{ width: 'auto', padding: '0.75rem 1.75rem', background: 'var(--primary-color)' }}
          >
            <LinkIcon size={18} style={{ marginRight: '0.4rem' }} />
            Generate Link
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
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [appAlert, setAppAlert] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [supportEmail, setSupportEmail] = useState('support [at] health-form-filler');

  useEffect(() => {
    // Obfuscate email by reversing the string components to fool bot scrapers
    const rev = (s: string) => s.split('').reverse().join('');
    const u = rev('sdwxdhrne7');
    const d = rev('sneakemail') + '.' + rev('moc');
    setSupportEmail(u + '@' + d);
  }, []);

  const isTestMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('testmode') === '1';

  const methods = useForm<HealthFormData>({
    resolver: zodResolver(formSchema) as any,
    mode: 'onTouched',
    shouldFocusError: false,
    defaultValues: {
      hasAllergies: false,
      willSignLater: false,
      parentSignatureDate: getTodayDateString(),
      participantSignatureDate: getTodayDateString(),
      unitNo: getHashParam('unitNo'),
      councilName: getHashParam('councilName'),
      unitLeader: getHashParam('unitLeader'),
      unitLeaderPhone: getHashParam('unitLeaderPhone')
    }
  });

  const hasExistingData = () => {
    const values = methods.getValues();
    const ignoredKeys = [
      'hasAllergies', 'willSignLater', 'parentSignatureDate', 'participantSignatureDate',
      'unitNo', 'councilName', 'unitLeader', 'unitLeaderPhone', 'willParticipantSignLater', 'willSignMedsLater'
    ];
    
    return Object.keys(values).some(key => {
      if (ignoredKeys.includes(key)) return false;
      const val = values[key as keyof HealthFormData];
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === 'boolean') return val === true;
      return typeof val === 'string' && val.trim() !== '';
    }) || methods.formState.isDirty;
  };

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
      councilName: 'Dan Beard Council (#438)',
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
      allergyMedicationExp: 'Med Allergy (Penicillin) Explanation',
      allergyPlants: true,
      allergyPlantsExp: 'Plants Allergy (Poison Ivy) Expl.',
      allergyBugs: true,
      allergyBugsExp: 'Bug Allergy (Bee Stings) Explanation',
      epinephrine: true,
      autoinjectorExpDate: '12/28',
      heightFt: '5',
      heightIn: '5',
      weight: '120',
      condDiabetes: true,
      lastHbA1c: '6.5% on 04/26',
      condInsulin: true,
      condHypertension: true,
      hypertensionExplanation: 'Hypertension managed by diet, exercise, and daily lisinopril; blood pressure is monitored weekly. OK',
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
        { medication: 'Acetaminophen Extra Strength 5', dose: '1000mg tab', frequency: 'Every 4-6 hours as needed', reason: 'Manage mild to moderate headache pain and reduce fever symptoms during outdoor events' },
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
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      participantSignatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      medicationsSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      parentSignatureDate: getTodayDateString(),
      participantSignatureDate: getTodayDateString(),
      willSignLater: false,
      willParticipantSignLater: false,
      willSignMedsLater: false
    });
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
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
      councilName: 'Dan Beard Council (#438)',
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
      exemptionToImmunizations: true,
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
      participantSignatureDate: getTodayDateString(),
      willSignLater: false,
      willParticipantSignLater: false,
      willSignMedsLater: false
    });
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleLoadTestDataMax = () => {
    methods.reset({
      participantType: 'youth',
      fullName: 'Alex Alexander Alexanderson-Smith III, Senior Volunteer Program Offic',
      dateOfBirth: '2015-05-15',
      age: '11',
      gender: 'female',
      address: '12345 West Participant Boulevard Way, Suite 6789, Room 101, Mailstop 42, North East Valley District Center, City of Metropolitan Scouttow OK',
      city: 'Metropolitan City of Scouttown District Areas',
      state: 'State of Ohio Region Nine',
      zipCode: '44240-1234-5678',
      phone: '555-111-2222',
      unitNo: 'Troop Number 1234567',
      councilName: 'Dan Beard Council (#438)',
      expeditionCrewNo: 'Expedition Crew Number 4567890123456789012345',
      unitLeader: 'Unit Leader Johnathan Doe Senior Volunteer Program Lead Officer of District Nine',
      unitLeaderPhone: '555-333-4444',
      staffPosition: 'Staff Position Assistant Counselor Coordinator Adm',
      insuranceCompany: 'Test Insurance Company Name of Scouting America State O',
      insurancePolicy: 'Policy Number XYZ789012345678901234567890123456789',
      emergencyName: 'Primary Emergency Contact Jane Janelle Doe Senior Family Member Representative O',
      emergencyRelationship: 'Parent Legal Guardian Custodian Family Representat',
      emergencyPhone: '555-555-5555',
      emergencyAddress: '123 Primary Emergency Address Street Way, Scouttown, OH 44240  OK',
      emergencyOtherPhone: '555-666-6666',
      emergencyAltName: 'Alternate Emergency Contact Name Bob Bobby Bobbyer Representative',
      emergencyAltPhone: '555-777-7777',
      authPickupName1: 'Authorized Transportation Pickup Person One Full Name Representat',
      authPickupPhone1: '555-888-8888',
      authPickupName2: 'Authorized Transportation Pickup Person Two Full Name Representat',
      authPickupPhone2: '555-999-9999',
      notAuthPickupName1: 'Not Authorized Transportation Pickup Person One Full Name Represe',
      notAuthPickupPhone1: '555-000-0000',
      notAuthPickupName2: 'Not Authorized Transportation Pickup Person Two Full Name Represe',
      notAuthPickupPhone2: '555-222-2222',
      bbDevice: true,
      participantRestrictions: false, // false = restrictions apply
      restrictionsText: 'Restrictions: no climbing, running, hiking, swimming, or sports!!',
      hasAllergies: true,
      allergyFood: true,
      allergyFoodExp: 'Food Allergy (Peanuts) Explanation OK',
      allergyMedication: true,
      allergyMedicationExp: 'Med Allergy (Penicillin) Explanations',
      allergyPlants: true,
      allergyPlantsExp: 'Plants Allergy (Poison Ivy) Expan OK!',
      allergyBugs: true,
      allergyBugsExp: 'Bug Allergy (Bee Stings) Explanations',
      epinephrine: true,
      autoinjectorExpDate: '12/28 (Auto-inject Exp) ',
      heightFt: '5',
      heightIn: '5',
      weight: '120',
      condDiabetes: true,
      lastHbA1c: 'HbA1c: 6.5% on 04/2026 OK',
      condInsulin: true,
      condHypertension: true,
      hypertensionExplanation: 'Hypertension managed by diet, exercise, and daily lisinopril; blood pressure is monitored weekly. OK',
      condHeartDisease: true,
      heartDiseaseExplanation: 'Congenital Heart Defect managed by cardiologist, no strenuous activity allowed on high altitude hike',
      condFamilyHistory: true,
      familyHistoryExplanation: 'Father had myocardial infarction at age 48; sibling has history of congenital heart disease defect',
      condStroke: true,
      strokeExplanation: 'Transient ischemic attack managed by medication, fully resolved with no permanent neurological def',
      condAsthma: true,
      lastAsthmaAttack: 'Last attack: 11/2025 (Mild) OK',
      condRespiratory: true,
      lungExplanation: 'Chronic respiratory disease managed by pulmonologist, fully resolved with no permanent lung damage',
      condCOPD: true,
      copdExplanation: 'Chronic obstructive pulmonary disease managed by specialist, fully stable with regular medication OK',
      condEENSP: true,
      eenspExplanation: 'Chronic sinusitis sinus problems managed by specialist, fully stable with no active sinus infection',
      condMuscular: true,
      muscularExplanation: 'Scoliosis muscular skeletal condition managed by specialist, fully stable with regular exercises OK!',
      condHeadInjury: true,
      headExplanation: 'Head injury/concussion/TBI managed by specialist, fully stable with no permanent brain damage OK!',
      condAltitude: true,
      altitudeExplanation: 'Altitude sickness managed by gradual acclimatization, fully stable with regular monitoring OK!',
      condPsychiatric: true,
      psychiatricExplanation: 'Mild anxiety and depression managed by therapist, fully stable with no active psychiatric symptoms',
      condNeurological: true,
      neurologicalExplanation: 'Mild attention deficit hyperactivity disorder managed by specialist, fully stable with medication OK',
      condBlood: true,
      bloodExplanation: 'Mild sickle cell trait managed by hematologist, fully stable with no history of painful crises OK!',
      condFainting: true,
      faintingExplanation: 'Vasovagal syncope episodes managed by hydration and salt intake, fully stable with no active episode',
      condKidney: true,
      kidneyExplanation: 'Chronic kidney nephritis managed by nephrologist, fully stable with regular monitoring of functions',
      condSeizures: true,
      lastSeizureDate: 'Last seizure: 01/2026 (No) OK',
      condStomach: true,
      stomachExplanation: 'Acid reflux stomach disease managed by gastroenterologist, fully stable with regular medication OK!',
      condThyroid: true,
      thyroidExplanation: 'Hypothyroidism thyroid disease managed by endocrinologist, fully stable with daily synthroid use OK',
      condSkin: true,
      skinExplanation: 'Eczema skin disease managed by dermatologist, fully stable with topical steroid use when flareup OK',
      condSleep: true,
      condCPAP: true,
      sleepExplanation: 'Obstructive sleep apnea managed by CPAP therapy nightly, fully compliance monitored by physician OK',
      condSurgeries: true,
      lastSurgeryDate: '08/2024 - Appendectomy Surgery, no complications and full recovery OK!',
      condOther: true,
      otherExplanation: 'Other medical conditions not covered above fully explained and monitored by primary care physician',
      noMedications: false,
      nonPrescriptionExceptions: true,
      nonPrescriptionExceptionsText: 'Non-prescription exceptions list: Tylenol, Ibuprofen, Claritin, Benadryl, and Aspirin',
      medicationsAdditionalSpace: true,
      medications: [
        { medication: 'Acetaminophen Extra Strength 5', dose: '1000mg tab', frequency: 'Every 4-6 hours as needed', reason: 'Manage mild to moderate headache pain and reduce fever symptoms during outdoor events' },
        { medication: 'Ibuprofen Pain Reliever 200mg', dose: '400mg tabs', frequency: 'Three times daily with fo', reason: 'Manage mild muscle soreness and joint inflammation after long high altitude scout hik' },
        { medication: 'Diphenhydramine Allergy 25mg', dose: '25mg capsl', frequency: 'Once nightly before sleep', reason: 'Relieve seasonal allergy symptoms and prevent mild itching during outdoor scout camps' },
        { medication: 'Albuterol HFA Inhaler 90mcg 1', dose: '2 puffs   ', frequency: 'Every 4 hours as needed ', reason: 'Prevent exercise induced asthma bronchospasm during strenuous physical activity tests' },
        { medication: 'Fluticasone Prop Nasal Spray 1', dose: '2 sprays  ', frequency: 'Once daily in each nostri', reason: 'Relieve chronic seasonal allergic rhinitis symptoms and reduce sinus inflammation OK!' },
        { medication: 'Montelukast Sodium Tab 10mg 1', dose: '10mg tab  ', frequency: 'Once daily in the evening', reason: 'Control chronic asthma symptoms and prevent seasonal allergy flareups during event OK' }
      ],
      rescueInhaler: true,
      inhalerExpDate: '10/27 (Rescue Inh. Exp) ',
      exemptionToImmunizations: false,
      immTetanus: true,
      immTetanusDate: '08/15/2022 (Current Tetanus Vac) OK',
      hadTetanus: '2018 (Had)',
      immPertussis: true,
      immPertussisDate: '05/20/2020 (Pertussis Vaccinate) OK',
      hadPertussis: '2012 (Had)',
      immDiphtheria: true,
      immDiphtheriaDate: '05/20/2020 (Diphtheria Vaccine) OK',
      hadDiphtheria: '2012 (Had)',
      immPolio: true,
      immPolioDate: '09/10/2005, 11/12/2007 (Polio Vac) ',
      hadPolio: '2008 (Had)',
      immMMR: true,
      immMMRDate: '03/12/2010, 06/15/2013 (MMR Vacs) ',
      hadMMR: '2010 (Had)',
      immChickenPox: true,
      immChickenPoxDate: '06/18/2008 (Chicken Pox Vaccine)OK',
      hadChickenPox: '2006 (Had)',
      immHepA: true,
      immHepADate: '04/10/2015, 10/12/2015 (Hep A Vac)',
      hadHepA: '2014 (Had)',
      immHepB: true,
      immHepBDate: '01/15/2012, 02/15/2012, 07/15/12 OK',
      hadHepB: '2011 (Had)',
      immMeningitis: true,
      immMeningitisDate: '09/20/2018 (Meningitis Vaccine) OK',
      hadMeningitis: '2017 (Had)',
      immInfluenza: true,
      immInfluenzaDate: '10/15/2025 (Influenza Vaccine)  OK',
      hadInfluenza: '2024 (Had)',
      immOther: true,
      immOtherDate: '08/22/2003 (Other HIB Vaccine)  OK',
      hadOther: '2004 (Had)',
      additionalMedicalHistory: 'Frequent mild asthma symptoms during heavy physical exercise. Uses rescue albuterol inhaler. Past history of seasonal grass allergies but no anaphylaxis. Underwent uncomplicated minor appendectomy in August 2024. All vitals normal. No other history of hospitalization, blood transfusions, or serious chronic illnesses. Participant maintains an active lifestyle, participating in weekly hiking, swimming, and outdoor scouts camping trips without restriction. Normal growth and development verified OK!',
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      participantSignatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      medicationsSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAABWklEQVR42u3cUQ6DMAwE0b3/pekJgkoIECdvJP+WeOUxpVLJAaBJRAAQBCAIQBCAIABBAIIABAEIAhAEAEEAggAEAQiyYvDJ5QJBCEEYgpCCLAQhxpDhJgpBthKj0nVAkFcGdtVrEwTdw+k8BCHHpINIEoIYPqIQpMLAOTdBhLTAJnY3IYjt625CEBtXbwSxZfVJEJtVzyXyEYhtqv+TTARiOORwkoWtaSDk0ux/10DIIZ+/nsd2C4QY8rrSZ3YKhBxyu9pbdgjET5ky7J3zrL45iCHPOz1k1c3hriHbEefOaqEQQ9Yjz5kRF5ohFH83lfsTZ0v1UIhBlCfPkoqheJNHTVG+nIvuz3w6EO+CIkrlucibgXibIFGqzUVmCMX7aIky60ykWiggy5tzkQrBgCxfzYTpA84FzqGUapYQlCKIUj3lWybgIR0gCEAQgCAAQQCCAAQBCALsxw+7B4PgHhlX+wAAAABJRU5ErkJggg==',
      parentSignatureDate: getTodayDateString(),
      participantSignatureDate: getTodayDateString(),
      willSignLater: false,
      willParticipantSignLater: false,
      willSignMedsLater: false
    });
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleImportPdfClick = () => {
    if (hasExistingData()) {
      setShowImportConfirm(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleImportPdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsGenerating(true);
      const buffer = await file.arrayBuffer();
      const parsedData = await parseHealthFormPDF(buffer);
      methods.reset(parsedData as any);
      setAppAlert({
        title: "Import Successful",
        message: "Form successfully loaded from the PDF! Please review the form fields and draw/verify signatures before downloading.",
        type: "success"
      });
    } catch (error) {
      console.error("Failed to parse PDF", error);
      setAppAlert({
        title: "Import Failed",
        message: "Failed to parse the PDF file. Please verify it is a valid completed medical form generated by this app.",
        type: "error"
      });
    } finally {
      setIsGenerating(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const executePdfDownload = useCallback(async (data: HealthFormData) => {
    setPendingFormData(null);
    try {
      setIsGenerating(true);

      const blob = await generateHealthFormPDF(data);
      const url = URL.createObjectURL(blob);
      const fileName = `Scouting_Health_Form_${data.fullName.replace(/\s+/g, '_')}.pdf`;

      // Unified download path for both desktop and mobile
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Delay revoking the object URL so that mobile and desktop download managers
      // have enough time to retrieve the PDF data before the link is destroyed.
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 20000);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      console.error("Failed to generate PDF", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      setAppAlert({
        title: "Download Failed",
        message: `An error occurred while generating the PDF:\n\n${errMsg}\n\nPlease try again.`,
        type: "error"
      });
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Intercept submit to show reminder modal first
  const onSubmit = useCallback((data: HealthFormData) => {
    setPendingFormData(data);
  }, []);

  const onInvalidSubmit = useCallback(() => {
    // Wait for React to complete the render cycle and update the DOM with error classes
    setTimeout(() => {
      const firstError = document.querySelector('.error, .row-required-error, .error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
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
      {showLeaderModal && (
        <LeaderLinkModal onClose={() => setShowLeaderModal(false)} />
      )}
      {appAlert && (
        <AlertModal
          title={appAlert.title}
          message={appAlert.message}
          type={appAlert.type}
          onClose={() => setAppAlert(null)}
        />
      )}
      {showImportConfirm && (
        <ConfirmModal
          title="Overwrite Existing Data?"
          message="Importing a new PDF will completely overwrite any data you have already entered in this form. Are you sure you want to continue?"
          onConfirm={() => {
            setShowImportConfirm(false);
            fileInputRef.current?.click();
          }}
          onCancel={() => setShowImportConfirm(false)}
        />
      )}
      <div className="app-container">
        <header className="header">
          <img src="./headericon.png" width="64" height="64" style={{ marginBottom: '1rem' }} />
          <h1>Health Form Filler</h1>
          <p>Complete the Scouting America <a href="https://www.scouting.org/health-and-safety/ahmr/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Medical Release Form</a> (Parts A & B).<br /><br /></p>
          <p><strong>Private & Secure:</strong> All data is processed entirely in your browser.<br />No information you enter is ever sent to any server.</p>
          <p>Secure storage of the generated PDF is your responsiblity.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            {isTestMode && (
              <>
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
                <button
                  type="button"
                  onClick={handleLoadTestDataMax}
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                >
                  Load Test Data (Max)
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleImportPdfClick}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            >
              Import Completed PDF for Editing
            </button>
            <button
              type="button"
              onClick={() => setShowLeaderModal(true)}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <LinkIcon size={18} />
              Share Pre-filled Link (For Leaders)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportPdfChange}
              accept=".pdf"
              style={{ display: 'none' }}
            />
          </div>
        </header>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit, onInvalidSubmit)}>
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
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <p style={{ margin: 0 }}>This application is not affiliated with, sponsored by, or endorsed by Scouting America. It is an independent, volunteer-created utility.</p>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a
              href="https://github.com/Richardsonke/annual-health-form-assistant"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--primary-color)',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#7C3AED'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
            >
              <ExternalLink size={16} />
              GitHub Repository
            </a>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                const rev = (s: string) => s.split('').reverse().join('');
                window.location.href = rev(':otliam') + rev('sdwxdhrne7') + '@' + rev('sneakemail') + '.' + rev('moc');
              }}
              style={{
                color: 'var(--primary-color)',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#7C3AED'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
            >
              Support: {supportEmail}
            </a>
          </div>
          <p style={{ margin: 0 }}>Analytics Notice: Cloudflare Web Analytics tracks basic usage stats on this site<br />but does not set any cookies or track any personal information</p>
        </footer>
      </div>
    </>
  );
}

export default App;
