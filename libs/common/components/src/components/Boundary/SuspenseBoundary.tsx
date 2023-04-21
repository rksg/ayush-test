import React, { Suspense } from 'react'

import { Spin }        from 'antd'
import styled, { css } from 'styled-components/macro'

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

export const SpinWrapper = styled.span<{ $absoluteCenter: boolean }>`
  ${props => props.$absoluteCenter ? css`
    position: absolute;
    top: 50vh;
    left: 50vw;
    transform: translate(-50%, -50%);
  ` : ''}
`

type DefaultFallbackProps = {
  size?: 'small' | 'default' | 'large',
  absoluteCenter?: boolean
}

SuspenseBoundary.DefaultFallback = function DefaultSuspenseFallback (
  { absoluteCenter = false, size = 'large' }: DefaultFallbackProps
) {
  return <SpinWrapper
    role='img'
    aria-label='loader'
    $absoluteCenter={absoluteCenter}
  >
    <Spin size={size} />
  </SpinWrapper>
}
