import React, { Suspense } from 'react'

import { Spin } from 'antd'

import { ErrorBoundary } from './ErrorBoundary'

export type SuspenseBoundaryProps = React.PropsWithChildren<{
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}>

export function SuspenseBoundary (props: SuspenseBoundaryProps) {
  const fallback = props.fallback || <SuspenseBoundary.DefaultFallback size='large' />

  return (
    <ErrorBoundary fallback={props.errorFallback}>
      <Suspense
        fallback={fallback}
        children={props.children}
      />
    </ErrorBoundary>
  )
}

SuspenseBoundary.DefaultFallback = function DefaultSuspenseFallback (props: {
  size: 'small' | 'default' | 'large'
}) {
  return <span role='img' aria-label='loader'>
    <Spin size={props.size} />
  </span>
}
