
import { StackedBarChart } from '@acx-ui/components'
import { Table }           from '@acx-ui/components'

import { getDeviceConnectionStatusColors } from './constant'
import * as UI                             from './styledComponents'
import { VenueMarkerOptions }              from './VenueMarkerWithLabel'

const columns = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Networking Devices',
    dataIndex: 'networkDevices',
    key: 'networkDevices'
  },
  {
    title: 'Clients',
    dataIndex: 'clients',
    key: 'clients'
  }
]

const navigateToVenuePage = (venueId: any) => {
  // TODO: confirm the path
  window.location.href = '/venues/' + venueId
}

const navigateToClientsPage = (venueId: any) => {
  // TODO: confirm the path
  window.location.href = '/clients/' + venueId
}

export function VenueMarkerTooltip (props: { venue: VenueMarkerOptions }) {
  const {
    venueId,
    apStat,
    switchStat,
    apsCount,
    switchesCount,
    clientsCount,
    switchClientsCount
  } = props.venue
  const chartStyles = { height: 20, width: 135 }
  const deviceConnectionStatusColors = getDeviceConnectionStatusColors()
  const onClickHandler = () => { navigateToClientsPage(venueId) }
  const data = [
    {
      key: '1',
      name: 'Wi-Fi',
      networkDevices: apsCount > 0
        ? <UI.CellWrapper>
          <StackedBarChart
            style={chartStyles}
            data={apStat}
            barColors={deviceConnectionStatusColors}
            showLabels={false}
            showTotal={false}/>
          <UI.TotalCount onClick={onClickHandler}>
            {apsCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {'No APs'}
        </UI.CellWrapper>,
      clients: clientsCount && clientsCount > 0
        ? <UI.CellWrapper>
          <StackedBarChart
            style={chartStyles}
            data={apStat}
            barColors={deviceConnectionStatusColors}
            showLabels={false}
            showTotal />
          <UI.TotalCount onClick={onClickHandler}>
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
            style={chartStyles}
            data={switchStat}
            barColors={deviceConnectionStatusColors}
            showLabels={false} />
          <UI.TotalCount onClick={onClickHandler}>
            {switchesCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {'No Switches'}
        </UI.CellWrapper>,
      clients: switchClientsCount && switchClientsCount > 0
        ? <UI.CellWrapper>
          <StackedBarChart
            style={chartStyles}
            data={switchStat}
            barColors={deviceConnectionStatusColors}
            showLabels={false} />
          <UI.TotalCount onClick={onClickHandler}>
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
        <UI.Title onClick={() => navigateToVenuePage(venueId)}>{props.venue.name}</UI.Title>
      </UI.InfoWindowHeader>
      <Table
        columns={columns}
        dataSource={data}
        style={{ width: '100%' }}
        type={'tooltip'}
      />
    </UI.Wrapper>
  )
}
