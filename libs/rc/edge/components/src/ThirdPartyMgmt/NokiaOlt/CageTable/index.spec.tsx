import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeTnmServiceApi }                                                      from '@acx-ui/rc/services'
import { EdgeTnmServiceUrls, EdgeOltFixtures, EdgeNokiaCageData }                 from '@acx-ui/rc/utils'
import { Provider, store }                                                        from '@acx-ui/store'
import { screen, render, within, mockServer, waitForElementToBeRemoved, waitFor } from '@acx-ui/test-utils'

import { EdgeNokiaCageTable } from './'

const { mockOlt, mockOltCageList } = EdgeOltFixtures

jest.mock( './CageDetailsDrawer', () => ({
  // eslint-disable-next-line max-len
  CageDetailsDrawer: (props: { visible: boolean, setVisible: () => void, currentCage?: EdgeNokiaCageData }) =>
    props.visible
      ? <div data-testid='CageDetailsDrawer'>{JSON.stringify(props.currentCage)}</div>
      : ''
}))
describe('EdgeNokiaCageTable', () => {
  const params = { tenantId: 'mock-tenant-id', oltId: 'mock-olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'
  const mockToggleCageReq = jest.fn()

  beforeEach(() => {
    store.dispatch(edgeTnmServiceApi.util.resetApiState())
    mockToggleCageReq.mockClear()

    mockServer.use(
      rest.put(
        EdgeTnmServiceUrls.toggleEdgeCageState.url,
        (req, res, ctx) => {
          mockToggleCageReq(req.body, req.params)
          return res(ctx.status(202))
        })
    )
  })

  it('should correctly render', async () => {
    render(<Provider>
      <EdgeNokiaCageTable oltData={mockOlt}
        cagesList={mockOltCageList as EdgeNokiaCageData[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })
    const row = screen.getByRole('row', { name: /S1\/2 UP/ })
    expect(row).toBeVisible()

    const downCageRow = screen.getByRole('row', { name: /S1\/1 DOWN/ })
    // should be unclickable when cage is DOWN
    expect(within(downCageRow).queryByRole('button', { name: 'S1/1' })).toBeNull()
  })

  it('should correctly render loading icon', async () => {
    render(<Provider>
      <EdgeNokiaCageTable oltData={mockOlt}
        cagesList={mockOltCageList as EdgeNokiaCageData[]}
        isLoading={true}
        isFetching={true}
      />
    </Provider>, { route: { params, path: mockPath } })

    screen.getByRole('img', { name: 'loader' })
  })

  it('should show cage details drawer', async () => {
    render(<Provider>
      <EdgeNokiaCageTable oltData={mockOlt}
        cagesList={mockOltCageList as EdgeNokiaCageData[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    const row = screen.getByRole('row', { name: /S1\/2 UP/ })
    await userEvent.click(within(row).getByRole('button', { name: 'S1/2' }))
    const drawer = await screen.findByTestId('CageDetailsDrawer')
    expect(drawer).toBeVisible()
  })

  it('should change cage status from ON to OFF', async () => {
    render(<Provider>
      <EdgeNokiaCageTable oltData={mockOlt}
        cagesList={mockOltCageList as EdgeNokiaCageData[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    const upRow = screen.getByRole('row', { name: /S1\/2 UP/ })
    await userEvent.click(within(upRow).getByRole('switch'))
    expect(mockToggleCageReq).toBeCalledWith({
      cage: 'S1/2',
      state: 'DOWN'
    }, {
      venueId: 'mock_venue_1',
      edgeClusterId: 'clusterId_1',
      oltId: 'testSerialNumber'
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
  })

  it('should change cage status from OFF to ON', async () => {
    render(<Provider>
      <EdgeNokiaCageTable oltData={mockOlt}
        cagesList={mockOltCageList as EdgeNokiaCageData[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    const downRow = screen.getByRole('row', { name: /S1\/1 DOWN/ })
    await userEvent.click(within(downRow).getByRole('switch'))
    await waitFor(() => expect(mockToggleCageReq).toBeCalledWith({
      cage: 'S1/1',
      state: 'UP'
    }, {
      venueId: 'mock_venue_1',
      edgeClusterId: 'clusterId_1',
      oltId: 'testSerialNumber'
    }))
  })

  it('should handle cage status update failed', async () => {
    const spyOnConsole = jest.fn()
    jest.spyOn(console, 'log').mockImplementation(spyOnConsole)

    mockServer.use(
      rest.put(
        EdgeTnmServiceUrls.toggleEdgeCageState.url,
        (_, res, ctx) => {
          return res(ctx.status(422))
        })
    )

    render(<Provider>
      <EdgeNokiaCageTable oltData={mockOlt}
        cagesList={mockOltCageList as EdgeNokiaCageData[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    const row = screen.getByRole('row', { name: /S1\/2 UP/ })
    await userEvent.click(within(row).getByRole('switch'))
    await waitFor(() => expect(spyOnConsole).toHaveBeenCalled())
  })
})