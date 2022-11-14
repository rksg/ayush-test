import { useIntl } from 'react-intl'
import { Subtitle }                  from '@acx-ui/components'
import { Divider, Form } from 'antd'
import { ApLanPort, ApRadio } from '@acx-ui/rc/utils'

interface ApDetailsSettingsProps {
  lanPortsSetting: ApLanPort
  radioSetting: ApRadio
}

export const ApDetailsSettings = (props: ApDetailsSettingsProps) => {
  const { $t } = useIntl()
  const { lanPortsSetting, radioSetting } = props

  const displaySetting = (data: boolean) => {
    return data ? $t({ defaultMessage: 'Same as Venue' }) : $t({ defaultMessage: 'Custom' })
  }
  
  const displayEnabled = (data: boolean) => {
    return data ? $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
  }

  return (
    <Form
      labelCol={{ span: 10 }}
      labelAlign='left'
      style={{ marginTop: '25px' }}
    >
      <Form.Item
        label={
          <Subtitle level={4} style={{ margin: 0 }}>
            {$t({ defaultMessage: 'Wireless Radio' })}
          </Subtitle>
        }
        children={
          displaySetting(radioSetting?.useVenueSettings)
        }
      />
      <Form.Item
        label={'2.4 GHz'}
        children={
          displayEnabled(radioSetting?.enable24G)
        }
      />
      <Form.Item
        label={'5 GHz'}
        children={
          displayEnabled(radioSetting?.enable24G)
        }
      />
      <Divider/>
      <Form.Item
        label={
          <Subtitle level={4} style={{ margin: 0 }}>
            {$t({ defaultMessage: 'LAN Port' })}
          </Subtitle>
        }
        children={
          displaySetting(lanPortsSetting?.useVenueSettings)
        }
      />
      { lanPortsSetting?.lanPorts && lanPortsSetting.lanPorts.map(
        item => 
          <Form.Item
            label={$t({ defaultMessage: 'Port {id}' }, {id: item.portId})}
            children={
              displayEnabled(!!item.enabled)
            }
          />
        )
      }
      {/* TODO: Wait Service feature support
      <Divider/>
      <Form.Item 
        label={
          <Subtitle level={4} style={{ margin: 0 }}>
            {$t({ defaultMessage: 'mDNS Proxy' })}
          </Subtitle>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Service Name' })}
      /> */}
    </Form>
   )
}

 
