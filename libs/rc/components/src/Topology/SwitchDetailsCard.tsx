import { Badge, Button } from 'antd'
import { useIntl }       from 'react-intl'

import { Card, Descriptions, Loader }                       from '@acx-ui/components'
import { DateFormatEnum, formatter }                        from '@acx-ui/formatter'
import { noDataDisplay, SwitchStatusEnum, SwitchViewModel } from '@acx-ui/rc/utils'

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
      <Descriptions labelWidthPercent={40}>
        {/* model  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Model' })}
          children={switchDetail?.model || noDataDisplay} />

        {/* MAC address  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'MAC Address' })}
          children={switchDetail?.switchMac || noDataDisplay} />

        {/* IP Address  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={switchDetail?.ipAddress || noDataDisplay} />

        {/* Status  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Status' })}
          children={<Badge
            key={switchDetail?.id + 'status'}
            color={getDeviceColor(switchDetail?.deviceStatus as SwitchStatusEnum)}
            text={switchStatus(switchDetail?.deviceStatus as SwitchStatusEnum)} />} />

        {/* Uptime  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Uptime' })}
          children={switchDetail?.uptime || noDataDisplay} />

        {/* Clients count  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Clients Connected' })}
          children={switchDetail?.clientCount || noDataDisplay} />

        {/* Last seen for offline devices */
          switchDetail?.lastSeenTime &&
        <Descriptions.Item
          label={$t({ defaultMessage: 'Last Seen' })}
          children={formatter(DateFormatEnum.DateTimeFormat)(switchDetail?.lastSeenTime)} />
        }
      </Descriptions>
    </Loader>
  </Card>
}