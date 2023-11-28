import { fixedEncodeURIComponent, NetworkPath } from '@acx-ui/utils'

import { Tenant } from './user/types'


type LinkPath = { routePath: string, altPath?: string }
type RolePath = Record<Tenant['role'], LinkPath>

interface RoleLink extends Partial<RolePath> {
  base: LinkPath,
}

export function roleLink (config: RoleLink, role: Tenant['role']): string {
  if (role in config) {
    return config[role]?.altPath || config[role]!.routePath
  }

  return config['base']?.altPath || config['base'].routePath
}

export function encodeFilterPath (type: 'report' | 'analytics', path: NetworkPath): string {
  const target = type === 'report' ? 'reportsNetworkFilter' : 'analyticsNetworkFilter'
  const encodedPath = fixedEncodeURIComponent(JSON.stringify({ raw: path, path }))
  return `${target}=${encodedPath}`
}
