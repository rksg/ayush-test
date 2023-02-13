import { Badge, Button, Col, Row } from 'antd'
import { useIntl }                 from 'react-intl'

import { Card, Loader }                      from '@acx-ui/components'
import { SwitchStatusEnum, SwitchViewModel } from '@acx-ui/rc/utils'

import { getDeviceColor, switchStatus } from './utils'


export function SwitchDetailsCard (props: {
    switchDetail: SwitchViewModel
    isLoading: boolean
  }) {
  const { switchDetail, isLoading } = props
  const { $t } = useIntl()

  return <Card
    type='no-border'
  ><Card.Title>
      <Button
        style={{
          padding: 0
        }}
        size='small'
        type='link'>
        {switchDetail?.name
        || switchDetail?.id
        || switchDetail?.switchMac
        || $t({ defaultMessage: 'Unknown' }) // for unknown device
        }
      </Button>
    </Card.Title>
    <Loader states={[
      { isLoading }
    ]}>
      {/* model  */}
      <Row
        gutter={[12, 24]}
        style={{
          lineHeight: '24px'
        }}>
        <Col span={12} >
          { $t({ defaultMessage: 'Model' })}:
        </Col>
        <Col span={12} >
          {switchDetail?.model || '--'}
        </Col>
      </Row>
      {/* mac address  */}
      <Row
        gutter={[12, 24]}
        style={{
          lineHeight: '24px'
        }}>
        <Col span={12} >
          { $t({ defaultMessage: 'mac' })}:
        </Col>
        <Col span={12} >
          {switchDetail?.switchMac || '--'}
        </Col>
      </Row>
      {/* IP Address  */}
      <Row
        gutter={[12, 24]}
        style={{
          lineHeight: '24px'
        }}>
        <Col span={12} >
          { $t({ defaultMessage: 'IP Address' })}:
        </Col>
        <Col span={12} >
          {switchDetail?.ipAddress || '--'}
        </Col>
      </Row>
      {/* Status  */}
      <Row
        gutter={[12, 24]}
        style={{
          lineHeight: '24px'
        }}>
        <Col span={12} >
          {$t({ defaultMessage: 'Status' })}:
        </Col>
        <Col span={12} >
          <Badge
            key={switchDetail?.id + 'status'}
            color={getDeviceColor(switchDetail?.deviceStatus as SwitchStatusEnum)}
            text={switchStatus(switchDetail?.deviceStatus as SwitchStatusEnum)} />
        </Col>
      </Row>
      {/* Uptime  */}
      <Row
        gutter={[12, 24]}
        style={{
          lineHeight: '24px'
        }}>
        <Col span={12} >
          { $t({ defaultMessage: 'Uptime' })}:
        </Col>
        <Col span={12} >
          {switchDetail?.uptime || '--'}
        </Col>
      </Row>
      {/* Clients count  */}
      <Row
        gutter={[12, 24]}
        style={{
          lineHeight: '24px'
        }}>
        <Col span={12} >
          { $t({ defaultMessage: 'Clients Connected' })}:
        </Col>
        <Col span={12} >
          {switchDetail?.clientCount || '--'}
        </Col>
      </Row>
      {/* Last seen for offline devices */
        switchDetail?.lastSeenTime &&
        <Row
          gutter={[12, 24]}
          style={{
            lineHeight: '24px'
          }}>
          <Col span={12} >
            { $t({ defaultMessage: 'Last Seen' })}:
          </Col>
          <Col span={12} >
            {switchDetail?.lastSeenTime || '--'}
          </Col>
        </Row>
      }
    </Loader>
  </Card>
}