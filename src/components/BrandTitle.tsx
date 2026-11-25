import React from 'react';

interface BrandTitleProps {
  size?: 'mobile' | 'desktop' | 'hero';
}

export const BrandTitle: React.FC<BrandTitleProps> = ({size = 'desktop'}) => {
  const titleClasses =
    size === 'mobile'
      ? 'text-[17px] sm:text-lg leading-none'
      : size === 'hero'
        ? 'text-xl sm:text-2xl leading-tight'
        : 'text-xl leading-tight';

  const subtitleClasses =
    size === 'mobile'
      ? 'text-[9.5px] leading-none mt-0.5'
      : 'text-[10.5px] leading-tight mt-0.5';

  return (
    <div className="flex flex-col min-w-0">
      <span
        className={`font-display font-extrabold tracking-tight app-brand-title whitespace-nowrap ${titleClasses}`}
      >
        MyFirst Account
      </span>
      <span
        className={`font-medium tracking-wide app-text-muted whitespace-nowrap ${subtitleClasses}`}
      >
        by AiStudio.Gm5
      </span>
    </div>
  );
};
