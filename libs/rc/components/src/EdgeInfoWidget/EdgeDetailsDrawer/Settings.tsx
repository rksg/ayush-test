
import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Subtitle }                       from '@acx-ui/components'
import { EdgeDnsServers, EdgePortStatus } from '@acx-ui/rc/utils'

interface SettingsProps {
  edgePortsSetting: EdgePortStatus[] | undefined
  dnsSetting: EdgeDnsServers | undefined
}

export const Settings = (props: SettingsProps) => {
  const { $t } = useIntl()
  const { edgePortsSetting, dnsSetting } = props

  const displayEnabled = (data: string, type: string) => {
    return data === 'Enabled' ?
      $t({ defaultMessage: '{data} ({type})' }, { data, type }) :
      $t({ defaultMessage: '{data}' }, { data })
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
            {$t({ defaultMessage: 'Ports' })}
          </Subtitle>
        }
      />
      { edgePortsSetting && edgePortsSetting.map(
        (item, index) =>
          <Form.Item
            key={`port-${item.portId}`}
            label={$t({ defaultMessage: 'Port {id}' }, { id: index + 1 })}
            children={
              displayEnabled(item.adminStatus, item.type)
            }
          />
      )
      }


      <Form.Item
        label={
          <Subtitle level={4} style={{ margin: 0 }}>
            {$t({ defaultMessage: 'DNS Server' })}
          </Subtitle>
        }
      />

      <Form.Item
        label={$t({ defaultMessage: 'Primary DNS Server' })}
        children={
          dnsSetting?.primary || '--'
        }
      />

      <Form.Item
        label={$t({ defaultMessage: 'Secondary DNS Server' })}
        children={
          dnsSetting?.secondary || '--'
        }
      />

    </Form>
  )
}