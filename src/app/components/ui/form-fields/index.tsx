'use client';

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <label className="block text-xs font-light tracking-[0.25em] text-white/40 uppercase">{children}</label>
      {hint && <p className="mt-0.5 text-xs font-light text-white/20">{hint}</p>}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-light text-red-400/80">{message}</p>;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  maxLength,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      disabled={disabled}
      className="w-full border border-red-900/25 bg-white/[0.03] px-4 py-2.5 text-sm font-light text-white/80 placeholder-white/20 transition-colors outline-none focus:border-red-700/50 focus:bg-white/[0.05] disabled:opacity-50"
      style={{ colorScheme: 'dark' }}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className="w-full resize-none border border-red-900/25 bg-white/[0.03] px-4 py-2.5 text-sm font-light text-white/80 placeholder-white/20 transition-colors outline-none focus:border-red-700/50 focus:bg-white/[0.05] disabled:opacity-50"
      />
      {maxLength && (
        <span className="absolute right-3 bottom-2.5 text-[10px] font-light text-white/15">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 border border-red-700/60 bg-red-950/30 px-8 py-2.5 text-xs font-light tracking-[0.25em] text-red-300/90 uppercase transition-all hover:border-red-600/80 hover:bg-red-900/40 disabled:opacity-50">
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 border border-red-900/25 bg-white/[0.02] px-6 py-2.5 text-xs font-light tracking-[0.25em] text-white/35 uppercase transition-all hover:border-red-800/40 hover:text-white/60 disabled:opacity-50">
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-light tracking-[0.25em] text-white/25 uppercase transition-colors hover:text-white/50">
      {children}
    </button>
  );
}
