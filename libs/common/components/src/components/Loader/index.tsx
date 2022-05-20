import React from 'react'

import { SerializedError }     from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import {
  ErrorBoundary as DefaultErrorBoundary,
  SuspenseBoundary
} from '../Boundary'

import * as UI from './styledComponents'

interface QueryState {
  isLoading: boolean;
  error?: Error | SerializedError | FetchBaseQueryError;
  isFetching?: boolean;
}

export type LoaderProps = React.PropsWithChildren<{
  states?: QueryState[];
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}>

export function Loader (props: LoaderProps) {
  const isLoading = Boolean(props.states?.some(state => state.isLoading))
  const isFetching = Boolean(props.states?.some(state => state.isFetching))

  const fallback = <UI.FallbackWrapper
    $isFetching={isFetching}
    children={props.fallback || <SuspenseBoundary.DefaultFallback />} />

  const errorFallback = props.errorFallback
    ? <UI.FallbackWrapper children={props.errorFallback} />
    : undefined

  return (
    <UI.Wrapper>
      <ErrorBoundary fallback={errorFallback}>
        <ErrorContainer states={props.states} />
        <SuspenseBoundary fallback={fallback}>
          {(isLoading || isFetching) ? fallback : null}
          {!isLoading && props.children}
        </SuspenseBoundary>
      </ErrorBoundary>
    </UI.Wrapper>
  )
}

function ErrorContainer (props: Pick<LoaderProps, 'states'>) {
  props.states?.forEach(state => { if (state.error) throw state.error })
  return null
}

class ErrorBoundary extends DefaultErrorBoundary {
  defaultFallback () {
    return <UI.FallbackWrapper children={super.defaultFallback()} />
  }
}
