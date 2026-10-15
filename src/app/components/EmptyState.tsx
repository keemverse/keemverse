import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  body?: string;
  action?: ReactNode;
}

/** "Nothing here" message with a small drawn illustration (replaces the emoji). */
export default function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-20 text-center">
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true" className="text-muted-foreground">
        <circle cx="42" cy="42" r="22" stroke="currentColor" strokeWidth="2.5" opacity=".55" />
        <path d="M58.5 58.5L78 78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".55" />
        <path d="M33 42h18" stroke="var(--fashion-ink)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="78" cy="24" r="3" fill="var(--craft-ink)" />
        <circle cx="18" cy="74" r="2" fill="var(--fashion-ink)" />
      </svg>
      <h3 className="mt-5 text-display-md">{title}</h3>
      {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
