import { useMemo } from 'react'

import { MessageDescriptor, defineMessage } from 'react-intl'

import { Button }                 from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ConfigTemplate,
  ConfigTemplateDriftType,
  ConfigTemplateType, configTemplatePolicyTypeMap,
  configTemplateServiceTypeMap, policyTypeLabelMapping,
  serviceTypeLabelMapping
} from '@acx-ui/rc/utils'
import { RolesEnum }                              from '@acx-ui/types'
import { hasRoles, useUserProfileContext }        from '@acx-ui/user'
import { AccountType, getIntl, isDelegationMode } from '@acx-ui/utils'

import { configTemplateDriftTypeLabelMap } from './ShowDriftsDrawer/contents'


export const useEcFilters = () => {
  const { data: userProfile } = useUserProfileContext()
  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()

  const ecFilters = useMemo(() => {
    return isPrimeAdmin || isSupportToMspDashboardAllowed
      ? { tenantType: [AccountType.MSP_EC, AccountType.MSP_REC] }
      : { mspAdmins: [userProfile?.adminId], tenantType: [AccountType.MSP_EC, AccountType.MSP_REC] }
  }, [isPrimeAdmin, isSupportToMspDashboardAllowed])

  return ecFilters
}

const partialConfigTemplateTypeLabelMap: Partial<Record<ConfigTemplateType, MessageDescriptor>> = {
  [ConfigTemplateType.NETWORK]: defineMessage({ defaultMessage: 'Wi-Fi Network' }),
  [ConfigTemplateType.VENUE]: defineMessage({ defaultMessage: '<VenueSingular></VenueSingular>' }),
  [ConfigTemplateType.AP_GROUP]: defineMessage({ defaultMessage: 'AP Group' }),
  [ConfigTemplateType.SWITCH_CLI]: defineMessage({ defaultMessage: 'Switch CLI Profile' }),
  [ConfigTemplateType.SWITCH_REGULAR]: defineMessage({ defaultMessage: 'Switch Regular Profile' })
}

export function getConfigTemplateTypeLabel (configTemplateType: ConfigTemplateType): string {
  const { $t } = getIntl()
  const policyType = configTemplatePolicyTypeMap[configTemplateType]
  const serviceType = configTemplateServiceTypeMap[configTemplateType]
  const restTypeLabel = partialConfigTemplateTypeLabelMap[configTemplateType]

  if (policyType) {
    return $t(policyTypeLabelMapping[policyType])
  } else if (serviceType) {
    return $t(serviceTypeLabelMapping[serviceType])
  } else if (restTypeLabel) {
    return $t(restTypeLabel)
  }
  return configTemplateType
}

export function getConfigTemplateDriftStatusLabel (driftStatus: ConfigTemplateDriftType): string {
  const { $t } = getIntl()

  return $t(configTemplateDriftTypeLabelMap[driftStatus])
}

type DriftStatusCallback = Partial<Record<ConfigTemplateDriftType, () => void>>

// eslint-disable-next-line max-len
export function ConfigTemplateDriftStatus (props: { row: ConfigTemplate, callbackMap?: DriftStatusCallback }) {
  const { row, callbackMap = {} } = props

  if (!row.driftStatus) return <span></span>

  const callback = callbackMap[row.driftStatus]
  const label = getConfigTemplateDriftStatusLabel(row.driftStatus)

  if (!callback) {
    return <span>{label}</span>
  }

  return <Button
    type='link'
    onClick={() => callback?.()}
    style={{ fontSize: 'var(--acx-body-4-font-size)' }}
    children={label}
  />
}
