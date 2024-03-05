import React, { useContext, useMemo } from 'react'

import {
  UNSAFE_RouteContext as RouteContext,
  Routes,
  Route
} from 'react-router-dom'

import { useUserProfileContext } from '@acx-ui/user'

import { TenantNavigate } from './TenantNavigate'

import type { RoutesProps } from 'react-router-dom'
/**
 * Similar to Routes, except it enable routes define under be able start from root
 * ref: https://github.com/remix-run/react-router/issues/8035#issuecomment-997737565
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

function hasRbac (props:any) { // TODO:
  const userProfile = useUserProfileContext()
  console.log(userProfile, props)
  return props.role === 'admin'
}

export function AuthRoute (props:any) {
  return !hasRbac(props) ? <TenantNavigate replace to='/no-permissions' /> : props.children
};

export function rootRoutes (routes: React.ReactNode) {
  return <RootRoutes>
    <Route path='' children={routes} />
  </RootRoutes>
}
