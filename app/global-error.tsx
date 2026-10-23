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
          // Spelled out rather than inherited: this boundary replaces the root
          // layout, so none of the app's CSS -- including the palette -- is
          // loaded. Without these the fallback is a white page in a dark app.
          background: '#0b0b0c',
          color: '#f4f4f5',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#8e8e96', marginBottom: '1.5rem' }}>
            The page failed to load. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#d4a24c',
              color: '#060607',
              border: 0,
              borderRadius: '0.5rem',
              padding: '0.6rem 1.1rem',
              fontSize: '0.95rem',
              fontWeight: 600,
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
