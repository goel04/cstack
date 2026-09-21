import React from 'react';

interface CStackMarkProps {
  className?: string;
  size?: number | string;
  /** Fill color of the crystal; defaults to currentColor */
  color?: string;
  /** Color of the facet cut-lines; defaults to transparent mask or white */
  cutColor?: string;
}

/**
 * The signature faceted carbon crystal / monolith mark of CSTACK.
 */
export const CStackMark: React.FC<CStackMarkProps> = ({
  className = 'w-7 h-9',
  size,
  color = 'currentColor',
  cutColor = 'white',
}) => {
  const style = size ? { width: size, height: typeof size === 'number' ? size * 1.5 : size } : undefined;
  // Unique mask id to avoid collisions when multiple logos are rendered
  const maskId = React.useId ? `cstack-mark-mask-${React.useId().replace(/:/g, '')}` : 'cstack-mark-mask';

  return (
    <svg
      viewBox="0 0 100 156"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId}>
          <rect width="100" height="156" fill="white" />
          <path
            d="M53 14 L46 56 M32 40 L46 56 M46 56 L43 96 M43 96 L35 134 M43 96 L48 148 M12 78 L44 76"
            stroke="black"
            strokeWidth="3.2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </mask>
      </defs>

      {/* Faceted silhouette with transparent cut gaps */}
      <polygon
        points="53,14 88,56 76,116 48,148 35,134 12,78 32,40"
        fill={color}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

interface CStackLogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 'light' for light backgrounds (dark logo), 'dark' for dark backgrounds (white logo) */
  theme?: 'light' | 'dark';
  /** Show crystal mark only */
  markOnly?: boolean;
}

/**
 * Full official CSTACK logo combining the faceted carbon crystal mark
 * with the lowercase 'cstack' geometric wordmark.
 */
export const CStackLogo: React.FC<CStackLogoProps> = ({
  className = '',
  markClassName = '',
  textClassName = '',
  size = 'md',
  theme = 'light',
  markOnly = false,
}) => {
  const isDark = theme === 'dark';

  // Size configurations
  const sizeConfig = {
    sm: {
      mark: 'w-5 h-7',
      text: 'text-lg',
      gap: 'gap-2',
    },
    md: {
      mark: 'w-6 h-8 sm:w-7 sm:h-9',
      text: 'text-xl sm:text-2xl',
      gap: 'gap-2.5',
    },
    lg: {
      mark: 'w-8 h-11',
      text: 'text-2xl sm:text-3xl',
      gap: 'gap-3',
    },
    xl: {
      mark: 'w-11 h-15',
      text: 'text-4xl sm:text-5xl',
      gap: 'gap-4',
    },
  }[size];

  const markColor = isDark ? '#ffffff' : '#18181b';
  const textColor = isDark ? 'text-white' : 'text-slate-900';

  if (markOnly) {
    return (
      <CStackMark
        className={`${sizeConfig.mark} ${markClassName}`}
        color={markColor}
      />
    );
  }

  return (
    <div className={`flex items-center ${sizeConfig.gap} select-none ${className}`}>
      <CStackMark
        className={`${sizeConfig.mark} ${markClassName}`}
        color={markColor}
      />
      <span
        className={`font-display font-bold lowercase tracking-tight leading-none ${sizeConfig.text} ${textColor} ${textClassName}`}
        style={{ letterSpacing: '-0.03em' }}
      >
        cstack
      </span>
    </div>
  );
};
