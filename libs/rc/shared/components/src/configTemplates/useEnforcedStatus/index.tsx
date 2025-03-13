import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { ConfigTemplateType, EnforceableFields, useConfigTemplate } from '@acx-ui/rc/utils'
import { getIntl }                                                  from '@acx-ui/utils'

import { AllowedEnforcedType, ConfigTemplateEnforcementContext, enforcedActionMsg, GetStepsFormProps } from './constants'


export function useEnforcedStatus (type: AllowedEnforcedType) {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const enforcedFields = useContext(ConfigTemplateEnforcementContext)
  const isConfigTemplateEnforcedPocEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED)

  const enforcedAvailableMap: Record<AllowedEnforcedType, boolean> = {
    [ConfigTemplateType.NETWORK]: useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED),
    [ConfigTemplateType.VENUE]: useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED),
    [ConfigTemplateType.DPSK]: useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED_P1),
    [ConfigTemplateType.RADIUS]: useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED_P1),
    [ConfigTemplateType.WIFI_CALLING]: useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED_P1)
  }

  // eslint-disable-next-line max-len
  const hasEnforcedItem = (target: Array<EnforceableFields> | undefined): boolean => {
    const enforcedAvailable = type ? enforcedAvailableMap[type] : isConfigTemplateEnforcedPocEnabled

    if (!target || !enforcedAvailable || isTemplate) return false

    return target.some(item => item.isEnforced)
  }

  const getEnforcedActionMsg = (target: Array<EnforceableFields> | undefined): string => {
    return hasEnforcedItem(target) ? $t(enforcedActionMsg) : ''
  }

  const hasEnforcedFields = () => {
    return hasEnforcedItem([enforcedFields])
  }

  const getEnforcedStepsFormProps = <T extends 'StepsForm' | 'StepsFormLegacy'>(
    formType: T, isEnforced?: boolean
  ): GetStepsFormProps<T> | undefined => {

    const enforced = isEnforced ?? hasEnforcedFields()
    if (!enforced) return undefined

    return (formType === 'StepsForm'
      ? { buttonProps: { apply: getEnforcedButtonProps() } }
      : { buttonProps: { submit: getEnforcedButtonProps() } }
    ) as GetStepsFormProps<T>
  }

  return { hasEnforcedItem, getEnforcedActionMsg, getEnforcedStepsFormProps }
}

function getEnforcedButtonProps () {
  const { $t } = getIntl()

  return { disabled: true, tooltip: $t(enforcedActionMsg) }
}
