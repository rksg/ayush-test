import { useEffect, useState } from 'react'

import { Space, Switch } from 'antd'
import { useIntl }       from 'react-intl'

import { cssNumber, Loader, Tooltip }                                        from '@acx-ui/components'
import { Features }                                                          from '@acx-ui/feature-toggle'
import { useGetConfigTemplateListQuery, useUpdateEnforcementStatusMutation } from '@acx-ui/rc/services'
import { ConfigTemplateUrlsInfo, useConfigTemplate }                         from '@acx-ui/rc/utils'
import { getOpsApi }                                                         from '@acx-ui/utils'

import { withTemplateFeatureGuard } from '../utils'

function EnforceTemplateToggle (props: { templateId?: string }) {
  const { setSaveEnforcementConfigFn } = useConfigTemplate()
  const { $t } = useIntl()
  const [ checked, setChecked ] = useState(false)
  const [ updateEnforcementStatus ] = useUpdateEnforcementStatusMutation()
  const { enforced: initValue, isLoading } = useGetConfigTemplateListQuery({
    params: {}, payload: {
      fields: ['id', 'enforced'],
      filters: { id: [props.templateId] }
    }
  }, {
    skip: !props.templateId,
    selectFromResult: ({ data, isLoading }) => ({
      enforced: data?.data?.[0]?.enforced ?? false,
      isLoading
    })
  })

  const onSave = async (templateId: string) => {
    try {
      await updateEnforcementStatus({
        params: { templateId },
        payload: { enabled: checked }
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  useEffect(() => {
    setSaveEnforcementConfigFn((templateId: string) => {
      return onSave(templateId)
    })

  }, [setSaveEnforcementConfigFn])

  useEffect(() => {
    setChecked(initValue ?? false)
  }, [initValue])

  return <Loader states={[ { isLoading } ]}>
    <Space align='center'>
      <Switch checked={checked} onChange={setChecked} />
      <span style={{ fontSize: cssNumber('--acx-body-4-font-size') }}>
        {$t({ defaultMessage: 'Enforce template configuration' })}
        <Tooltip.Question
          // eslint-disable-next-line max-len
          title={$t({ defaultMessage: 'If selected, all direct changes by EC on template-activated elements will be blocked to enforce compliance.' })}
          placement='right'
          iconStyle={{ height: '16px', width: '16px', marginBottom: '-4px', marginLeft: '4px' }}
        />
      </span>
    </Space>
  </Loader>
}

export const ProtectedEnforceTemplateToggle = withTemplateFeatureGuard({
  WrappedComponent: EnforceTemplateToggle,
  featureId: Features.CONFIG_TEMPLATE_ENFORCED,
  rbacOpsIds: [getOpsApi(ConfigTemplateUrlsInfo.updateEnforcement)]
})
