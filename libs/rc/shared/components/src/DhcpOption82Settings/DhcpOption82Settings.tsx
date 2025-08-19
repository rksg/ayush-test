import { useState, useEffect } from 'react'

import { Form,  Switch, Space } from 'antd'
import { useIntl }              from 'react-intl'

import { Tooltip }                                               from '@acx-ui/components'
import type { DhcpOption82Settings as DhcpOption82SettingsType } from '@acx-ui/rc/utils'

import { DhcpOption82SettingsDrawer } from './DhcpOption82SettingsDrawer'
import { FieldLabel, ConfigIcon }     from './styledComponents'

interface DhcpOption82SettingsProps {
  index: number,
  onGUIChanged?: (fieldName: string) => void
  readOnly: boolean
}

export const DhcpOption82Settings = (props: DhcpOption82SettingsProps) => {
  const { $t } = useIntl()

  const [ iconVisible, setIconVisible ] = useState<boolean>(false)
  const [ drawerVisible, setDrawerVisible ] = useState<boolean>(false)
  const form = Form.useFormInstance()

  const {
    index,
    onGUIChanged,
    readOnly
  } = props

  const dhcpOption82EnabledFieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Enabled']
  const dhcpOption82SettingsFieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Settings']
  const dhcpOption82EnabledValue = Form.useWatch(dhcpOption82EnabledFieldName, form)
  const dhcpOption82SettingsValues = Form.useWatch(dhcpOption82SettingsFieldName, form)

  useEffect(() => {
    setIconVisible(!!dhcpOption82EnabledValue)
  }, [dhcpOption82EnabledValue])

  const applyCallbackFn = (dhcpOption82Settings: DhcpOption82SettingsType) => {
    form.setFieldValue(dhcpOption82EnabledFieldName, true)
    form.setFieldValue(dhcpOption82SettingsFieldName, dhcpOption82Settings)
    onGUIChanged && onGUIChanged('DHCPOption82Settings')
  }

  const cancelCallbackFn = () => {
    if (!dhcpOption82SettingsValues) {
      form.setFieldValue(dhcpOption82EnabledFieldName, false)
    }
  }

  return (
    <>
      <FieldLabel width='220px'>
        <Space style={{ marginBottom: '10px' }}>
          {$t({ defaultMessage: 'DHCP Option 82' })}
          <Tooltip.Question
            title={
              $t({ defaultMessage: 'When enabled, the AP includes the DHCP ' +
                'request ID in packets forwarded to the DHCP server. ' +
                'The DHCP server then allocates an IP address to the ' +
                'client based on this information.' })
            }
            placement='right'
            iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
          />
        </Space>
        <Form.Item
          style={{ marginTop: '-5px' }}
          children={
            <>
              <Form.Item
                valuePropName='checked'
                name={dhcpOption82EnabledFieldName}
                noStyle>
                <Switch
                  data-testid={'dhcpoption82-switch-toggle'}
                  disabled={readOnly}
                  onChange={(checked) => {
                    onGUIChanged && onGUIChanged('DHCPOption82Enabled')
                    setDrawerVisible(checked)
                    if (!checked) {
                      cancelCallbackFn()
                    }
                  }}
                />
              </Form.Item>
              {
                iconVisible && <ConfigIcon
                  style={{ cursor: 'pointer' }}
                  data-testid={'dhcp82toption-icon'}
                  onClick={() => {
                    setDrawerVisible(true)
                  }}
                />
              }
            </>
          }
        />
        <Form.Item
          name={dhcpOption82SettingsFieldName}
          hidden
        />
      </FieldLabel>
      <DhcpOption82SettingsDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        applyCallbackFn={applyCallbackFn}
        cancelCallbackFn={cancelCallbackFn}
        readOnly={readOnly}
        sourceData={dhcpOption82SettingsValues}
      />
    </>
  )
}
