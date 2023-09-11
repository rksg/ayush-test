import { Badge, Button, Space } from 'antd'
import { useIntl }              from 'react-intl'

import { IncidentsBySeverityData, useIncidentsBySeverityQuery } from '@acx-ui/analytics/components'
import { Card, Descriptions, Loader }                           from '@acx-ui/components'
import { DateFormatEnum, formatter }                            from '@acx-ui/formatter'
import { CloseSymbol }                                          from '@acx-ui/icons'
import { SwitchStatusEnum, SwitchViewModel }                    from '@acx-ui/rc/utils'
import { noDataDisplay, useDateFilter }                         from '@acx-ui/utils'
import type { AnalyticsFilter }                                 from '@acx-ui/utils'

import IncidentStackedBar               from './IncidentStackedBar'
import * as UI                          from './styledComponents'
import { getDeviceColor, switchStatus } from './utils'


export function SwitchDetailsCard (props: {
    switchDetail: SwitchViewModel,
    isLoading: boolean,
    onClose: () => void
  }) {
  const { switchDetail, isLoading, onClose } = props
  const { $t } = useIntl()
  const { dateFilter } = useDateFilter()

  const filters = {
    ...dateFilter,
    filter: {
      switchNodes: [[{ type: 'switch', name: switchDetail?.switchMac?.toUpperCase() as string },
        { type: 'switchGroup', name: switchDetail?.venueId }]]
    }
  } as AnalyticsFilter

  const incidentData = useIncidentsBySeverityQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    }),
    skip: !switchDetail?.switchMac || !switchDetail?.venueId
  })

  return <Card
    type='no-border'
  ><Card.Title>
      <Space>
        <UI.NodeTitle
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
        </UI.NodeTitle>
        <Button size='small' type='link' onClick={onClose} icon={<CloseSymbol />}/>
      </Space>
    </Card.Title>
    <Loader states={[
      { isLoading }
    ]}>
      <Descriptions labelWidthPercent={50}>
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

        {/* Incidents */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Incidents (Last 24 hrs)' })}
          contentStyle={{
            alignSelf: 'center',
            display: 'inline-flex'
          }}
          children={
            incidentData?.data &&
            <IncidentStackedBar
              incidentData={incidentData?.data}
              isLoading={incidentData?.isLoading}
              category='Switch Incidents'
            />
          }
        />

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
