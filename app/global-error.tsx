'use client'

// Last resort: a global-error boundary replaces the root layout entirely, so it
// has to render its own <html>/<body> and cannot rely on app styles loading.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: '1.5rem',
          textAlign: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            The page failed to load. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#0a1128',
              color: '#fff',
              boxShadow: 'inset 0 0 0 1px #b4832f',
              border: 0,
              borderRadius: '0.5rem',
              padding: '0.6rem 1.1rem',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
