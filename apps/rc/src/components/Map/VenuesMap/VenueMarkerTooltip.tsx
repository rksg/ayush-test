import { defineMessage, useIntl } from 'react-intl'

import { StackedBarChart }                 from '@acx-ui/components'
import { Table }                           from '@acx-ui/components'
import { getDeviceConnectionStatusColors } from '@acx-ui/components'

import * as UI                from './styledComponents'
import { VenueMarkerOptions } from './VenueMarkerWithLabel'

import { NavigateProps } from './index'

function getCols ({ $t }: ReturnType<typeof useIntl>) {
  const columns = [
    {
      title: '',
      dataIndex: 'name',
      key: 'name',
      width: 50
    },
    {
      title: $t({ defaultMessage: 'Networking Devices' }),
      dataIndex: 'networkDevices',
      key: 'networkDevices'
    },
    {
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      key: 'clients'
    }
  ]
  return columns
}

interface VenueMarkerTooltipProps {
  onNavigate?: (params: NavigateProps) => void;
  needPadding?: boolean
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
    switchClientsCount
  } = props.venueMarker

  const { onNavigate, needPadding = true } = props
  const deviceConnectionStatusColors = getDeviceConnectionStatusColors()
  const commonProps = {
    animation: false,
    showLabels: false,
    style: { height: 10, width: 100 },
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
        ? <UI.CellWrapper>
          <StackedBarChart
            data={apStat}
            {...commonProps}/>
          <UI.TotalCount onClick={() => onNavigate && onNavigate({ venueId, path: 'TBD' })}>
            {apsCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {$t({ defaultMessage: 'No APs' })}
        </UI.CellWrapper>,
      clients: clientsCount && clientsCount > 0
        ? <UI.CellWrapper>
          <UI.TotalCount onClick={() => onNavigate && onNavigate({ venueId, path: 'TBD' })}>
            {clientsCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {$t({ defaultMessage: 'No AP Clients' })}
        </UI.CellWrapper>
    },
    {
      key: '2',
      name: $t({ defaultMessage: 'Switch' }),
      networkDevices: switchesCount > 0
        ? <UI.CellWrapper>
          <StackedBarChart
            data={switchStat}
            {...commonProps} />
          <UI.TotalCount onClick={() => onNavigate && onNavigate({ venueId, path: 'TBD' })}>
            {switchesCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {$t({ defaultMessage: 'No Switches' })}
        </UI.CellWrapper>,
      clients: switchClientsCount && switchClientsCount > 0
        ? <UI.CellWrapper>
          <UI.TotalCount onClick={() => onNavigate && onNavigate({ venueId, path: 'TBD' })}>
            {switchClientsCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {$t({ defaultMessage: 'No Switch Clients' })}
        </UI.CellWrapper>
    }
  ]

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
