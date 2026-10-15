import { ReactNode } from 'react';

export function CoverBox({
  children,
  className = '',
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute left-1/2 bottom-0 -translate-x-1/2 pointer-events-none select-none ${className}`}
      style={{
        width: 'max(100vw, calc(100dvh * 1.7769))',
        aspectRatio: '1672 / 941',
      }}
    >
      {children}
    </div>
  );
}

export default CoverBox;
