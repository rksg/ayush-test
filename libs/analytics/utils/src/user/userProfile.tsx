/* Provide profile outside component */
import { get }                  from '@acx-ui/config'
import type { PendoParameters } from '@acx-ui/utils'
import { updatePendo }          from '@acx-ui/utils'

import { Tenant, UserProfile } from './types'

const user = {
  profile: {} as UserProfile
}
export function getPendoConfig (): PendoParameters {
  const user = getUserProfile()
  const tenant = user.selectedTenant
  return {
    visitor: {
      id: user.userId,
      full_name: `${user.firstName} ${user.lastName}`,
      role: tenant.role,
      region: get('MLISA_REGION'),
      version: get('MLISA_VERSION'),
      varTenantId: user.accountId,
      support: tenant.support,
      delegated: user.accountId !== tenant.id,
      email: user.email
    },
    account: {
      productName: 'RuckusAI',
      id: tenant.id,
      name: tenant.name,
      isTrial: tenant.isTrial
    }
  }
}
const extractTenantFromUrl = (tenantFromUrl: string | null) => {
  if (tenantFromUrl) {
    const [ tenantId ] = JSON.parse(atob(decodeURIComponent(tenantFromUrl))) as [string]
    return tenantId
  }
  return null
}
export const getUserProfile = () => user.profile
export const setUserProfile = (profile: UserProfile) => {
  const selectedTenant = profile.tenants.find(tenant => tenant.id === profile.accountId) as Tenant
  // Do not call this manually except in test env & bootstrap
  user.profile = { ...profile, selectedTenant }
}
export const updateSelectedTenant = (tenant: string | null) => {
  const currentProfile = getUserProfile()
  const selectedTenantId = extractTenantFromUrl(tenant)
    || currentProfile.accountId
  if (selectedTenantId === currentProfile.selectedTenant.id) return
  const selectedTenant = currentProfile.tenants.find(t => t.id === selectedTenantId) as Tenant
  user.profile.selectedTenant = selectedTenant
  updatePendo(
    /* istanbul ignore next */
    () => getPendoConfig()
  )
}
