import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '680px',
            width: '100%',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                backgroundColor: '#dc2626',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}>!</div>
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  Application Render Error
                </h1>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
                  A runtime component exception was prevented from crashing the window.
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#090d16',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              overflowX: 'auto',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              color: '#f87171'
            }}>
              <strong>{this.state.error?.name}:</strong> {this.state.error?.message}
              {this.state.errorInfo?.componentStack && (
                <pre style={{ color: '#94a3b8', marginTop: '0.75rem', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#334155',
                  color: '#e2e8f0',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Reset App & Storage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
