
import { StackedBarChart } from '@acx-ui/components'
import { Table }           from '@acx-ui/components'

import { getDeviceConnectionStatusColors } from './helper'
import * as UI                             from './styledComponents'
import { VenueMarkerOptions }              from './VenueMarkerWithLabel'

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

const navigateToVenuePage = (venueId: string) => {
  // TODO: confirm the path
  window.location.href = '/venues/' + venueId
}

const navigateToClientsPage = (venueId: string) => {
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

  const deviceConnectionStatusColors = getDeviceConnectionStatusColors()
  const onClickHandler = () => { navigateToClientsPage(venueId!) }
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
          <UI.TotalCount onClick={onClickHandler}>
            {apsCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {'No APs'}
        </UI.CellWrapper>,
      clients: clientsCount && clientsCount > 0
        ? <UI.CellWrapper>
          <UI.TotalCount onClick={onClickHandler}>
            {clientsCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {'No Connected Clients'}
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
          <UI.TotalCount onClick={onClickHandler}>
            {switchesCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {'No Switches'}
        </UI.CellWrapper>,
      clients: switchClientsCount && switchClientsCount > 0
        ? <UI.CellWrapper>
          <UI.TotalCount onClick={onClickHandler}>
            {switchClientsCount}
          </UI.TotalCount>
        </UI.CellWrapper>
        : <UI.CellWrapper>
          {'No Connected Clients'}
        </UI.CellWrapper>
    }
  ]

  return (
    <UI.Wrapper>
      <UI.InfoWindowHeader>
        <UI.Title onClick={() => navigateToVenuePage(venueId!)}>{props.venue.name}</UI.Title>
      </UI.InfoWindowHeader>
      <Table
        columns={columns}
        dataSource={data}
        type={'tooltip'}
      />
    </UI.Wrapper>
  )
}
