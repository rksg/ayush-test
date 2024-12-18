/* Provide profile outside component */
import { get }                         from '@acx-ui/config'
import { setRaiPermissions }           from '@acx-ui/user'
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
  let id = decodeTenantId(search)
  if (!id) {
    id = profile.accountId
    window.location.search = '?selectedTenants=' + window.btoa(JSON.stringify([id]))
  }
  return profile.tenants.find(tenant => tenant.id === id)!
}
export const getUserProfile = () => user.profile
export const setUserProfile = (profile: UserProfile) => {
  const selectedTenant = getSelectedTenant(profile)
  setRaiPermissions(selectedTenant.permissions)
  user.profile = { ...profile, selectedTenant }
}
export const getUserName = () => `${user.profile.firstName} ${user.profile.lastName}`
export const updateSelectedTenant = () => {
  const currentProfile = getUserProfile()
  const selectedTenant = getSelectedTenant(currentProfile)
  if (selectedTenant.id === currentProfile.selectedTenant.id) return
  setRaiPermissions(selectedTenant.permissions)
  user.profile.selectedTenant = selectedTenant
  updatePendo(
    /* istanbul ignore next */
    () => getPendoConfig()
  )
}
