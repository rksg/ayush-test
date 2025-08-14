import userEvent from '@testing-library/user-event'

import { Provider }                           from '@acx-ui/store'
import { screen, render, within, mockServer } from '@acx-ui/test-utils'

import { OltPortTable } from '.'


jest.mock('../EditPortDrawer', () => ({
  EditPortDrawer: () => <div data-testid='EditPortDrawer' />
}))

jest.mock('../ManageLacpLagDrawer', () => ({
  ManageLacpLagDrawer: () => <div data-testid='ManageLacpLagDrawer' />
}))

describe('OltPortTable', () => {
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
      <OltPortTable />
    </Provider>, { route: { params, path: mockPath } })
    const row = screen.getByRole('row', { name: /S1\/2 Up/ })
    expect(row).toBeVisible()

    const downCageRow = screen.getByRole('row', { name: /S1\/1 Down/ })
    expect(within(downCageRow).queryByRole('button', { name: 'S1/1' })).toBeNull()
  })

  it('should render loading icon correctly', async () => {
    render(<Provider>
      <OltPortTable />
    </Provider>, { route: { params, path: mockPath } })

    screen.getByRole('img', { name: 'loader' })
  })

  it('should handle tab change correctly', async () => {
    render(<Provider>
      <OltPortTable />
    </Provider>, { route: { params, path: mockPath } })

    const tab = screen.getByRole('tab', { name: 'OOB' })
    expect(tab).toBeInTheDocument()
    await userEvent.click(tab)
    expect(screen.queryByRole('row', { name: /S1\/2 Up/ })).toBeNull()
  })

  it('should open edit port drawer correctly', async () => {
    render(<Provider>
      <OltPortTable />
    </Provider>, { route: { params, path: mockPath } })

    const row = screen.getByRole('row', { name: /S1\/2 Up/ })
    await userEvent.click(row)
    const editCageButton = screen.getByRole('button', { name: 'Edit' })
    await userEvent.click(editCageButton)
    expect(screen.getByTestId('EditPortDrawer')).toBeInTheDocument()
  })

  it('should open manage LACP LAG drawer correctly', async () => {
    render(<Provider>
      <OltPortTable />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByRole('row', { name: /S1\/2 Up/ })).toBeVisible()
    const manageLacpLagButton = screen.getByRole('button', { name: 'Manage LACP LAG' })
    await userEvent.click(manageLacpLagButton)
    expect(screen.getByTestId('ManageLacpLagDrawer')).toBeInTheDocument()
  })



})
