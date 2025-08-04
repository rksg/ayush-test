import userEvent     from '@testing-library/user-event'
import { Modal }     from 'antd'
import { cloneDeep } from 'lodash'
// import { rest }      from 'msw'

import { OltFixtures }                                                            from '@acx-ui/olt/utils'
import { Provider }                                                               from '@acx-ui/store'
import { render, screen, mockServer, waitForElementToBeRemoved, within, waitFor } from '@acx-ui/test-utils'

import { OltTable } from './index'

const { mockOltList, mockOfflineOlt, mockEmptySnOlt } = OltFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const { click } = userEvent
describe('OltTable', () => {
  const params = { tenantId: 'mock-tenant-id' }
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

  it('renders with data and navigate to detail page when click', async () => {
    render(<Provider>
      <OltTable data={mockOltList} />
    </Provider>, { route: { params, path: mockPath } })
    const data = screen.getByText('TestOlt')
    expect(data).toBeInTheDocument()
    await click(data)
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/mock-tenant-id/t/devices/optical/testSerialNumber/details', hash: '', search: ''
    }))
  })

  it('should open OLT form when edit', async () => {
    render(<Provider>
      <OltTable data={mockOltList} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Edit' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith(
      '/mock-tenant-id/t/devices/optical/testSerialNumber/edit', { replace: false }
    ))
  })

  it('should delete OLT', async () => {
    // const mockedDeleteReq = jest.fn()
    mockServer.use(
      // rest.delete(
      //   EdgeTnmServiceUrls.deleteEdgeOlt.url,
      //   (_, res, ctx) => {
      //     mockedDeleteReq()
      //     return res(ctx.status(202))
      //   })
    )

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
    mockServer.use(
      // rest.delete(
      //   EdgeTnmServiceUrls.deleteEdgeOlt.url,
      //   (_, res, ctx) => {
      //     mockedDeleteReq()
      //     return res(ctx.status(202))
      //   })
    )

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
    mockServer.use(
    )

    render(<Provider>
      <OltTable data={mockOltList} />
    </Provider>, { route: { params, path: mockPath } })

    const row = await screen.findByRole('row', { name: /TestOlt/i })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Reboot' }))
    const dialogTitle = await screen.findByText('Reboot "TestOlt"?')
    expect(dialogTitle).toBeInTheDocument()
  })

  it('should reboot OLTs', async () => {
    // const mockedRebootReq = jest.fn()
    mockServer.use(
    )

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
    await click(screen.getByRole('button', { name: 'Reboot' }))
    const dialogTitle = await screen.findByText('Reboot "2 OLT Devices"?')
    expect(dialogTitle).toBeInTheDocument()
  })

  describe('OLT with empty serial number', () => {
    const mockDataWithEmptySn = cloneDeep(mockOltList)
    mockDataWithEmptySn.push(mockEmptySnOlt)

    it('should delete OLT with IP and display status with UNKNOWN', async () => {
      // const mockedDeleteReq = jest.fn()
      mockServer.use(
        // rest.delete(
        //   EdgeTnmServiceUrls.deleteEdgeOlt.url,
        //   (req, res, ctx) => {
        //     mockedDeleteReq(req.params)
        //     return res(ctx.status(202))
        //   })
      )

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
      //   venueId: mockEmptySnOlt.venueId,
      //   edgeClusterId: mockEmptySnOlt.edgeClusterId,
      //   oltId: mockEmptySnOlt.ip
      // })
    })
  })
})