import React, { Suspense } from 'react'

import { LoadingOutlined } from '@ant-design/icons'
import { Spin }            from 'antd'

import { ErrorBoundary } from './ErrorBoundary'

export type SuspenseBoundaryProps = React.PropsWithChildren<{
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}>

export function SuspenseBoundary (props: SuspenseBoundaryProps) {
  const fallback = props.fallback || <SuspenseBoundary.DefaultFallback />

  return (
    <ErrorBoundary fallback={props.errorFallback}>
      <Suspense
        fallback={fallback}
        children={props.children}
      />
    </ErrorBoundary>
  )
}

SuspenseBoundary.DefaultFallback = function DefaultSuspenseFallback () {
  return <Spin size='large' indicator={<LoadingOutlined />} />
}
