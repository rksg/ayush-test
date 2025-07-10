import { useState, useEffect } from 'react'

import { Form, Checkbox, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import {
  useUpdateTenantSettingsMutation,
  useGetTenantSettingsQuery
} from '@acx-ui/analytics/services'
import { StepsForm, Loader } from '@acx-ui/components'
import { hasPermission }     from '@acx-ui/user'

export const AdminSettings = () => {
  const { $t } = useIntl()
  const [updateSettings, result] = useUpdateTenantSettingsMutation()
  const settingsQuery = useGetTenantSettingsQuery()
  const [ignoreTcmFailures, setIgnoreTcmFailures] = useState(false)

  useEffect(() => {
    if (settingsQuery.data) {
      const currentValue = settingsQuery.data?.['fetaure-related-events-suppression'] ?? 'false'
      setIgnoreTcmFailures(currentValue === 'true')
    }
  }, [settingsQuery.data])

  const handleCheckboxChange = (checked: boolean) => {
    setIgnoreTcmFailures(checked)
    updateSettings({
      'fetaure-related-events-suppression': checked.toString()
    })
  }

  return (
    <Loader states={[settingsQuery, result]}>
      <Form layout='horizontal' labelAlign='left'>
        <StepsForm.TextContent>
          <Form.Item>
            <Checkbox
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              checked={ignoreTcmFailures}
              value={ignoreTcmFailures}
              disabled={!hasPermission({ permission: 'WRITE_TENANT_SETTINGS' })}
            >
              {$t({ defaultMessage: 'Ignore TCM Connection Failures' })}
            </Checkbox>
          </Form.Item>
          <Typography.Paragraph className='indent greyText'>
            {$t({
              defaultMessage:
                'When enabled, transient connection failures will not affect incidents, ' +
                'health metrics, or appear in client troubleshooting views.'
            })}
          </Typography.Paragraph>
        </StepsForm.TextContent>
      </Form>
    </Loader>
  )
}