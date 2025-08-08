
import { rest } from 'msw'

import { edgeApi }                                              from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                      from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { HaSettings } from './'

const { mockEdgeClusterList, mockedHaNetworkSettings } = EdgeGeneralFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const mockedPatchApi = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  usePatchEdgeClusterNetworkSettingsMutation: () => ([() => ({
    unwrap: async () => mockedPatchApi()
  })])
}))
const mockUseIsEdgeFeatureReady = jest.fn().mockImplementation(() => false)
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: (ff: string) => mockUseIsEdgeFeatureReady(ff)
}))

describe('Edit Edge Cluster - HaSettings', () => {
  let params: { tenantId: string, clusterId: string, activeTab: string }
  beforeEach(() => {
    params = {
      tenantId: 'tenantId_1',
      clusterId: 'clusterId_1',
      activeTab: 'ha-settings'
    }

    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getEdgeClusterNetworkSettings.url,
        (_req, res, ctx) => res(ctx.json(mockedHaNetworkSettings))
      )
    )

    mockUseIsEdgeFeatureReady.mockImplementation(() => false)
  })

  it('should render EdgeHaSettingsForm correctly', async () => {
    render(
      <Provider>
        <HaSettings
          currentClusterStatus={mockEdgeClusterList.data[0] as unknown as EdgeClusterStatus}
        />
      </Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeChecked()
    })

    expect(await screen.findByRole('radio', { name: /Daily Everyday at 00:00/i })).toBeChecked()

    const dailyTime = await screen.findByRole('textbox')
    expect(dailyTime.id).toBe('fallbackSettings_schedule_time')
    expect(dailyTime).toBeVisible()

    expect(await screen.findByText('Per AP group distribution')).toBeVisible()
  })
})
