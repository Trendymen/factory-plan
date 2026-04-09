import { useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';

export function ViewErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
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
      height: '100%',
      gap: '0.75rem',
      color: 'var(--text-primary, #e0e0e0)',
    }}>
      <h2 style={{ fontSize: '1.125rem', margin: 0 }}>视图渲染失败</h2>
      <pre style={{
        maxWidth: '500px',
        padding: '0.75rem',
        borderRadius: '6px',
        background: 'var(--bg-secondary, #16213e)',
        color: 'var(--text-muted, #999)',
        fontSize: '0.8rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {error instanceof Error ? error.message : String(error)}
      </pre>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleCopy}
          style={{
            padding: '0.4rem 1.2rem',
            borderRadius: '6px',
            border: '1px solid var(--text-muted, #666)',
            background: 'transparent',
            color: 'var(--text-muted, #999)',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          {copied ? '已复制' : '复制错误'}
        </button>
        <button
          onClick={resetErrorBoundary}
          style={{
            padding: '0.4rem 1.2rem',
            borderRadius: '6px',
            border: 'none',
            background: 'var(--accent, #e94560)',
            color: '#fff',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          重试
        </button>
      </div>
    </div>
  );
}
