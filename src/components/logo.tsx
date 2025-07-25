import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-primary', className)}
    >
      {/* Círculo principal */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Números de lotería estilizados */}
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="monospace"
      >
        777
      </text>
      
      {/* Estrella de la suerte en la parte superior */}
      <path
        d="M12 3l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3z"
        fill="currentColor"
      />
    </svg>
  );
}