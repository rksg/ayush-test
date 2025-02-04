import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeTnmServiceApi }                                             from '@acx-ui/rc/services'
import { EdgeTnmServiceUrls, EdgeOltFixtures, EdgeNokiaCageData }        from '@acx-ui/rc/utils'
import { Provider, store }                                               from '@acx-ui/store'
import { screen, render, within, mockServer, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { EdgeNokiaCageTable } from './'

const { mockOltCageList } = EdgeOltFixtures

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

  beforeEach(() => {
    store.dispatch(edgeTnmServiceApi.util.resetApiState())

    mockServer.use(
      rest.get(
        EdgeTnmServiceUrls.getEdgeCageList.url,
        (_, res, ctx) => {
          return res(ctx.json(mockOltCageList))
        }))
  })

  it('should correctly render', async () => {
    const props = {
      venueId: 'venueId',
      edgeClusterId: 'edgeClusterId',
      oltId: 'oltId'
    }
    render(<Provider>
      <EdgeNokiaCageTable {...props} />
    </Provider>, { route: { params, path: mockPath } })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = screen.getByRole('row', { name: /S1\/2 UP/ })
    expect(row).toBeVisible()
    screen.getByRole('row', { name: /S1\/1 DOWN/ })
  })

  it('should show cage details drawer', async () => {
    const props = {
      venueId: 'venueId',
      edgeClusterId: 'edgeClusterId',
      oltId: 'oltId'
    }
    render(<Provider>
      <EdgeNokiaCageTable {...props} />
    </Provider>, { route: { params, path: mockPath } })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = screen.getByRole('row', { name: /S1\/2 UP/ })
    await userEvent.click(within(row).getByRole('button', { name: 'S1/2' }))
    const drawer = await screen.findByTestId('CageDetailsDrawer')
    expect(drawer).toBeVisible()
  })

  it('displays loading state', () => {
    const props = {
      venueId: 'venueId',
      edgeClusterId: 'edgeClusterId',
      oltId: 'oltId'
    }
    render(<Provider>
      <EdgeNokiaCageTable {...props} />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })
})