import { defineMessage, useIntl } from 'react-intl'

import { Button, ButtonProps, Tooltip }         from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { EnforceableFields, useConfigTemplate } from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
const enforcedActionMsg = defineMessage({ defaultMessage: 'Action is disabled due to enforcement from the template' })

type EnforcedAwareButtonProps = ButtonProps & EnforceableFields

export function EnforcedButton (props: EnforcedAwareButtonProps) {
  const isFFEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED)
  const { isTemplate } = useConfigTemplate()
  const { isEnforced, ...rest } = props
  const isEnforcementEnabled = isFFEnabled && !isTemplate
  const { hasEnforcedItem, getEnforcedActionMsg } = useEnforcedStatus()

  return (isEnforcementEnabled && hasEnforcedItem([props]))
    ? <Tooltip
      title={getEnforcedActionMsg([props])}
      children={<span><Button {...rest} disabled={true} /></span>}
    />
    : <Button {...rest} />
}

export function useEnforcedStatus () {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const isConfigTemplateEnforcedEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED)

  const hasEnforcedItem = (target: Array<EnforceableFields> | undefined): boolean => {
    if (!target || !isConfigTemplateEnforcedEnabled || isTemplate) return false

    return target.some(item => item.isEnforced)
  }

  const getEnforcedActionMsg = (target: Array<EnforceableFields> | undefined): string => {
    return hasEnforcedItem(target) ? $t(enforcedActionMsg) : ''
  }

  return { hasEnforcedItem, getEnforcedActionMsg }
}
