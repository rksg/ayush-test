import React from 'react'

export interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  override state = { hasError: false, error: null }

  static getDerivedStateFromError (error: Error) {
    return { hasError: Boolean(error), error }
  }

  defaultFallback () {
    return <>
      <p>Something went wrong.</p>
      <p>{JSON.stringify(this.state.error)}</p>
    </>
  }

  override render () {
    if (this.state.error) {
      // TODO:
      // hide detailed error/show summary in prod
      return this.props.fallback || this.defaultFallback()
    }
    return this.props.children
  }
}
