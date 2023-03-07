import { Badge, Button, Table } from 'antd'
import { useIntl }              from 'react-intl'

import { Card, Descriptions, Loader }                                                                   from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                    from '@acx-ui/formatter'
import { ApDeviceStatusEnum, APExtended, APView, RadioProperties, SwitchStatusEnum, transformApStatus } from '@acx-ui/rc/utils'

import * as UI                                     from './styledComponents'
import { getDeviceColor, getWirelessRadioColumns } from './utils'



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
      <Descriptions labelWidthPercent={40}>
        {/* model  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'AP Model' })}
          children={apDetail?.model || '--'} />

        {/* MAC address  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'MAC Address' })}
          children={apDetail?.apMac || '--'} />

        {/* IP Address  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={apDetail?.IP || '--'} />

        {/* Status  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Status' })}
          children={
            <Badge
              key={apDetail?.apMac + 'status'}
              color={getDeviceColor(apDetail?.deviceStatus as SwitchStatusEnum)}
              text={transformApStatus(useIntl(),
                apDetail?.deviceStatus as ApDeviceStatusEnum,
                APView.AP_OVERVIEW_PAGE).message} // passing AP_OVERVIEW_PAGE to get single AP status message
            />
          } />

        {/* Health  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Health' })}
          children={apDetail?.healthStatus || '--'} />

        {/* Wireless Radio  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Wireless Radio' })}
          children={''} />
        <Descriptions.Item
          labelStyle={{
            width: 0
          }}
          label={''}
          children={
            <UI.WirelessRadioTableContainer>
              <Table
                columns={getWirelessRadioColumns()}
                dataSource={wirelessRadioDetails}
                size='small'
                pagination={false} />
            </UI.WirelessRadioTableContainer>
          } />

        {/* Clients count  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Clients Connected' })}
          children={apDetail?.clients || '--'} />

        {/* Last seen for offline devices */
          apDetail?.lastSeenTime &&
        <Descriptions.Item
          label={$t({ defaultMessage: 'Last Seen' })}
          children={formatter(DateFormatEnum.DateTimeFormat)(apDetail?.lastSeenTime)} />
        }
      </Descriptions>

    </Loader>
  </Card>
}