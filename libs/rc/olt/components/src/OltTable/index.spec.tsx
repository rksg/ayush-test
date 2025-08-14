import userEvent from '@testing-library/user-event'

import { OltFixtures }                     from '@acx-ui/olt/utils'
import { Provider }                        from '@acx-ui/store'
import { render, screen, within, waitFor } from '@acx-ui/test-utils'

import { OltTable } from './index'

const { mockOltList, mockEmptySnOlt } = OltFixtures

const mockedUsedNavigate = jest.fn()
const mockedTenantLink = {
  hash: '',
  pathname: '/mock-tenant-id/t/devices/optical',
  search: ''
}
const mockOltActions = {
  showDeleteOlt: jest.fn(),
  showRebootOlt: jest.fn()
}
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: () => mockedTenantLink
}))
jest.mock('../useOltActions', () => ({
  useOltActions: () => mockOltActions
}))
describe('OltTable', () => {
  const params = { tenantId: 'tenant-id' }
  const mockPath = '/:tenantId/devices/optical'

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
    mockOltActions.showDeleteOlt.mockClear()
    mockOltActions.showRebootOlt.mockClear()
  })

  it('should render with loading state', () => {
    render(<Provider>
      <OltTable data={mockOltList} isFetching />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('should navigate to edit page correctly', async () => {
    render(<Provider>
      <OltTable data={mockOltList} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith(
      '/mock-tenant-id/t/devices/optical/olt-id/edit', { replace: false }
    ))
  })

  it('should delete OLT correctly', async () => {
    render(<Provider>
      <OltTable data={mockOltList} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(mockOltActions.showDeleteOlt).toHaveBeenCalled()
  })

  it('should reboot OLT correctly', async () => {
    render(<Provider>
      <OltTable data={mockOltList} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Reboot Chassis' }))
    expect(mockOltActions.showRebootOlt).toHaveBeenCalled()
  })

  describe('OLT with empty serial number', () => {
    it('should delete OLT with IP and display status with UNKNOWN', async () => {
      render(<Provider>
        <OltTable data={[...mockOltList, mockEmptySnOlt]} />
      </Provider>, { route: { params, path: mockPath } })

      const row = await screen.findByRole('row', { name: /1.1.1.1/i })
      await userEvent.click(within(row).getByRole('checkbox'))
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
      expect(mockOltActions.showDeleteOlt).toHaveBeenCalled()
    })
  })
})