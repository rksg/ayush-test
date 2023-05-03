import { Badge, Button, Typography } from 'antd'
import { useIntl }                   from 'react-intl'

import { IncidentsBySeverityData, useIncidentsBySeverityQuery } from '@acx-ui/analytics/components'
import { AnalyticsFilter }                                      from '@acx-ui/analytics/utils'
import { Card, Descriptions, Loader, StackedBarChart }          from '@acx-ui/components'
import { DateFormatEnum, formatter }                            from '@acx-ui/formatter'
import { SwitchStatusEnum, SwitchViewModel }                    from '@acx-ui/rc/utils'
import { noDataDisplay, useDateFilter }                         from '@acx-ui/utils'

import { getDeviceColor, switchStatus } from './utils'

export function SwitchDetailsCard (props: {
    switchDetail: SwitchViewModel
    isLoading: boolean
  }) {
  const { switchDetail, isLoading } = props
  const { $t } = useIntl()
  const { dateFilter } = useDateFilter()

  const filters = {
    ...dateFilter,
    path: [{ type: 'switch', name: switchDetail?.switchMac?.toUpperCase() as string },
      { type: 'switchGroup', name: switchDetail?.venueId }]
  } as AnalyticsFilter

  const incidentData = useIncidentsBySeverityQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    }),
    skip: !switchDetail?.switchMac || !switchDetail?.venueId
  })

  const totalIncidents = incidentData?.data.P1
                  + incidentData?.data.P2
                  + incidentData?.data.P3
                  + incidentData?.data.P4

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
          style={{ alignItems: 'center' }}
          contentStyle={{ display: 'inline-flex',
            alignItems: 'center' }}
          children={
            incidentData?.data ?
              <>{ !! totalIncidents &&
                <StackedBarChart
                  style={{ height: 16, width: 135, marginRight: 4 }}
                  barWidth={12}
                  showLabels={false}
                  showTotal={false}
                  data={[{
                    category: 'Switch Incidents',
                    series: [
                      {
                        name: 'P1',
                        value: incidentData?.data.P1
                      },
                      {
                        name: 'P2',
                        value: incidentData?.data.P2
                      },
                      {
                        name: 'P3',
                        value: incidentData?.data.P3
                      },
                      {
                        name: 'P4',
                        value: incidentData?.data.P4
                      }
                    ]
                  }]} />
              }
              <Typography.Text>
                { totalIncidents }
              </Typography.Text>
              </>
              : noDataDisplay
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
