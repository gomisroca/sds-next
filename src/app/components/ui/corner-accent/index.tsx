export function CornerAccents({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  const border = size === 'sm' ? 'border-red-900/20' : 'border-red-600/50';
  return (
    <>
      <div className={`absolute top-0 left-0 ${dim} border-t border-l ${border}`} />
      <div className={`absolute top-0 right-0 ${dim} border-t border-r ${border}`} />
      <div className={`absolute bottom-0 left-0 ${dim} border-b border-l ${border}`} />
      <div className={`absolute right-0 bottom-0 ${dim} border-r border-b ${border}`} />
    </>
  );
}

/**
 * Single top-left corner accent
 */
export function CornerAccentTL({ className = 'border-red-900/20' }: { className?: string }) {
  return <div className={`absolute top-0 left-0 h-4 w-4 border-t border-l ${className}`} />;
}
