import userEvent from '@testing-library/user-event'

import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { OltInfoWidget } from '.'

const { mockOlt, mockOltCageList } = OltFixtures


jest.mock('./OltDetailsDrawer', () => ({
  OltDetailsDrawer: () => <div data-testid='OltDetailsDrawer' />
}))

describe('OltInfoWidget', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'

  it('should render correctly', async () => {
    render(<Provider>
      <OltInfoWidget
        oltDetails={mockOlt}
        oltCages={mockOltCageList}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByText('MF-2')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Device Details' }))
    expect(screen.getByTestId('OltDetailsDrawer')).toBeVisible()
  })

  it('should render without cage data correctly', async () => {
    render(<Provider>
      <OltInfoWidget
        oltDetails={mockOlt}
        oltCages={undefined}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByText('MF-2')).toBeVisible()
    expect(screen.getByText('0')).toBeVisible()
  })
})