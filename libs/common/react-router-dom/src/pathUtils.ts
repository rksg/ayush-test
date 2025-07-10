import { getLocationPathname } from './locationUtils'
import { TenantType }          from './useTenantLink'

export function resolveTenantTypeFromPath (): TenantType {
  const [, marker] = getLocationPathname().split('/').filter(Boolean)

  return marker === 'v' ? 'v' : 't'
}

export function isRecSite (): boolean {
  return resolveTenantTypeFromPath() === 't'
}
