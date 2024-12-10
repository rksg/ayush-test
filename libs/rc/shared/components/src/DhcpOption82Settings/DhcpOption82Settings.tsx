import { useState, useContext, useEffect } from 'react'


import { Form,  Switch, Space } from 'antd'
import { useIntl }              from 'react-intl'

import { Tooltip }                                               from '@acx-ui/components'
import { useLazyGetSoftGreProfileConfigurationOnAPQuery }        from '@acx-ui/rc/services'
import { DhcpOption82Settings as DhcpOption82SettingsInterface } from '@acx-ui/rc/utils'

import { SoftgreProfileAndDHCP82Context } from '../SoftGRETunnelSettings'

import { DhcpOption82SettingsDrawer } from './DhcpOption82SettingsDrawer'
import { FieldLabel, ConfigIcon }     from './styledComponents'

interface DhcpOption82SettingsProps {
  index: number,
  onGUIChanged?: (fieldName: string) => void
  isUnderAPNetworking: boolean
  serialNumber?: string
  venueId?: string
  portId?: string
}

export const DhcpOption82Settings = (props: DhcpOption82SettingsProps) => {
  const { $t } = useIntl()

  const [ iconVisible, setIconVisible ] = useState<boolean>(false)
  const [ drawerVisible, setDrawerVisible ] = useState<boolean>(false)
  // eslint-disable-next-line max-len
  const [existedDHCP82OptionSettings, setExistedDHCP82OptionSettings] = useState<DhcpOption82SettingsInterface>()
  const form = Form.useFormInstance()

  const { venueApModelLanPortSettingsV1 } = useContext(SoftgreProfileAndDHCP82Context)
  const {
    index,
    onGUIChanged,
    isUnderAPNetworking,
    serialNumber,
    venueId,
    portId
  } = props
  const [ getSoftGreProfileConfiguration ] = useLazyGetSoftGreProfileConfigurationOnAPQuery()
  const dhcpOption82FieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Enabled']

  useEffect(() => {
    const setData = async () => {
      if (isUnderAPNetworking) {
        const { data } = await getSoftGreProfileConfiguration({
          params: { serialNumber, venueId, portId }
        })
        if(data?.softGreSettings?.dhcpOption82Enabled) {
          form.setFieldValue(dhcpOption82FieldName, true)
          setExistedDHCP82OptionSettings(data?.softGreSettings?.dhcpOption82Settings)
          setIconVisible(true)
        }
      } else {
        // eslint-disable-next-line max-len
        const dhcpOption82Enabled = venueApModelLanPortSettingsV1?.softGreSettings?.dhcpOption82Enabled
        if (dhcpOption82Enabled) {
          form.setFieldValue(dhcpOption82FieldName, dhcpOption82Enabled)
          setIconVisible(true)
        }
      }
    }
    setData()
  }, [venueApModelLanPortSettingsV1, serialNumber, venueId, portId])


  const callbackFn = () => {
    form.setFieldValue(dhcpOption82FieldName, true)
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
          style={{ marginTop: '-5px' }}
          children={
            <>
              <Form.Item
                valuePropName='checked'
                name={dhcpOption82FieldName}
                noStyle>
                <Switch
                  onChange={() => {
                    onGUIChanged && onGUIChanged('DHCPOption82Enabled')
                  }}
                  onClick={(checked) => {
                    if (checked) {
                      setDrawerVisible(true)
                    } else {
                      setIconVisible(false)
                      form.setFieldValue(dhcpOption82FieldName, false)
                    }
                  }
                  }/>
              </Form.Item>
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
        isUnderAPNetworking={isUnderAPNetworking}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        callbackFn={callbackFn}
        index={index}
        onGUIChanged={onGUIChanged}
        existedDHCP82OptionSettings={existedDHCP82OptionSettings}
      />
    </>
  )
}
