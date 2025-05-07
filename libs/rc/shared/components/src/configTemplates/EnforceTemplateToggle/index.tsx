import { useEffect, useState } from 'react'

import { Space, Switch } from 'antd'
import { useIntl }       from 'react-intl'

import { cssStr, Tooltip }                           from '@acx-ui/components'
import { Features }                                  from '@acx-ui/feature-toggle'
import { useUpdateEnforcementStatusMutation }        from '@acx-ui/rc/services'
import { ConfigTemplateUrlsInfo, useConfigTemplate } from '@acx-ui/rc/utils'
import { getOpsApi }                                 from '@acx-ui/utils'

import { withTemplateFeatureGuard } from '../utils'

export function EnforceTemplateToggle (props: { initValue?: boolean }) {
  const { setSaveEnforcementConfigFn } = useConfigTemplate()
  const { initValue } = props
  const { $t } = useIntl()
  const [ checked , setChecked ] = useState(initValue ?? false)
  const [ updateEnforcementStatus ] = useUpdateEnforcementStatusMutation()

  const onSave = async (templateId: string, enabled: boolean) => {
    try {
      await updateEnforcementStatus({
        params: { templateId },
        payload: { enabled }
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  useEffect(() => {
    if (setSaveEnforcementConfigFn) {
      setSaveEnforcementConfigFn((templateId: string) => onSave(templateId, checked))
    }
  }, [setSaveEnforcementConfigFn, checked])

  useEffect(() => {
    setChecked(initValue ?? false)
  }, [initValue])

  return <Space align='center'>
    <Switch checked={checked} onChange={setChecked} />
    <span style={{ fontSize: cssStr('--acx-body-4-font-size') }}>
      {$t({ defaultMessage: 'Enforce template configuration' })}
      <Tooltip.Question
        // eslint-disable-next-line max-len
        title={$t({ defaultMessage: 'If selected, all direct changes by EC on template-activated elements will be blocked to enforce compliance.' })}
        placement='right'
        iconStyle={{ height: '16px', width: '16px', marginBottom: '-4px', marginLeft: '4px' }}
      />
    </span>
  </Space>
}

export const ProtectedEnforceTemplateToggle = withTemplateFeatureGuard({
  WrappedComponent: EnforceTemplateToggle,
  featureId: Features.CONFIG_TEMPLATE_ENFORCED,
  rbacOpsIds: [getOpsApi(ConfigTemplateUrlsInfo.updateEnforcement)]
})

export const ProtectedEnforceTemplateToggleP1 = withTemplateFeatureGuard({
  WrappedComponent: EnforceTemplateToggle,
  featureId: Features.CONFIG_TEMPLATE_ENFORCED_P1,
  rbacOpsIds: [getOpsApi(ConfigTemplateUrlsInfo.updateEnforcement)]
})

export const ProtectedEnforceTemplateToggleVenue = withTemplateFeatureGuard({
  WrappedComponent: EnforceTemplateToggle,
  featureId: Features.CONFIG_TEMPLATE_ENFORCED_VENUE,
  rbacOpsIds: [getOpsApi(ConfigTemplateUrlsInfo.updateEnforcement)]
})
