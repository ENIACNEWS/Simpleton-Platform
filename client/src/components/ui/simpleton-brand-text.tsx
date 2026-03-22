interface SimpletonBrandTextProps {
  children?: React.ReactNode;
  className?: string;
  suffix?: string;
}

export function SimpletonBrandText({ children, className = "", suffix }: SimpletonBrandTextProps) {
  return (
    <>
      <span className={`simpleton-brand ${className}`}>Simpleton</span>
      {suffix && <span>{suffix}</span>}
      {children}
    </>
  );
}
