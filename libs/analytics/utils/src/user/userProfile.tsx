/* Provide profile outside component */
import { get }                         from '@acx-ui/config'
import type { PendoParameters }        from '@acx-ui/utils'
import { updatePendo, decodeTenantId } from '@acx-ui/utils'

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
      isTrial: tenant.isTrial,
      sfdcId: tenant.id
    }
  }
}
const getSelectedTenant = (profile: UserProfile): Tenant => {
  const search = new URLSearchParams(window.location.search)
  const id = decodeTenantId(search) || profile.accountId
  return profile.tenants.find(tenant => tenant.id === id)!
}
export const getUserProfile = () => user.profile
export const setUserProfile = (profile: UserProfile) => {
  user.profile = { ...profile, selectedTenant: getSelectedTenant(profile) }
}
export const updateSelectedTenant = () => {
  const currentProfile = getUserProfile()
  const selectedTenant = getSelectedTenant(currentProfile)
  if (selectedTenant.id === currentProfile.selectedTenant.id) return
  user.profile.selectedTenant = selectedTenant
  updatePendo(
    /* istanbul ignore next */
    () => getPendoConfig()
  )
}
