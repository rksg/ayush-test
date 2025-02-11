import { defineMessage, useIntl } from 'react-intl'

import { Button, ButtonProps, Loader, Tooltip }                                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                                        from '@acx-ui/feature-toggle'
import { AllowedEnforcedConfigTemplateTypes, useGetConfigTemplateInstanceEnforcedQuery } from '@acx-ui/rc/services'
import { EnforceableFields, useConfigTemplate }                                          from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
const enforcedActionMsg = defineMessage({ defaultMessage: 'Action is disabled due to enforcement from the template' })

interface EnforcedAwareButtonProps extends ButtonProps {
  configTemplateType: AllowedEnforcedConfigTemplateTypes
  instanceId?: string
}

export function EnforcedButton (props: EnforcedAwareButtonProps) {
  const { $t } = useIntl()
  const isFFEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED)
  const { isTemplate } = useConfigTemplate()
  const { instanceId, configTemplateType, ...rest } = props
  const isEnforcementEnabled = isFFEnabled && !isTemplate && instanceId

  const { data, isLoading } = useGetConfigTemplateInstanceEnforcedQuery({
    params: {}, payload: { instanceId: instanceId!, type: configTemplateType }
  }, { skip: !isEnforcementEnabled })

  return <Loader states={[ { isLoading } ]} style={{ height: '32px' }}>
    {isEnforcementEnabled && data?.isEnforced
      ? <Tooltip
        title={$t(enforcedActionMsg)}
        placement='left'
        children={<span><Button {...rest} disabled={data?.isEnforced} /></span>}
      />
      : <Button {...rest} />
    }
  </Loader>
}

export function useEnforcedStatus () {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const isConfigTemplateEnforcedEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED)

  const hasEnforcedItem = (target: Array<EnforceableFields> | undefined): boolean => {
    if (!target || !isConfigTemplateEnforcedEnabled || isTemplate) return false

    return target.some(item => item.isEnforced && item.isManagedByTemplate)
  }

  const getEnforcedActionMsg = (target: Array<EnforceableFields> | undefined): string => {
    return hasEnforcedItem(target) ? $t(enforcedActionMsg) : ''
  }

  return { hasEnforcedItem, getEnforcedActionMsg }
}
