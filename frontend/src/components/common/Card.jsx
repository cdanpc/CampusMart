import './Card.css';

/**
 * Card Component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.className
 */
export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}
