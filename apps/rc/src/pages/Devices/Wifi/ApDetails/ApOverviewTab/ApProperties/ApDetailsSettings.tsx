import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import { Descriptions, Subtitle } from '@acx-ui/components'
import { ApLanPort, ApRadio }     from '@acx-ui/rc/utils'

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

  return (<>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={
          <Subtitle level={4} style={{ margin: 0 }}>
            {$t({ defaultMessage: 'Wireless Radio' })}
          </Subtitle>
        }
        children={
          displaySetting(radioSetting?.useVenueSettings)
        }
      />
      <Descriptions.Item
        label={'2.4 GHz'}
        children={
          displayEnabled(radioSetting?.enable24G)
        }
      />
      <Descriptions.Item
        label={'5 GHz'}
        children={
          displayEnabled(radioSetting?.enable50G)
        }
      />
    </Descriptions>
    <Divider/>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
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
          <Descriptions.Item
            label={$t({ defaultMessage: 'Port {id}' }, { id: item.portId })}
            children={
              displayEnabled(!!item.enabled)
            }
          />
      )
      }
    </Descriptions>
    {/* TODO: Wait Service feature support
    <Divider/>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={
          <Subtitle level={4} style={{ margin: 0 }}>
            {$t({ defaultMessage: 'mDNS Proxy' })}
          </Subtitle>
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Service Name' })}
      />
    </Descriptions>
    */}
  </>)
}


