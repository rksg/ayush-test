import { Badge, Button, Space } from 'antd'
import moment                   from 'moment'
import { useIntl }              from 'react-intl'

import { IncidentsBySeverityData, useIncidentToggles, useIncidentsBySeverityQuery } from '@acx-ui/analytics/components'
import { Card, Descriptions, getDefaultEarliestStart, Loader }                      from '@acx-ui/components'
import { useIsSplitOn, Features }                                                   from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                                from '@acx-ui/formatter'
import { CloseSymbol }                                                              from '@acx-ui/icons'
import { SwitchStatusEnum, SwitchViewModel, transformSwitchUnitStatus }             from '@acx-ui/rc/utils'
import { useLocation }                                                              from '@acx-ui/react-router-dom'
import { noDataDisplay, useDateFilter }                                             from '@acx-ui/utils'
import type { AnalyticsFilter }                                                     from '@acx-ui/utils'

import IncidentStackedBar from './IncidentStackedBar'
import * as UI            from './styledComponents'
import { getDeviceColor } from './utils'


export function SwitchDetailsCard (props: {
    switchDetail: SwitchViewModel,
    isLoading: boolean,
    onClose: () => void
  }) {
  const { switchDetail, isLoading, onClose } = props
  const { $t } = useIntl()
  const toggles = useIncidentToggles()
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { dateFilter } = useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })
  const location = useLocation()

  const filters = {
    ...dateFilter,
    filter: {
      switchNodes: [[{ type: 'switch', name: switchDetail?.switchMac?.toUpperCase() as string },
        { type: 'switchGroup', name: switchDetail?.venueId }]],
      networkNodes: [[]]
    }
  } as AnalyticsFilter

  const incidentData = useIncidentsBySeverityQuery({ ...filters, toggles }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    }),
    skip: !switchDetail?.switchMac || !switchDetail?.venueId
  })

  const parseTime = (datetime: string) => {
    const time = datetime.split(', ')
    if(time[time.length -1]){
      time[time.length -1] = moment(time[time.length -1], 'HH:mm:ss').format('HH:mm:ss')
    }
    return time.join(', ')
  }

  const switchName = switchDetail?.name
  || switchDetail?.id
  || switchDetail?.switchMac
  || $t({ defaultMessage: 'Unknown' }) // for unknown device

  return <Card><Card.Title>
    <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
      <UI.NodeTitle
        state={{ from: location.pathname }}
        // eslint-disable-next-line max-len
        to={`/devices/switch/${switchDetail?.id || switchDetail?.serialNumber}/${switchDetail?.serialNumber}/details/overview`}>
        { switchName }
      </UI.NodeTitle>
      <Button
        size='small'
        type='link'
        onClick={onClose}
        icon={<CloseSymbol />}
        data-testid='closeNodeTooltip' />
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

      {/* IP Address  */
        switchDetail?.deviceStatus !== SwitchStatusEnum.DISCONNECTED &&
      <Descriptions.Item
        label={$t({ defaultMessage: 'IP Address' })}
        children={switchDetail?.ipAddress || noDataDisplay} />
      }
      {/* Status  */}
      <Descriptions.Item
        label={$t({ defaultMessage: 'Status' })}
        children={<Badge
          key={switchDetail?.id + 'status'}
          color={getDeviceColor(switchDetail?.deviceStatus as SwitchStatusEnum)}
          text={transformSwitchUnitStatus(switchDetail?.deviceStatus as SwitchStatusEnum)} />} />

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

      {/* Uptime  */
        switchDetail?.deviceStatus !== SwitchStatusEnum.DISCONNECTED &&
      <Descriptions.Item
        label={$t({ defaultMessage: 'Uptime' })}
        children={parseTime(switchDetail?.uptime || '') || noDataDisplay} />
      }
      {/* Clients count  */
        switchDetail?.deviceStatus !== SwitchStatusEnum.DISCONNECTED &&
      <Descriptions.Item
        label={$t({ defaultMessage: 'Clients Connected' })}
        children={switchDetail?.clientCount || noDataDisplay} />
      }
      {/* Last seen for offline devices */
        switchDetail?.deviceStatus === SwitchStatusEnum.DISCONNECTED &&
        switchDetail?.syncDataEndTime &&
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last Seen' })}
        children={formatter(DateFormatEnum.DateTimeFormat)(switchDetail?.syncDataEndTime)} />
      }
    </Descriptions>
  </Loader>
  </Card>
}
