import { useState } from 'react'


import { Form,  Switch, Space } from 'antd'
import { useIntl }              from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import { DhcpOption82SettingsDrawer } from './DhcpOption82SettingsDrawer'
import { FieldLabel, ConfigIcon }     from './styledComponents'


export const DhcpOption82Settings = () => {
  const { $t } = useIntl()

  const [ iconVisible, setIconVisible ] = useState<boolean>(false)
  const [ drawerVisible, setDrawerVisible ] = useState<boolean>(false)
  const [ enableDhcpOption82, setEnableDhcpOption82] = useState<boolean>(false)

  const callbackFn = () => {
    setEnableDhcpOption82(true)
    setIconVisible(true)
  }


  return (
    <>
      <FieldLabel width='180px'>

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
          valuePropName='checked'
          style={{ marginTop: '-5px' }}
          children={
            <>
              <Switch
                checked={enableDhcpOption82}
                onClick={(checked) => {
                  if (checked) {
                    setDrawerVisible(true)
                  } else {
                    setIconVisible(false)
                    setEnableDhcpOption82(false)
                  }
                }
                }/>
              {
                iconVisible && <ConfigIcon
                  onClick={() => {
                    setDrawerVisible(true)
                  }}
                />
              }
            </>
          }
        />
      </FieldLabel>
      <DhcpOption82SettingsDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        callbackFn={callbackFn}/>
    </>
  )
}