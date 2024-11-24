import { useState } from 'react'


import { Form,  Switch } from 'antd'
import { useIntl }       from 'react-intl'

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
        {$t({ defaultMessage: 'DHCP Option 82' })}
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