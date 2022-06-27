
import { StackedBarChart } from '@acx-ui/components'
import { Table }           from '@acx-ui/components'

import { getDeviceConnectionStatusColors } from './helper'
import * as UI                             from './styledComponents'
import { VenueMarkerOptions }              from './VenueMarkerWithLabel'

import { NavigateProps } from './index'

const columns = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
    width: 50
  },
  {
    title: 'Networking Devices',
    dataIndex: 'networkDevices',
    key: 'networkDevices',
    width: 150
  },
  {
    title: 'Clients',
    dataIndex: 'clients',
    key: 'clients',
    width: 150
  }
]

interface VenueMarkerTooltipProps {
  onNavigate: (params: NavigateProps) => void;
}

export function VenueMarkerTooltip (
  props: { venue: VenueMarkerOptions } & VenueMarkerTooltipProps) {
  const {
    venueId,
    apStat,
    switchStat,
    apsCount,
    switchesCount,
    clientsCount,
    switchClientsCount
  } = props.venue

  const { onNavigate } = props
  const deviceConnectionStatusColors = getDeviceConnectionStatusColors()
  const commonProps = {
    showLabels: false,
    style: { height: 10, width: 100 },
    showTotal: false,
    barColors: deviceConnectionStatusColors
  }

  const data = [
    {
      key: '1',
      name: 'Wi-Fi',
      networkDevices: apsCount > 0
        ? <UI.CellWrapper>
          <StackedBarChart
            data={apStat}
            { ...commonProps }/>
          <UI.TotalCount onClick={() => onNavigate({ venueId, path: 'TBD' })}>
            {apsCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {'No APs'}
        </UI.CellWrapper>,
      clients: clientsCount && clientsCount > 0
        ? <UI.CellWrapper>
          <UI.TotalCount onClick={() => onNavigate({ venueId, path: 'TBD' })}>
            {clientsCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {'No AP Clients'}
        </UI.CellWrapper>
    },
    {
      key: '2',
      name: 'Switch',
      networkDevices: switchesCount > 0
        ? <UI.CellWrapper>
          <StackedBarChart
            data={switchStat}
            { ...commonProps } />
          <UI.TotalCount onClick={() => onNavigate({ venueId, path: 'TBD' })}>
            {switchesCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {'No Switches'}
        </UI.CellWrapper>,
      clients: switchClientsCount && switchClientsCount > 0
        ? <UI.CellWrapper>
          <UI.TotalCount onClick={() => onNavigate({ venueId, path: 'TBD' })}>
            {switchClientsCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {'No Switch Clients'}
        </UI.CellWrapper>
    }
  ]

  return (
    <UI.Wrapper>
      <UI.InfoWindowHeader>
        <UI.Title onClick={() => onNavigate({ venueId, path: 'overview' })}>
          {props.venue.name}
        </UI.Title>
      </UI.InfoWindowHeader>
      <Table
        columns={columns}
        dataSource={data}
        type={'tooltip'}
      />
    </UI.Wrapper>
  )
}
