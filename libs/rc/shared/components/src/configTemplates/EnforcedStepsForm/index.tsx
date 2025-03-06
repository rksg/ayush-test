import { createContext, useContext } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { StepsForm, StepsFormLegacy, StepsFormLegacyProps, StepsFormProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { EnforceableFields, useConfigTemplate }                             from '@acx-ui/rc/utils'
import { getIntl }                                                          from '@acx-ui/utils'

// eslint-disable-next-line max-len
const enforcedActionMsg = defineMessage({ defaultMessage: 'Action is disabled due to enforcement from the template' })
// eslint-disable-next-line max-len
export const ConfigTemplateEnforcementContext = createContext({} as EnforceableFields)

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

  return { hasEnforcedItem, getEnforcedActionMsg, hasEnforcedFields }
}

function getEnforcedButtonProps () {
  const { $t } = getIntl()

  return { disabled: true, tooltip: $t(enforcedActionMsg) }
}

export function EnforcedStepsForm<T> (props: StepsFormProps<T>) {
  const { hasEnforcedFields } = useEnforcedStatus()

  if (!hasEnforcedFields()) return <StepsForm<T> {...props} />

  const enforcedButtonProps: StepsFormProps['buttonProps'] = {
    ...props.buttonProps,
    apply: getEnforcedButtonProps()
  }

  return <StepsForm<T>
    {...props}
    buttonProps={enforcedButtonProps}
  />
}

// eslint-disable-next-line max-len
export function EnforcedStepsFormLegacy<T> (props: React.PropsWithChildren<StepsFormLegacyProps<T>>) {
  const { hasEnforcedFields } = useEnforcedStatus()

  if (!hasEnforcedFields()) return <StepsFormLegacy<T> {...props} />

  const enforcedButtonProps: StepsFormLegacyProps['buttonProps'] = {
    ...props.buttonProps,
    submit: getEnforcedButtonProps()
  }

  return <StepsFormLegacy<T>
    {...props}
    buttonProps={enforcedButtonProps}
  />
}
