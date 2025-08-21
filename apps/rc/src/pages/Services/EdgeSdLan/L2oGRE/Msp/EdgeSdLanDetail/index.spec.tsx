import userEvent from '@testing-library/user-event'

import { EdgeSdLanFixtures } from '@acx-ui/rc/utils'
import { render, screen }    from '@acx-ui/test-utils'

import { EdgeSdLanDetail } from '.'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

jest.mock('../../EdgeSdLanDetail/VenueTable', () => ({
  VenueTable: () => <div data-testid='VenueTable' />
}))

jest.mock('./VenueTemplateTable', () => ({
  VenueTemplateTable: () => <div data-testid='VenueTemplateTable' />
}))

jest.mock('../../shared/CompatibilityCheck', () => ({
  CompatibilityCheck: () => <div data-testid='CompatibilityCheck' />
}))

jest.mock('@acx-ui/rc/services', () => ({
  useGetEdgeMvSdLanViewDataListQuery: () => ({
    edgeSdLanData: mockedMvSdLanDataList[0],
    isLoading: false,
    isFetching: false
  })
}))

describe('EdgeSdLanDetail - MSP', () => {
  it('should render', async () => {
    render(<EdgeSdLanDetail />, {
      route: { params: { serviceId: mockedMvSdLanDataList[0].id } }
    })

    expect(screen.getByText('Mocked_SDLAN_1')).toBeVisible()
    expect(screen.getByText('Service Health')).toBeVisible()
    expect(screen.getByText('Poor')).toBeVisible()
    expect(screen.getByText('Tunnel Profile (AP to Cluster)')).toBeVisible()
    expect(screen.getByText('Mocked_tunnel-1')).toBeVisible()
    expect(screen.getByText('Destination RUCKUS Edge cluster')).toBeVisible()
    expect(screen.getByText('SE_Cluster 0')).toBeVisible()
    expect(screen.getByText('Tunnel Profile (Cluster to DMZ)')).toBeVisible()
    expect(screen.getByText('Mocked_tunnel-3')).toBeVisible()
    expect(screen.getByText('DMZ Cluster')).toBeVisible()
    expect(screen.getByText('SE_Cluster 3')).toBeVisible()
    expect(screen.getByText('Apply Service To…')).toBeVisible()
    expect(screen.getByText('My account')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Configure' })).toBeVisible()
    expect(screen.getByTestId('CompatibilityCheck')).toBeVisible()
    expect(screen.getByTestId('VenueTable')).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /Venue Templates/i }))
    expect(await screen.findByTestId('VenueTemplateTable')).toBeVisible()
  })
})