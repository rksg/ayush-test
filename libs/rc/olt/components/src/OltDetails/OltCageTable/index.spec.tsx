import userEvent from '@testing-library/user-event'

import { OltCage, OltFixtures }               from '@acx-ui/olt/utils'
import { Provider }                           from '@acx-ui/store'
import { screen, render, within, mockServer } from '@acx-ui/test-utils'

import { OltCageTable } from '.'

const { mockOlt, mockOltCageList } = OltFixtures

jest.mock('../../OltStatus', () => ({
  OltStatus: () => <div data-testid='OltStatus' />
}))

jest.mock('../EditCageDrawer', () => ({
  EditCageDrawer: () => <div data-testid='EditCageDrawer' />
}))

jest.mock('../ManageOntsSnDrawer', () => ({
  ManageOntsSnDrawer: () => <div data-testid='ManageOntsSnDrawer' />
}))

jest.mock('../ManageCageGroupDrawer', () => ({
  ManageCageGroupDrawer: () => <div data-testid='ManageCageGroupDrawer' />
}))

describe('OltCageTable', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'
  const mockToggleCageReq = jest.fn()

  beforeEach(() => {
    mockToggleCageReq.mockClear()
    mockServer.use(
    )
  })

  it('should render correctly', async () => {
    render(<Provider>
      <OltCageTable
        oltDetails={mockOlt}
        oltCages={mockOltCageList as OltCage[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })
    const row = screen.getByRole('row', { name: /S1\/2/ })
    expect(row).toBeVisible()

    const downCageRow = screen.getByRole('row', { name: /S1\/1/ })
    expect(within(downCageRow).queryByRole('button', { name: 'S1/1' })).toBeNull()
  })

  it('should render loading icon correctly', async () => {
    render(<Provider>
      <OltCageTable
        oltDetails={mockOlt}
        oltCages={mockOltCageList as OltCage[]}
        isLoading={true}
        isFetching={true}
      />
    </Provider>, { route: { params, path: mockPath } })

    screen.getByRole('img', { name: 'loader' })
  })

  it('should handle tab change correctly', async () => {
    render(<Provider>
      <OltCageTable
        oltDetails={mockOlt}
        oltCages={mockOltCageList as OltCage[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    const tab = screen.getByRole('tab', { name: 'PON LC 2' })
    expect(tab).toBeInTheDocument()
    await userEvent.click(tab)
    expect(screen.queryByRole('row', { name: /S1\/2/ })).toBeNull()
  })

  it('should open edit cage drawer correctly', async () => {
    render(<Provider>
      <OltCageTable
        oltDetails={mockOlt}
        oltCages={mockOltCageList as OltCage[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    const row = screen.getByRole('row', { name: /S1\/2/ })
    await userEvent.click(row)
    const editCageButton = screen.getByRole('button', { name: 'Edit' })
    await userEvent.click(editCageButton)
    expect(screen.getByTestId('EditCageDrawer')).toBeInTheDocument()
  })

  it('should open manage onts sn drawer correctly', async () => {
    render(<Provider>
      <OltCageTable
        oltDetails={mockOlt}
        oltCages={mockOltCageList as OltCage[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByRole('row', { name: /S1\/2/ })).toBeVisible()
    const manageOntsSnButton = screen.getByRole('button', { name: 'Manage ONT S/N' })
    await userEvent.click(manageOntsSnButton)
    expect(screen.getByTestId('ManageOntsSnDrawer')).toBeInTheDocument()
  })

  it('should open manage cage group drawer correctly', async () => {
    render(<Provider>
      <OltCageTable
        oltDetails={mockOlt}
        oltCages={mockOltCageList as OltCage[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByRole('row', { name: /S1\/2/ })).toBeVisible()
    const manageCageGroupButton = screen.getByRole('button', { name: 'Manage Cage Group' })
    await userEvent.click(manageCageGroupButton)
    expect(screen.getByTestId('ManageCageGroupDrawer')).toBeInTheDocument()
  })

})
