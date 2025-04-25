import { Form }       from 'antd'
import { capitalize } from 'lodash'
import { useIntl }    from 'react-intl'

import { Drawer }                    from '@acx-ui/components'
import { EdgeMultiWanConfigStatus  } from '@acx-ui/rc/utils'

import { getWanProtocolString, getWanLinkDownCriteriaString } from '../utils/dualWanUtils'

interface EdgeWanLinkHealthDetailsDrawerProps {
  visible: boolean
  setVisible: (ifName: string | undefined) => void
  portName: string | undefined
  data: EdgeMultiWanConfigStatus | undefined
}

export const EdgeWanLinkHealthDetailsDrawer = (props: EdgeWanLinkHealthDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, portName, data } = props

  const onClose = () => {
    setVisible(undefined)
  }

  const content = (
    <Form
      labelCol={{ span: 9 }}
      labelAlign='left'
    >
      <Form.Item
        label={$t({ defaultMessage: 'Protocol' })}
        children={
          getWanProtocolString(data?.monitorProtocol)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Target IP Addresses' })}
        children={
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {data?.monitorTargets?.map((ip) => {
              return <li key={ip} children={ip} />
            })}
          </ul>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Test Failure Condition' })}
        children={
          getWanLinkDownCriteriaString(data?.monitorLinkDownCriteria)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Check Interval' })}
        children={
          $t({ defaultMessage: `{interval} {interval, plural,
              one {Second}
              other {Seconds}}` },
          { interval: data?.monitorIntervalSec } )
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Mark Link as DOWN after...' })}
        children={
          $t({ defaultMessage: `{count} {count, plural,
              one {Try}
              other {Tries}}` },
          { count: data?.monitorMaxCountToDown } )
        }
      />

      <Form.Item
        label={$t({ defaultMessage: 'Mark Link as UP after...' })}
        children={
          $t({ defaultMessage: `{count} {count, plural,
            one {Try}
            other {Tries}}` },
          { count: data?.monitorMaxCountToUp } )
        }
      />
    </Form>
  )

  return (
    <Drawer
      title={$t({ defaultMessage: '{portName}: Link Health Monitoring' },
        { portName: capitalize(portName) })}
      visible={visible}
      onClose={onClose}
      children={content}
      width={'480px'}
    />
  )
}