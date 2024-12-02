import React from 'react'

export interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps & {
  children: React.ReactNode
}> {
  override state: { hasError: boolean, error: unknown }
    = { hasError: false, error: null }

  static getDerivedStateFromError (error: unknown) {
    return { hasError: Boolean(error), error }
  }

  defaultFallback () {
    if (process.env['NODE_ENV'] === 'production') return null

    let error
    if (this.state.error instanceof Error) {
      const { name, message } = this.state.error
      error = <>{name}: {message}</>
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
