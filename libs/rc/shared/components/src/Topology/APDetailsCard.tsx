import { Badge, Button, Divider, Space } from 'antd'
import { useIntl }                       from 'react-intl'

import { IncidentsBySeverityData, useIncidentsBySeverityQuery }                                     from '@acx-ui/analytics/components'
import { Card, Descriptions, Loader, Subtitle }                                                     from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                from '@acx-ui/formatter'
import { CloseSymbol }                                                                              from '@acx-ui/icons'
import { ApDeviceStatusEnum, APMeshRole, APView, ApViewModel, SwitchStatusEnum, transformApStatus } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                               from '@acx-ui/react-router-dom'
import { noDataDisplay, useDateFilter }                                                             from '@acx-ui/utils'
import type { AnalyticsFilter }                                                                     from '@acx-ui/utils'

import IncidentStackedBar              from './IncidentStackedBar'
import * as UI                         from './styledComponents'
import { getDeviceColor, getMeshRole } from './utils'


export function APDetailsCard (props: {
    apDetail: ApViewModel,
    isLoading: boolean,
    onClose: () => void
  }) {
  const { apDetail, isLoading, onClose } = props
  const { $t } = useIntl()

  const { dateFilter } = useDateFilter()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/wifi')

  const filters = {
    ...dateFilter,
    filter: {
      networkNodes: [[
        { type: 'zone', name: apDetail?.venueId },
        { type: 'AP', name: apDetail?.apMac as string }
      ]]
    }
  } as AnalyticsFilter

  const incidentData = useIncidentsBySeverityQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    }),
    skip: !apDetail?.venueId || !apDetail?.apMac
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
          onClick={
            () =>{
              navigate({
                pathname: `${basePath.pathname}/${apDetail?.apMac}/details/overview`
              })
            }}
          disabled={!(apDetail?.apMac)}
          type='link'>
          {apDetail?.name
              || apDetail?.apMac
              || $t({ defaultMessage: 'Unknown' }) // for unknown device
          }
        </UI.NodeTitle>
        <Button size='small' type='link' onClick={onClose} icon={<CloseSymbol />}/>
      </Space>
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
          contentStyle={{
            alignSelf: 'center',
            display: 'inline-flex'
          }}
          children={
            incidentData?.data &&
            <IncidentStackedBar
              incidentData={incidentData?.data}
              isLoading={incidentData?.isLoading}
              category='AP Incidents'
            />
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
      {/* Mesh Role  */}
      <Descriptions labelWidthPercent={50}>
        <Descriptions.Item
          label={$t({ defaultMessage: 'Mesh Role' })}
          children={
            getMeshRole(apDetail?.meshRole as APMeshRole || noDataDisplay)
          }
        />
      </Descriptions>
      {/* Connected APs  */}
      <Descriptions labelWidthPercent={50}>
        <Descriptions.Item
          label={$t({ defaultMessage: 'Connected APs' })}
          children={apDetail?.downLinkCount || noDataDisplay}
        />
      </Descriptions>

    </Loader>
  </Card>
}
