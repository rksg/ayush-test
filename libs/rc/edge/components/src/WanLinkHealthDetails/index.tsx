import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                                             from '@acx-ui/components'
import { EdgeWanLinkHealthCheckPolicy, transformDisplayText } from '@acx-ui/rc/utils'

interface EdgeWanLinkHealthDetailsDrawerProps {
  visible: boolean
  setVisible: (ifName: string | undefined) => void
  portName: string | undefined
  healthCheckPolicy: EdgeWanLinkHealthCheckPolicy | undefined
}

export const EdgeWanLinkHealthDetailsDrawer = (props: EdgeWanLinkHealthDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, portName, healthCheckPolicy } = props

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
          transformDisplayText(healthCheckPolicy?.protocol)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Target IP Addresses' })}
        children={
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {healthCheckPolicy?.targetIpAddresses?.map((ip) => {
              return <li key={ip} children={ip} />
            })}
          </ul>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Test Failure Condition' })}
        children={
          transformDisplayText(healthCheckPolicy?.linkDownCriteria)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Check Interval' })}
        children={
          $t({ defaultMessage: `{interval} {interval, plural,
              one {Second}
              other {Seconds}}` },
          { interval: healthCheckPolicy?.intervalSeconds } )
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Mark Link as DOWN after...' })}
        children={
          $t({ defaultMessage: `{count} {count, plural,
              one {Try}
              other {Tries}}` },
          { count: healthCheckPolicy?.maxCountToDown } )
        }
      />

      <Form.Item
        label={$t({ defaultMessage: 'Mark Link as UP after...' })}
        children={
          $t({ defaultMessage: `{count} {count, plural,
            one {Try}
            other {Tries}}` },
          { count: healthCheckPolicy?.maxCountToUp } )
        }
      />
    </Form>
  )

  return (
    <Drawer
      title={$t({ defaultMessage: '{portName}: Link Health Monitoring' }, { portName })}
      visible={visible}
      onClose={onClose}
      children={content}
      width={'480px'}
    />
  )
}