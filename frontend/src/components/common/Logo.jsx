export default function Logo({ size = 32 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M6 10L4 26H28L26 10H6Z" 
        fill="currentColor" 
        fillOpacity="0.2"
      />
      <path 
        d="M6 10L4 26H28L26 10H6Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M11 14V8C11 5.79086 12.7909 4 15 4H17C19.2091 4 21 5.79086 21 8V14" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
