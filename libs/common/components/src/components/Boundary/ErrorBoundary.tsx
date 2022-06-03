import React from 'react'

export interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  override state: { hasError: boolean, error: unknown }
    = { hasError: false, error: null }

  static getDerivedStateFromError (error: unknown) {
    return { hasError: Boolean(error), error }
  }

  defaultFallback () {
    // TODO:
    // hide detailed error/show summary in prod
    let error
    if (this.state.error instanceof Error) {
      const { name, message, stack } = this.state.error
      error = <>
        {name}: {message}<br />
        {stack?.split('\n').map(line => <>{line}<br /></>)}
      </>
    } else {
      error = JSON.stringify(this.state.error)
    }
    return <>
      <p>Something went wrong.</p>
      <p>{error}</p>
    </>
  }

  override render () {
    if (this.state.error) {
      return this.props.fallback || this.defaultFallback()
    }
    return this.props.children
  }
}
