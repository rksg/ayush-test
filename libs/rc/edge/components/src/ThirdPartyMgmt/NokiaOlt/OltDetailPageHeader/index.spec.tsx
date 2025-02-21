import userEvent from '@testing-library/user-event'

import { EdgeNokiaCageData, EdgeNokiaOltData, EdgeOltFixtures } from '@acx-ui/rc/utils'
import { Provider }                                             from '@acx-ui/store'
import { screen, render }                                       from '@acx-ui/test-utils'

import { EdgeNokiaOltDetailsPageHeader } from '.'
const { mockOlt, mockOltCageList, mockOfflineOlt } = EdgeOltFixtures

jest.mock( './DetailsDrawer', () => ({
  // eslint-disable-next-line max-len
  OltDetailsDrawer: (props: { visible: boolean, setVisible: () => void, currentOlt?: EdgeNokiaOltData }) =>
    props.visible && <div data-testid='OltDetailsDrawer'>{JSON.stringify(props.currentOlt)}</div>
}))

describe('EdgeNokiaOltDetailsPageHeader', () => {
  const params = { tenantId: 'mock-tenant-id', oltId: 'mock-olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'

  const props = {
    currentOlt: mockOlt as EdgeNokiaOltData,
    cagesList: mockOltCageList as EdgeNokiaCageData[],
    isLoading: false,
    isFetching: false
  }

  it('test component renders with expected elements', () => {
    render(<Provider>
      <EdgeNokiaOltDetailsPageHeader {...props} />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByText('TestOlt')).toBeInTheDocument()
    expect(screen.getByText('Device Details')).toBeInTheDocument()
  })

  it('should show detail drawer when button is clicked', async () => {
    render(<Provider>
      <EdgeNokiaOltDetailsPageHeader {...props} />
    </Provider>, { route: { params, path: mockPath } })
    const button = screen.getByText('Device Details')
    await userEvent.click(button)
    expect(await screen.findByTestId('OltDetailsDrawer')).toBeVisible()
  })

  it('test component renders with expected text', () => {
    render(<Provider>
      <EdgeNokiaOltDetailsPageHeader {...props} />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByText('Status')).toBeVisible()
    expect(screen.getAllByText('Cages').length).toBe(3)
  })

  it('should display loading icon on cage chart', async () => {
    render(<Provider>
      <EdgeNokiaOltDetailsPageHeader
        currentOlt={mockOfflineOlt}
        cagesList={mockOltCageList as EdgeNokiaCageData[]}
        isLoading={true}
        isFetching={true}
      />
    </Provider>, { route: { params, path: mockPath } })

    screen.getByRole('img', { name: 'loader' })
    expect(screen.queryAllByText('Cages').length).toBe(2)

    const button = screen.getByText('Device Details')
    await userEvent.click(button)
    expect(await screen.findByTestId('OltDetailsDrawer')).toBeVisible()
  })
})