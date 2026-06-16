'use client';

export default function OrnamentalRule({ className = '' }: { className?: string }) {
  return (
    <div className={`mx-auto flex w-full max-w-lg items-center gap-3 ${className}`} data-testid="ornamental-rule">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-900 to-red-700" />
      <div className="h-1.5 w-1.5 rotate-45 bg-red-700" />
      <div className="h-2.5 w-2.5 rotate-45 border border-red-600" />
      <div className="h-1.5 w-1.5 rotate-45 bg-red-700" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-900 to-red-700" />
    </div>
  );
}
