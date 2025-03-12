import { EdgeMvSdLanViewData, EdgeSdLanFixtures } from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import EdgeMvSdLan from '.'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const mockedEdgeSdLanDmz = mockedMvSdLanDataList[0]
const mockedSdLanVenueId = mockedEdgeSdLanDmz.tunneledWlans![0].venueId

jest.mock('./NetworkTable', () => ({
  NetworkTable: () => {
    return <div data-testid='rc-sdlan-NetworkTable' />
  }
}))

const renderTestComponent = ({ params, sdLan }:
  { params: { tenantId: string, venueId: string }, sdLan: EdgeMvSdLanViewData }) => {
  render(
    <Provider>
      <EdgeMvSdLan data={sdLan} />
    </Provider>, {
      route: { params }
    })
}
describe('Venue Edge SD-LAN Service - Multi-venue', () => {
  let params: { tenantId: string, venueId: string } = {
    tenantId: 't-tenant',
    venueId: mockedSdLanVenueId
  }

  it('should render correctly', async () => {
    const mockedEdgeSdLanDc = mockedMvSdLanDataList[1]
    renderTestComponent({ params, sdLan: mockedEdgeSdLanDc })

    // display config data
    expect(await screen.findByRole('link', { name: 'Mocked_SDLAN_2' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'SE_Cluster 1' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Mocked_tunnel-2' })).toBeVisible()
    screen.getByTestId('rc-sdlan-NetworkTable')
  })

  it('should render DMZ scenario correctly', async () => {
    renderTestComponent({ params, sdLan: mockedEdgeSdLanDmz })

    // display config data
    expect(await screen.findByRole('link', { name: 'Mocked_SDLAN_1' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'SE_Cluster 0' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Mocked_tunnel-1' })).toBeVisible()
    screen.getByTestId('rc-sdlan-NetworkTable')
  })
})