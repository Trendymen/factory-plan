import { useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';

export function AppErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const [copied, setCopied] = useState(false);
  const errorText = error instanceof Error
    ? `${error.message}\n\n${error.stack ?? ''}`
    : String(error);

  const handleCopy = () => {
    navigator.clipboard.writeText(errorText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '1rem',
      background: 'var(--bg-primary, #1a1a2e)',
      color: 'var(--text-primary, #e0e0e0)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: '1.5rem', margin: 0 }}>应用出错了</h1>
      <pre style={{
        maxWidth: '600px',
        padding: '1rem',
        borderRadius: '8px',
        background: 'var(--bg-secondary, #16213e)',
        color: 'var(--text-muted, #999)',
        fontSize: '0.875rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {error instanceof Error ? error.message : String(error)}
      </pre>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleCopy}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '6px',
            border: '1px solid var(--text-muted, #666)',
            background: 'transparent',
            color: 'var(--text-muted, #999)',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          {copied ? '已复制' : '复制错误'}
        </button>
        <button
          onClick={resetErrorBoundary}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '6px',
            border: 'none',
            background: 'var(--accent, #e94560)',
            color: '#fff',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
