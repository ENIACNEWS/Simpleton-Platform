interface HamburgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
}

export function HamburgerMenu({ isOpen, onClick }: HamburgerMenuProps) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
      aria-label="Navigation Menu"
    >
      <span className="text-white font-bold text-lg" style={{
        fontWeight: '700',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        letterSpacing: '-0.02em'
      }}>
        S
      </span>
    </button>
  );
}