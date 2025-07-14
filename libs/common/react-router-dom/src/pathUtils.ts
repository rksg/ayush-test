import { TenantType }          from './useTenantLink'

export function resolveTenantTypeFromPath (): TenantType {
  const [, marker] = window.location.pathname.split('/').filter(Boolean)

  return marker === 'v' ? 'v' : 't'
}

export function isRecSite (): boolean {
  return resolveTenantTypeFromPath() === 't'
}
