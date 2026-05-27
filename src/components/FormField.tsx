import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  containerClass?: string;
  maxLength?: number;
  disabled?: boolean;
  showErrorMsg?: boolean;
  min?: number;
  max?: number;
}

// Simple helper to resolve nested paths like "medications.0.medication"
const getNestedValue = (obj: any, path: string) => {
  if (!obj || !path) return undefined;
  return path.split(/[\.\[\]]+/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);
};

export const FormField: React.FC<FormFieldProps> = ({ 
  name, 
  label, 
  type = 'text', 
  placeholder,
  containerClass = 'form-group',
  maxLength,
  disabled,
  showErrorMsg = true,
  min,
  max
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = getNestedValue(errors, name);

  const isPhone = type === 'tel' || name === 'phone' || name.toLowerCase().includes('phone');
  const { onChange, ...registerRest } = register(name);

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isPhone) {
      let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      let formatted = '';
      if (value.length > 0) {
        formatted += value.substring(0, 3);
      }
      if (value.length > 3) {
        formatted += '-' + value.substring(3, 6);
      }
      if (value.length > 6) {
        formatted += '-' + value.substring(6, 10);
      }
      e.target.value = formatted;
    }
    onChange(e);
  };

  return (
    <div className={containerClass}>
      {label && <label className="form-label" htmlFor={name}>{label}</label>}
      {type === 'textarea' ? (
        <textarea
          id={name}
          placeholder={placeholder}
          className={`form-input ${error ? 'error' : ''}`}
          style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
          maxLength={maxLength}
          disabled={disabled}
          {...registerRest}
          onChange={handleCustomChange}
        />
      ) : (
        <input
          id={name}
          type={isPhone ? 'tel' : type}
          placeholder={placeholder || (isPhone ? 'XXX-XXX-XXXX' : undefined)}
          className={`form-input ${error ? 'error' : ''}`}
          maxLength={isPhone ? 12 : maxLength}
          disabled={disabled}
          min={min}
          max={max}
          {...registerRest}
          onChange={handleCustomChange}
        />
      )}
      {error && showErrorMsg && (
        <span className="error-message">
          <AlertCircle size={16} />
          {error.message?.toString()}
        </span>
      )}
    </div>
  );
};
