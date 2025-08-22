import userEvent from '@testing-library/user-event'

import { Provider }                   from '@acx-ui/store'
import { screen, render, mockServer } from '@acx-ui/test-utils'

import { OltUplinkPortTable } from '.'

jest.mock('../EditUplinkPortDrawer', () => ({
  EditUplinkPortDrawer: () => <div data-testid='EditUplinkPortDrawer' />
}))

jest.mock('../ManageLacpLagDrawer', () => ({
  ManageLacpLagDrawer: () => <div data-testid='ManageLacpLagDrawer' />
}))

describe('OltUplinkPortTable', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'
  const mockToggleCageReq = jest.fn()

  beforeEach(() => {
    mockToggleCageReq.mockClear()
    mockServer.use(
    )
  })

  it('should open edit Uplink drawer correctly', async () => {
    render(<Provider>
      <OltUplinkPortTable />
    </Provider>, { route: { params, path: mockPath } })

    const row = screen.getByRole('row', { name: /S1\/2 Up/ })
    await userEvent.click(row)
    const editUplinkPortButton = screen.getByRole('button', { name: 'Edit' })
    await userEvent.click(editUplinkPortButton)
    expect(screen.getByTestId('EditUplinkPortDrawer')).toBeInTheDocument()
  })

  it('should open manage LACP LAG drawer correctly', async () => {
    render(<Provider>
      <OltUplinkPortTable />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByRole('row', { name: /S1\/2 Up/ })).toBeVisible()
    const manageLacpLagButton = screen.getByRole('button', { name: 'Manage LACP LAG' })
    await userEvent.click(manageLacpLagButton)
    expect(screen.getByTestId('ManageLacpLagDrawer')).toBeInTheDocument()
  })
})
