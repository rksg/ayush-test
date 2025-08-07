import userEvent     from '@testing-library/user-event'
import { Modal }     from 'antd'
import { cloneDeep } from 'lodash'

import { OltFixtures }                                                from '@acx-ui/olt/utils'
import { Provider }                                                   from '@acx-ui/store'
import { render, screen, waitForElementToBeRemoved, within, waitFor } from '@acx-ui/test-utils'

import { OltTable } from './index'

const { mockOltList, mockOfflineOlt, mockEmptySnOlt } = OltFixtures

const mockedUsedNavigate = jest.fn()
const mockedTenantLink = {
  hash: '',
  pathname: '/mock-tenant-id/t/devices/optical',
  search: ''
}
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: () => mockedTenantLink
}))

const { click } = userEvent
describe('OltTable', () => {
  const params = { tenantId: 'tenant-id' }
  const mockPath = '/:tenantId/devices/optical'

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
  })
  afterEach(() => {
    Modal.destroyAll()
  })

  it('renders with loading state', () => {
    render(<Provider>
      <OltTable data={mockOltList} isFetching />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('should open OLT form when edit', async () => {
    render(<Provider>
      <OltTable data={mockOltList} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Edit' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith(
      '/mock-tenant-id/t/devices/optical/olt-id/edit', { replace: false }
    ))
  })

  it('should delete OLT', async () => {
    // const mockedDeleteReq = jest.fn()
    // mockServer.use(
    //   rest.delete()
    // )

    render(<Provider>
      <OltTable data={mockOltList} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "TestOlt"?')
    await click(screen.getByRole('button', { name: 'Delete OLT Device' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    // expect(mockedDeleteReq).toBeCalledTimes(1)
  })

  it('should delete OLTs', async () => {
    // const mockedDeleteReq = jest.fn()
    // mockServer.use(
    //   rest.delete()
    // )

    render(<Provider>
      <OltTable data={[
        ...mockOltList,
        {
          ...mockOfflineOlt,
          ip: '134.242.136.113'
        }
      ]} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    const offlineRow = await screen.findByRole('row', { name: /TestOfflineOlt/i })
    await click(within(row).getByRole('checkbox'))
    await click(within(offlineRow).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "2 OLT Devices"?')
    expect(dialogTitle).toBeInTheDocument()
  })

  it('should reboot OLT', async () => {
    // const mockedRebootReq = jest.fn()
    // mockServer.use(
    // )

    render(<Provider>
      <OltTable data={mockOltList} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Reboot Chassis' }))
    const dialogTitle = await screen.findByText('Reboot the Chassis of "TestOlt"?')
    expect(dialogTitle).toBeInTheDocument()
  })

  it('should reboot OLTs', async () => {
    // const mockedRebootReq = jest.fn()
    // mockServer.use(
    // )

    render(<Provider>
      <OltTable data={[
        ...mockOltList,
        {
          ...mockOfflineOlt,
          ip: '134.242.136.113'
        }
      ]} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    const offlineRow = await screen.findByRole('row', { name: /TestOfflineOlt/i })
    await click(within(row).getByRole('checkbox'))
    await click(within(offlineRow).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Reboot Chassis' }))
    const dialogTitle = await screen.findByText('Reboot the Chassis of "2 OLT Chassis"?')
    expect(dialogTitle).toBeInTheDocument()
  })

  describe('OLT with empty serial number', () => {
    const mockDataWithEmptySn = cloneDeep(mockOltList)
    mockDataWithEmptySn.push(mockEmptySnOlt)

    it('should delete OLT with IP and display status with UNKNOWN', async () => {
      // const mockedDeleteReq = jest.fn()
      // mockServer.use(
      //   rest.delete()
      // )

      render(<Provider>
        <OltTable data={mockDataWithEmptySn} />
      </Provider>, { route: { params, path: mockPath } })

      const row = await screen.findByRole('row', { name: /1.1.1.1/i })
      await click(within(row).getByRole('checkbox'))
      await click(screen.getByRole('button', { name: 'Delete' }))
      const dialogTitle = await screen.findByText('Delete ""?')
      await click(screen.getByRole('button', { name: 'Delete OLT Device' }))
      await waitForElementToBeRemoved(dialogTitle)
      expect(screen.queryByRole('dialog')).toBeNull()
      // expect(mockedDeleteReq).toBeCalledWith({
      // })
    })
  })
})