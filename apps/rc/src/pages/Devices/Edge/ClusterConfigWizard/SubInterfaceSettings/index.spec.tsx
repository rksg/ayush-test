import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { edgeApi } from '@acx-ui/rc/services'
import {
  EdgeClusterStatus,
  EdgeGeneralFixtures,
  EdgePortConfigFixtures,
  EdgeSubInterfaceFixtures,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { ClusterConfigWizardContext, ClusterConfigWizardContextType } from '../ClusterConfigWizardDataProvider'

import { SubInterfaceSettingsForm } from './SubInterfaceSettingsForm'

import { SubInterfaceSettings } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./SubInterfaceSettingsForm', () => ({
  SubInterfaceSettingsForm: jest.fn(() => <div>Mocked SubInterfaceSettingsForm</div>)
}))

const mockedPatchEdgeClusterSubInterfaceSettings = jest.fn()

const { mockedClusterSubInterfaceSettings } = EdgeSubInterfaceFixtures
const { mockEdgeClusterList, mockedHaNetworkSettings } = EdgeGeneralFixtures
const { mockedPortsStatus, mockedLagStatus } = EdgePortConfigFixtures
const mockEdgeCluster = _.cloneDeep(EdgeGeneralFixtures.mockEdgeCluster)
mockEdgeCluster.virtualIpSettings.virtualIps[0].virtualIp = '2.2.2.90'
mockEdgeCluster.virtualIpSettings.virtualIps[1].virtualIp = '3.3.3.90'
const defaultCxtData: ClusterConfigWizardContextType = {
  clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
  portsStatus: mockedPortsStatus,
  lagsStatus: mockedLagStatus,
  clusterNetworkSettings: mockedHaNetworkSettings,
  clusterSubInterfaceSettings: mockedClusterSubInterfaceSettings,
  isLoading: false,
  isFetching: false
}

describe('SubInterfaceSettings', () => {
  let params: { tenantId: string, clusterId:string, settingType:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id',
      settingType: 'subInterface'
    }

    mockedUsedNavigate.mockClear()
    mockedPatchEdgeClusterSubInterfaceSettings.mockClear()
    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.patchEdgeClusterSubInterfaceSettings.url,
        (req, res, ctx) => {
          mockedPatchEdgeClusterSubInterfaceSettings(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly render', async () => {
    renderSettings(defaultCxtData)

    expect(screen.getByText('Sub-interface Settings')).toBeInTheDocument()
    expect(screen.getByText('Mocked SubInterfaceSettingsForm')).toBeInTheDocument()

    const tabs = await screen.findAllByRole('tab')
    expect(tabs.length).toBe(2)
    expect(within(tabs[0]).getByText('Smart Edge 1')).toBeInTheDocument()
    expect(within(tabs[1]).getByText('Smart Edge 2')).toBeInTheDocument()

    expect(SubInterfaceSettingsForm).toHaveBeenCalledWith(
      expect.objectContaining({
        serialNumber: 'serialNumber-1',
        ports: mockedHaNetworkSettings.portSettings
          .filter(p => p.serialNumber === 'serialNumber-1')
          .map(p => p.ports)[0],
        portStatus: mockedPortsStatus['serialNumber-1'],
        lagStatus: mockedLagStatus['serialNumber-1']
      }),
      expect.anything()
    )

    expect(await screen.findByText('Pass')).toBeVisible()
  })

  it('should render mismatch when sub-interface counts are inconsistent', async () => {
    const cxtData = _.cloneDeep(defaultCxtData)
    const port = cxtData?.clusterSubInterfaceSettings?.nodes?.[0]?.ports?.[0]
    port?.subInterfaces?.pop()
    renderSettings(cxtData)

    expect(await screen.findByText('Mismatch')).toBeVisible()
  })

  it('Apply & Finish', async () => {
    renderSettings(defaultCxtData)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Apply & Finish' }))
    await waitFor(() =>
      expect(mockedUsedNavigate).toBeCalledWith({
        hash: '',
        pathname: `/${params.tenantId}/t/devices/edge`,
        search: ''
      }))
    expect(mockedPatchEdgeClusterSubInterfaceSettings)
      .toHaveBeenCalledWith(mockedClusterSubInterfaceSettings)
  })

  it('Apply & Continue', async () => {
    renderSettings(defaultCxtData)

    await userEvent.click(screen.getByRole('button', { name: 'Apply & Continue' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/devices/edge/cluster/${params.clusterId}/configure`,
      search: ''
    }))
    expect(mockedPatchEdgeClusterSubInterfaceSettings)
      .toHaveBeenCalledWith(mockedClusterSubInterfaceSettings)
  })

  const renderSettings = (context: ClusterConfigWizardContextType) => {
    return render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={context}>
          <SubInterfaceSettings />
        </ClusterConfigWizardContext.Provider>
      </Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      }
    )
  }
})
