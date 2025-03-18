import { createContext, useContext } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { StepsFormLegacyProps, StepsFormProps } from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { EnforceableFields, useConfigTemplate } from '@acx-ui/rc/utils'
import { getIntl }                              from '@acx-ui/utils'

// eslint-disable-next-line max-len
const enforcedActionMsg = defineMessage({ defaultMessage: 'Action is disabled due to enforcement from the template' })

export const ConfigTemplateEnforcementContext = createContext({} as EnforceableFields)

type GetStepsFormProps<T> = T extends 'StepsForm'
  ? StepsFormProps
  : T extends 'StepsFormLegacy' ? StepsFormLegacyProps : never

export function useEnforcedStatus () {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const isConfigTemplateEnforcedEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED)
  const enforcedFields = useContext(ConfigTemplateEnforcementContext)

  const hasEnforcedItem = (target: Array<EnforceableFields> | undefined): boolean => {
    if (!target || !isConfigTemplateEnforcedEnabled || isTemplate) return false

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
    if (!hasEnforcedItem([{ isEnforced: enforced }])) return undefined

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
