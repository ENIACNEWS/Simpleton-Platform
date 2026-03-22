interface SimpletonLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SimpletonLogo({ size = "md", className = "" }: SimpletonLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 ${className}`}>
      <img 
        src="/simpleton-logo.jpeg" 
        alt="Simpleton™ Logo" 
        className="w-full h-full object-contain rounded-lg"
        loading="eager"
      />
    </div>
  );
}
