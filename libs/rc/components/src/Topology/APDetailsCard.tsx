import { Badge, Button, Divider, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { IncidentsBySeverityData, useIncidentsBySeverityQuery }                                     from '@acx-ui/analytics/components'
import { AnalyticsFilter }                                                                          from '@acx-ui/analytics/utils'
import { Card, Descriptions, Loader, StackedBarChart, Subtitle }                                    from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                from '@acx-ui/formatter'
import { ApDeviceStatusEnum, APMeshRole, APView, ApViewModel, SwitchStatusEnum, transformApStatus } from '@acx-ui/rc/utils'
import { noDataDisplay, useDateFilter }                                                             from '@acx-ui/utils'

import * as UI                         from './styledComponents'
import { getDeviceColor, getMeshRole } from './utils'


export function APDetailsCard (props: {
    apDetail: ApViewModel,
    isLoading: boolean
  }) {
  const { apDetail, isLoading } = props
  const { $t } = useIntl()

  const { dateFilter } = useDateFilter()

  const filters = {
    ...dateFilter,
    path: [{ type: 'zone', name: apDetail?.venueId },
      { type: 'AP', name: apDetail?.apMac as string }]
  } as AnalyticsFilter

  const incidentData = useIncidentsBySeverityQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    })
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
        {apDetail?.name
        || apDetail?.apMac
        || $t({ defaultMessage: 'Unknown' }) // for unknown device
        }
      </Button>
    </Card.Title>
    <Loader states={[
      { isLoading }
    ]}>
      <Descriptions labelWidthPercent={50} contentStyle={{ alignItems: 'center' }}>
        {/* model  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'AP Model' })}
          children={apDetail?.model || noDataDisplay} />

        {/* MAC address  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'MAC Address' })}
          children={apDetail?.apMac || 'noDataDisplay'} />

        {/* IP Address  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={apDetail?.IP || noDataDisplay} />

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

        {/* Incidents */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Incidents (Last 24 hrs)' })}
          style={{ alignItems: 'center' }}
          contentStyle={{ display: 'inline-flex',
            alignItems: 'center' }}
          children={
            incidentData?.data ?
              <>
                { !!totalIncidents && <StackedBarChart
                  style={{ height: 16, width: 135, marginRight: 4 }}
                  barWidth={12}
                  showLabels={false}
                  showTotal={false}
                  data={[{
                    category: 'AP Incidents',
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
                  }]} /> }
                <Typography.Text>
                  { totalIncidents }
                </Typography.Text>
              </>
              : noDataDisplay
          }
        />

        {/* Health  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Health' })}
          children={apDetail?.healthStatus || noDataDisplay} />

        {/* Wireless Radio  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Wireless Radio' })}
          children={''} />
        <Descriptions.Item
          children={<Descriptions.NoLabel>
            <UI.WirelessRadioTableContainer><UI.TextHeader>
              <label></label>
              <label>
                <span>{$t({ defaultMessage: 'RF' })}</span>
                <span>{$t({ defaultMessage: 'Channel' })}</span>
              </label>
              <label>
                <span>{$t({ defaultMessage: 'RF' })}</span>
                <span>{$t({ defaultMessage: 'Bandwidth' })}</span>
              </label>
              <label>
                <span>{$t({ defaultMessage: 'TX Power' })}</span>
              </label>
            </UI.TextHeader>
            {
              apDetail?.channel24 &&
                (
                  <UI.TextNumber>
                    <label><Subtitle level={5}>{ '2.4 GHz' }</Subtitle></label>
                    <span>{apDetail.channel24.channel || noDataDisplay}</span>
                    <span>{apDetail.channel24.operativeChannelBandwidth || noDataDisplay}</span>
                    <span>{apDetail.channel24.txPower || noDataDisplay}</span>
                  </UI.TextNumber>
                )
            }
            {
              apDetail?.channel50 &&
                (
                  <UI.TextNumber>
                    <label><Subtitle level={5}>{ '5 GHz' }</Subtitle></label>
                    <span>{apDetail.channel50.channel || noDataDisplay}</span>
                    <span>{apDetail.channel50.operativeChannelBandwidth || noDataDisplay}</span>
                    <span>{apDetail.channel50.txPower || noDataDisplay}</span>
                  </UI.TextNumber>
                )
            }
            {
              apDetail?.channelL50 &&
                (
                  <UI.TextNumber>
                    <label><Subtitle level={5}>{ 'LO 5 GHz' }</Subtitle></label>
                    <span>{apDetail.channelL50.channel || noDataDisplay}</span>
                    <span>{apDetail.channelL50.operativeChannelBandwidth || noDataDisplay}</span>
                    <span>{apDetail.channelL50.txPower || noDataDisplay}</span>
                  </UI.TextNumber>
                )
            }
            {
              apDetail?.channelU50 &&
                (
                  <UI.TextNumber>
                    <label><Subtitle level={5}>{ 'HI 5 GHz' }</Subtitle></label>
                    <span>{apDetail.channelU50.channel || noDataDisplay}</span>
                    <span>{apDetail.channelU50.operativeChannelBandwidth || noDataDisplay}</span>
                    <span>{apDetail.channelU50.txPower || noDataDisplay}</span>
                  </UI.TextNumber>
                )
            }
            {
              apDetail?.channel60 &&
                (
                  <UI.TextNumber>
                    <label><Subtitle level={5}>{ '6 GHz' }</Subtitle></label>
                    <span>{apDetail.channel60.channel || noDataDisplay}</span>
                    <span>{apDetail.channel60.operativeChannelBandwidth || noDataDisplay}</span>
                    <span>{apDetail.channel60.txPower || noDataDisplay}</span>
                  </UI.TextNumber>
                )
            }
            </UI.WirelessRadioTableContainer>
          </Descriptions.NoLabel>}
        />

        {/* Clients count  */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Clients Connected' })}
          children={apDetail?.clients || noDataDisplay} />

        {/* Last seen for offline devices */
          apDetail?.lastSeenTime &&
        <Descriptions.Item
          label={$t({ defaultMessage: 'Last Seen' })}
          children={formatter(DateFormatEnum.DateTimeFormat)(apDetail?.lastSeenTime)} />
        }

      </Descriptions>
      <Divider />
      <Descriptions labelWidthPercent={50}>
        <Descriptions.Item
          label={$t({ defaultMessage: 'Mesh Role' })}
          children={
            getMeshRole(apDetail?.meshRole as APMeshRole || noDataDisplay)
          }
        />
      </Descriptions>

    </Loader>
  </Card>
}