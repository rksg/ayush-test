import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { edgeApi, venueApi }                                       from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeCompatibilityFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                         from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockEdgeList } from './__tests__/fixtures'

import { EdgesTable } from '.'

// eslint-disable-next-line max-len
const mockEdgeCompatibilitiesVenue = cloneDeep(EdgeCompatibilityFixtures.mockEdgeCompatibilitiesVenue)
// mockEdgeList.data[4] is operational
mockEdgeCompatibilitiesVenue.compatibilities![0].id = mockEdgeList.data[4].serialNumber
mockEdgeCompatibilitiesVenue.compatibilities![1].id = mockEdgeList.data[1].serialNumber

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('../useEdgeActions', () => ({
  ...jest.requireActual('../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

const mockedDeleteApi = jest.fn()
const mockedSendOtpApi = jest.fn()
const mockedRebootApi = jest.fn()
const mockedShutdownApi = jest.fn()

describe('Edge Table', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdge.url,
        (req, res, ctx) => {
          mockedDeleteApi()
          return res(ctx.status(202))
        }
      ),
      rest.patch(
        EdgeUrlsInfo.sendOtp.url,
        (req, res, ctx) => {
          mockedSendOtpApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.reboot.url,
        (req, res, ctx) => {
          mockedRebootApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.shutdown.url,
        (req, res, ctx) => {
          mockedShutdownApi()
          return res(ctx.status(202))
        }
      )
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create EdgeList successfully', async () => {
    render(
      <Provider>
        <EdgesTable pagination={{ defaultPageSize: mockEdgeList.data.length }} />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/ })
    expect(rows.length).toBe(12)

    // TODO: should add extra test for EdgeStatusLight
    const expectedStatus = ['Initializing', 'Never contacted cloud', 'Offline',
      'Needs port config', 'Operational', 'Applying firmware', 'Applying configuration',
      'Firmware update failed', 'Configuration update failed', 'Disconnected from cloud',
      'Rebooting', 'Resetting and recovering']

    expectedStatus.forEach((status, index) => {
      expect(rows[Number(index)]).toHaveTextContent(`Smart Edge ${index+1}`)
      expect(rows[Number(index)]).toHaveTextContent(status)
    })
  })

  it('edge detail page link should be correct', async () => {
    render(
      <Provider>
        <EdgesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const smartEdgeLink = await screen.findByRole('link',
      { name: 'Smart Edge 1' }) as HTMLAnchorElement
    expect(smartEdgeLink.href)
      .toContain(`/${params.tenantId}/t/devices/edge/0000000001/details/overview`)
  })

  it('venue detail page link should be correct', async () => {
    render(
      <Provider>
        <EdgesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const venue1List = await screen.findAllByRole('link', { name: 'Venue 1' })
    const venue1Link = venue1List[0] as HTMLAnchorElement
    expect(venue1Link.href).toContain(`/${params.tenantId}/t/venues/00001/venue-details/overview`)
  })

  it('should go edit page', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json({
          ...mockEdgeList,
          data: mockEdgeList.data.slice(0,2)
        }))
      )
    )
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const row = await screen.findByRole('row', { name: /Smart Edge 2/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge/0000000002/edit/general-settings`,
      hash: '',
      search: ''
    })
  })

  it('edit button will remove when select above 1 row', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json({
          ...mockEdgeList,
          data: mockEdgeList.data.slice(0,3)
        }))
      )
    )
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const row = await screen.findAllByRole('row', { name: /Smart Edge/i })
    await user.click(within(row[0]).getByRole('checkbox'))
    await user.click(within(row[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should delete selected row', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json({
          ...mockEdgeList,
          data: mockEdgeList.data.slice(1,2)
        }))
      )
    )
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })

    const table = await screen.findByRole('table')
    const row = await within(table).findByRole('row', { name: /Smart Edge 2/i })
    await user.click(within(row).getByRole('checkbox'))

    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    within(dialog).getByText('Delete "Smart Edge 2"?')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(mockedDeleteApi).toBeCalledTimes(1))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should send OTP sucessfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const row = await screen.findByRole('row', { name: /Smart Edge 2/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Send OTP' }))
    const dialog = await screen.findByRole('dialog')
    within(dialog).getByText('Are you sure you want to send OTP?')
    await user.click(within(dialog).getByRole('button', { name: 'OK' }))
    await waitFor(() => {
      expect(mockedSendOtpApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('should not contains columns configured to be filtered', async () => {
    render(
      <Provider>
        <EdgesTable filterColumns={['venue']}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })

    await screen.findByRole('row', { name: /Smart Edge 2/i })
    expect(screen.queryByRole('columnheader', { name: /Venue/i })).not.toBeInTheDocument()
    expect((await screen.findAllByRole('columnheader')).length).toBe(8)
  })

  it('should delete selected row(multiple)', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json({
          ...mockEdgeList,
          data: mockEdgeList.data.slice(0,3)
        }))
      )
    )
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })

    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(within(rows[1]).getByRole('cell', { name: /Smart Edge 2/i })).toBeVisible()
    expect(within(rows[2]).getByRole('cell', { name: /Smart Edge 3/i })).toBeVisible()
    await user.click(within(rows[1]).getByRole('checkbox'))
    await user.click(within(rows[2]).getByRole('checkbox'))
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Delete "2 RUCKUS Edges"?')).toBeVisible()

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(mockedDeleteApi).toBeCalledTimes(2))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should reboot the selected SmartEdge', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    const row5 = await screen.findByRole('row', { name: /Smart Edge 5/i })
    await user.click(within(row5).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Reboot' }))
    const rebootDialg = await screen.findByRole('dialog')
    within(rebootDialg).getByText('Reboot "Smart Edge 5"?')
    await user.click(within(rebootDialg).getByRole('button', { name: 'Reboot' }))
    await waitFor(() => {
      expect(mockedRebootApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(rebootDialg).not.toBeVisible()
    })
  })

  it('should shutdown the selected SmartEdge', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    const row5 = await screen.findByRole('row', { name: /Smart Edge 5/i })
    await user.click(within(row5).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Shutdown' }))
    const shutdownDialg = await screen.findByRole('dialog')
    within(shutdownDialg).getByText('Shutdown "Smart Edge 5"?')
    await user.click(within(shutdownDialg).getByRole('button', { name: 'Shutdown' }))
    await waitFor(() => {
      expect(mockedShutdownApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(shutdownDialg).not.toBeVisible()
    })
  })

  it('should show reboot & reset for allowed statuses', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    const row5 = await screen.findByRole('row', { name: /Smart Edge 5/i })
    await user.click(within(row5).getByRole('checkbox'))
    expect(screen.queryByText('Reboot')).toBeVisible()
    expect(screen.queryByText('Reset & Recover')).toBeVisible()
  })

  it('should not show reboot & reset for the reset statuses', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    const row6 = await screen.findByRole('row', { name: /Smart Edge 6/i })
    await user.click(within(row6).getByRole('checkbox'))
    expect(screen.queryByText('Reboot')).toBeNull()
    expect(screen.queryByText('Reset & Recover')).toBeNull()
  })

  it('should show incopatible warning', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getVenueEdgeCompatibilities.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeCompatibilitiesVenue))
      )
    )
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable
          rowSelection={{ type: 'checkbox' }}
          tableQuery={{ defaultPayload: {
            fields: [
              'name', 'deviceStatus', 'type', 'model', 'serialNumber', 'ip',
              'ports', 'firmwareVersion', 'incompatible'
            ],
            filters: { venueId: ['mockVenueId']
            } } }}
          incompatibleCheck
        />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })

    await screen.findByRole('cell', { name: 'Smart Edge 5' })
    const row1 = screen.getByRole('row', { name: /Smart Edge 5 / })
    await user.click(screen.getByTestId('SettingsOutlined'))
    await userEvent.click(await screen.findByText('Feature Compatibility'))

    const btn = await within(row1).findByRole('button', { name: 'Partially incompatible' })
    await user.click(btn)
    const dialog = await screen.findByRole('dialog')
    within(dialog).getByText('Incompatibility Details: Smart Edge 5')
  })
})
