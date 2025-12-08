import './Button.css';

/**
 * Button Component
 * @param {Object} props
 * @param {'primary'|'secondary'|'accent'|'success'|'danger'|'outline'} props.variant
 * @param {'small'|'medium'|'large'} props.size
 * @param {boolean} props.fullWidth
 * @param {boolean} props.disabled
 * @param {React.ReactNode} props.children
 * @param {string} props.className
 */
export default function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  children,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
