import './Input.css';

/**
 * Input Component
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.error
 * @param {boolean} props.required
 * @param {string} props.className
 */
export default function Input({
  label,
  error,
  required = false,
  className = '',
  ...props
}) {
  const inputId = props.id || props.name;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? 'input--error' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
