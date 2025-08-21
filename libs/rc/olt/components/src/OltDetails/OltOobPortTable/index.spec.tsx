import userEvent from '@testing-library/user-event'

import { Provider }                   from '@acx-ui/store'
import { screen, render, mockServer } from '@acx-ui/test-utils'

import { OltOobPortTable } from '.'


jest.mock('../EditOobPortDrawer', () => ({
  EditOobPortDrawer: () => <div data-testid='EditOobPortDrawer' />
}))

describe('OltOobPortTable', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'
  const mockToggleCageReq = jest.fn()

  beforeEach(() => {
    mockToggleCageReq.mockClear()
    mockServer.use(
    )
  })

  it('should open edit OOB drawer correctly', async () => {
    render(<Provider>
      <OltOobPortTable />
    </Provider>, { route: { params, path: mockPath } })

    const row = screen.getByRole('row', { name: /S1\/2 Up/ })
    await userEvent.click(row)
    const editOobPortButton = screen.getByRole('button', { name: 'Edit' })
    await userEvent.click(editOobPortButton)
    expect(screen.getByTestId('EditOobPortDrawer')).toBeInTheDocument()
  })
})
