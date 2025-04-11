import { useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Descriptions, Drawer, Subtitle }                                                                         from '@acx-ui/components'
import { NetworkSegmentTypeEnum, getNetworkSegmentTypeString, TunnelProfileViewData, MtuTypeEnum, ageTimeUnitConversion } from '@acx-ui/rc/utils'

interface TunnelDetailsDrawerProps {
  data?: TunnelProfileViewData
}

export const TunnelDetailsDrawer = (props: TunnelDetailsDrawerProps) => {
  const { data } = props
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)

  const ageTimeUnit = ageTimeUnitConversion(data?.ageTimeMinutes)

  const openDrawer = () => {
    setVisible(true)
  }

  const handleClose = () => {
    setVisible(false)
  }

  const drawerContent = <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'AP to Cluster Settings' })}
    </Subtitle>
    <Descriptions layout='vertical' colon={false} noSpace>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Destination RUCKUS Edge cluster' })}
      >
        <Form.Item>
          {data?.destinationEdgeClusterName}
        </Form.Item>
      </Descriptions.Item>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Network Segment Type' })}
      >
        <Form.Item>
          {getNetworkSegmentTypeString($t, data?.type || NetworkSegmentTypeEnum.VXLAN, true)}
        </Form.Item>
      </Descriptions.Item>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Gateway Path MTU Mode' })}
      >
        <Form.Item>
          {
            MtuTypeEnum.AUTO === data?.mtuType ?
              $t({ defaultMessage: 'Auto' }) :
              `${$t({ defaultMessage: 'Manual' })} (${data?.mtuSize})`
          }
        </Form.Item>
      </Descriptions.Item>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Force Fragmentation' })}
      >
        <Form.Item>
          {
            data?.forceFragmentation?
              $t({ defaultMessage: 'ON' }) :
              $t({ defaultMessage: 'OFF' })
          }
        </Form.Item>
      </Descriptions.Item>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Idle Period' })}
      >
        <Form.Item>
          {`${ageTimeUnit?.value} ${ageTimeUnit?.unit}`}
        </Form.Item>
      </Descriptions.Item>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Tunnel Keep Alive Interval' })}
      >
        <Form.Item>
          {`${data?.keepAliveInterval} ${$t({ defaultMessage: 'seconds' })}`}
        </Form.Item>
      </Descriptions.Item>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Tunnel Keep Alive Retries' })}
      >
        <Form.Item>
          {`${data?.keepAliveRetry} ${$t({ defaultMessage: 'retries' })}`}
        </Form.Item>
      </Descriptions.Item>
    </Descriptions>
  </>

  return (
    <>
      <Button
        type='link'
        children={$t({ defaultMessage: 'Tunnel details' })}
        onClick={openDrawer}
      />
      <Drawer
        title={$t(
          { defaultMessage: 'Tunnel Details: {tunnelProfileName}' },
          { tunnelProfileName: data?.name }
        )}
        visible={visible}
        onClose={handleClose}
        children={drawerContent}
        width={500}
      />
    </>
  )
}