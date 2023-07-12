import { defineMessage, useIntl } from 'react-intl'

import { StackedBarChart, TableProps }     from '@acx-ui/components'
import { Table }                           from '@acx-ui/components'
import { getDeviceConnectionStatusColors } from '@acx-ui/components'
import { VenueMarkerOptions }              from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

import { NavigateProps } from './index'

interface VenueData {
  key: string;
  name: string;
  networkDevices: React.ReactNode;
  clients: React.ReactNode;
}

function getCols ({ $t }: ReturnType<typeof useIntl>): TableProps<VenueData>['columns'] {
  const columns = [
    {
      title: '',
      dataIndex: 'name',
      key: 'name',
      width: 75
    },
    {
      title: $t({ defaultMessage: 'Networking Devices' }),
      dataIndex: 'networkDevices',
      key: 'networkDevices'
    },
    {
      title: $t({ defaultMessage: 'Clients' }),
      align: 'center',
      dataIndex: 'clients',
      key: 'clients'
    }
  ] as TableProps<VenueData>['columns']
  return columns
}

interface VenueMarkerTooltipProps {
  onNavigate?: (params: NavigateProps) => void;
  needPadding?: boolean;
  isEdgeEnabled: boolean;
}

export function VenueMarkerTooltip (
  props: { venueMarker: VenueMarkerOptions } & VenueMarkerTooltipProps) {
  const { $t } = useIntl()
  const {
    name,
    venueId,
    apStat,
    switchStat,
    apsCount,
    switchesCount,
    clientsCount,
    switchClientsCount,
    edgeStat,
    edgesCount
  } = props.venueMarker

  const { onNavigate, needPadding = true, isEdgeEnabled } = props
  const deviceConnectionStatusColors = getDeviceConnectionStatusColors()
  const commonProps = {
    animation: false,
    showLabels: false,
    style: { height: 22, width: 120 },
    showTotal: false,
    barColors: deviceConnectionStatusColors,
    tooltipFormat: defineMessage({
      defaultMessage: '<span><b>{formattedValue}</b></span>'
    })
  }

  const data = [
    {
      key: '1',
      name: $t({ defaultMessage: 'Wi-Fi' }),
      networkDevices: apsCount > 0
        ? <UI.ChartWrapper>
          <StackedBarChart
            data={apStat}
            {...commonProps}/>
          <UI.TotalCount onClick={
            () => onNavigate && onNavigate({ venueId, path: 'venue-details/devices' })}>
            {apsCount}
          </UI.TotalCount>
        </UI.ChartWrapper>
        : <UI.TextWrapper>
          {$t({ defaultMessage: 'No APs' })}
        </UI.TextWrapper>,
      clients: clientsCount && clientsCount > 0
        ? <UI.CountWrapper>
          <UI.TotalCount onClick={
            () => onNavigate && onNavigate({ venueId, path: 'venue-details/clients/wifi' })}>
            {clientsCount}
          </UI.TotalCount>
        </UI.CountWrapper>
        : <UI.TextWrapper>
          {$t({ defaultMessage: 'No AP clients' })}
        </UI.TextWrapper>
    },
    {
      key: '2',
      name: $t({ defaultMessage: 'Switch' }),
      networkDevices: switchesCount > 0
        ? <UI.ChartWrapper>
          <StackedBarChart
            data={switchStat}
            {...commonProps} />
          <UI.TotalCount onClick={
            () => onNavigate && onNavigate({ venueId, path: 'venue-details/devices/switch' })}>
            {switchesCount}
          </UI.TotalCount>
        </UI.ChartWrapper>
        : <UI.TextWrapper>
          {$t({ defaultMessage: 'No Switches' })}
        </UI.TextWrapper>,
      clients: switchClientsCount && switchClientsCount > 0
        ? <UI.CountWrapper>
          <UI.TotalCount onClick={
            () => onNavigate && onNavigate({ venueId, path: 'venue-details/clients/switch' })}>
            {switchClientsCount}
          </UI.TotalCount>
        </UI.CountWrapper>
        : <UI.TextWrapper>
          {$t({ defaultMessage: 'No Switch clients' })}
        </UI.TextWrapper>
    }
  ]

  if (isEdgeEnabled) {
    data.push({
      key: '3',
      name: $t({ defaultMessage: 'SmartEdge' }),
      networkDevices: edgesCount > 0
        ? <UI.ChartWrapper>
          <StackedBarChart
            data={edgeStat}
            {...commonProps} />
          <UI.TotalCount onClick={
            () => onNavigate && onNavigate({ venueId, path: 'venue-details/devices/edge' })}>
            {edgesCount}
          </UI.TotalCount>
        </UI.ChartWrapper>
        : <UI.TextWrapper>
          {$t({ defaultMessage: 'No SmartEdges' })}
        </UI.TextWrapper>,
      clients: <></>

    })
  }

  return (
    <UI.Wrapper needPadding={needPadding}>
      <UI.InfoWindowHeader>
        <UI.Title onClick={
          () => onNavigate && onNavigate({ venueId, path: 'venue-details/overview' })}>
          {name}
        </UI.Title>
      </UI.InfoWindowHeader>
      <Table
        columns={getCols(useIntl())}
        dataSource={data}
        type={'tooltip'}
      />
    </UI.Wrapper>
  )
}
