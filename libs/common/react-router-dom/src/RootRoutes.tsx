import React, { useContext, useMemo } from 'react'

import {
  UNSAFE_RouteContext as RouteContext,
  Routes,
  Route
} from 'react-router-dom'

import { getBasePath } from './helpers'

import type { RoutesProps } from 'react-router-dom'

/**
 * Similar to Routes, except it enable routes define under be able start from root
 */
export function RootRoutes (props: RoutesProps) {
  const ctx = useContext(RouteContext)

  const value = useMemo(
    () => ({ ...ctx, matches: [] }),
    [ctx]
  )

  return <RouteContext.Provider value={value}>
    <Routes {...props}/>
  </RouteContext.Provider>
}

export function rootRoutes (routes: React.ReactNode) {
  return <RootRoutes>
    <Route path={getBasePath()} children={routes} />
  </RootRoutes>
}
