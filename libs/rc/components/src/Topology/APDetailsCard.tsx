import { Badge, Button, Col, Row, Table } from 'antd'
import { useIntl }                        from 'react-intl'

import { Card, Loader }                                                                                 from '@acx-ui/components'
import { ApDeviceStatusEnum, APExtended, APView, RadioProperties, SwitchStatusEnum, transformApStatus } from '@acx-ui/rc/utils'

import * as UI                                  from './styledComponents'
import { getDeviceColor, wirelessRadioColumns } from './utils'


export function APDetailsCard (props: {
    apDetail: APExtended,
    isLoading: boolean
  }) {
  const { apDetail, isLoading } = props
  const { $t } = useIntl()

  const wirelessRadioDetails: RadioProperties[] =
    apDetail?.apStatusData?.APRadio as RadioProperties[]

  return <Card
    type='no-border'
  ><Card.Title>
      <Button
        style={{
          padding: 0
        }}
        size='small'
        type='link'>
        {apDetail?.name
        || apDetail?.apMac
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
          { $t({ defaultMessage: 'AP Model' })}:
        </Col>
        <Col span={12} >
          {apDetail?.model || '--'}
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
          {apDetail?.apMac || '--'}
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
          {apDetail?.IP || '--'}
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
            key={apDetail?.apMac + 'status'}
            color={getDeviceColor(apDetail?.deviceStatus as SwitchStatusEnum)}
            text={transformApStatus(useIntl(),
                apDetail?.deviceStatus as ApDeviceStatusEnum,
                APView.AP_OVERVIEW_PAGE).message} // passing AP_OVERVIEW_PAGE to get single AP status message
          />
        </Col>
      </Row>
      {/* Wireless Radio  */}
      <Row
        gutter={[12, 8]}
        style={{
          lineHeight: '24px'
        }}>
        <Col span={24} >
          {$t({ defaultMessage: 'Wireless Radio' })}:
        </Col>
        <Col span={24} >
          <UI.WirelessRadioTableContainer>
            <Table
              columns={wirelessRadioColumns}
              dataSource={wirelessRadioDetails}
              size='small'
              pagination={false} />
          </UI.WirelessRadioTableContainer>
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
          {apDetail?.clients || '--'}
        </Col>
      </Row>
      {/* Last seen for offline devices */
        apDetail?.lastSeenTime &&
        <Row
          gutter={[12, 24]}
          style={{
            lineHeight: '24px'
          }}>
          <Col span={12} >
            { $t({ defaultMessage: 'Last Seen' })}:
          </Col>
          <Col span={12} >
            {apDetail?.lastSeenTime}
          </Col>
        </Row>
      }
    </Loader>
  </Card>
}