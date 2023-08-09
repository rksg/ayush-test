import { defineMessage } from 'react-intl'

import { RolesEnum }   from '@acx-ui/types'
import { UserProfile } from '@acx-ui/user'
import { getIntl }     from '@acx-ui/utils'

import { EntitlementUtil } from './entitlement'
import {
  AdministrationDelegationStatus,
  EntitlementDeviceType,
  EntitlementDeviceTypes,
  roleDisplayText
} from './types'

export const getRoles = () => {
  return Object.keys(roleDisplayText).map(roleKey => ({
    label: roleDisplayText[roleKey as RolesEnum],
    value: roleKey
  }))
}

export const getDelegetionStatusIntlString = (status: AdministrationDelegationStatus) => {
  switch (status) {
    case AdministrationDelegationStatus.INVITED :
      return defineMessage({ defaultMessage: 'Invitation sent' })
    case AdministrationDelegationStatus.ACCEPTED :
      return defineMessage({ defaultMessage: 'Access granted' })
    case AdministrationDelegationStatus.REJECTED :
      return defineMessage({ defaultMessage: 'Invitation declined' })
    case AdministrationDelegationStatus.REVOKED :
      return defineMessage({ defaultMessage: 'Revoked' })
    default:
      return defineMessage({ defaultMessage: 'Unknown' })
  }
}

export const getEntitlementDeviceTypes = (): EntitlementDeviceTypes => {
  return Object.keys(EntitlementDeviceType)
    .map(key => ({
      label: EntitlementUtil.getDeviceTypeText(getIntl().$t, key as EntitlementDeviceType),
      value: key as EntitlementDeviceType
    }))
}

export const hasAdministratorTab = (
  profile: UserProfile | undefined,
  tenantId: string | undefined): boolean => {
  const isSupport = Boolean(
    profile?.dogfood && !!profile?.varTenantId && profile?.varTenantId === tenantId)

  return !profile?.delegatedDogfood && !isSupport
}
