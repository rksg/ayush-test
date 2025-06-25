import userEvent           from '@testing-library/user-event'
import { Form }            from 'antd'
import { cloneDeep, find } from 'lodash'

import { StepsForm }                                   from '@acx-ui/components'
import { Features }                                    from '@acx-ui/feature-toggle'
import { EdgePortsGeneralBase, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import {
  EdgeClusterStatus, EdgeFormFieldsPropsType,
  EdgeGeneralFixtures, EdgePortConfigFixtures,
  EdgePortTypeEnum, EdgeSdLanFixtures,
  EdgeMvSdLanViewData, EdgeStatus
} from '@acx-ui/rc/utils'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { mockClusterConfigWizardData } from '../__tests__/fixtures'
import { ClusterConfigWizardContext }  from '../ClusterConfigWizardDataProvider'

import { PortForm }                   from './PortForm'
import { transformFromApiToFormData } from './utils'

const { mockEdgeClusterList, mockedHaNetworkSettings } = EdgeGeneralFixtures
const { mockedPortsStatus } = EdgePortConfigFixtures
const { mockedMvSdLanServiceDmz } = EdgeSdLanFixtures
// eslint-disable-next-line max-len
const mockedHaWizardNetworkSettings = transformFromApiToFormData(mockedHaNetworkSettings)
const nodeList = mockEdgeClusterList.data[0].edgeList as EdgeStatus[]

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  // eslint-disable-next-line max-len
  EdgePortsGeneralBase: jest.fn().mockImplementation(() => <div data-testid='rc-EdgePortsGeneralBase'></div>),
  useIsEdgeFeatureReady: jest.fn()
}))

const defaultCxtData = {
  clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
  portsStatus: mockedPortsStatus,
  edgeSdLanData: mockedMvSdLanServiceDmz as EdgeMvSdLanViewData,
  isLoading: false,
  isFetching: false
}
describe('InterfaceSettings - PortForm', () => {
  let params: { tenantId: string, clusterId:string, settingType:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id',
      settingType: 'interface'
    }
  })

  it('should correctly render', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <StepsForm initialValues={mockedHaWizardNetworkSettings}>
          <StepsForm.StepForm>
            <PortForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('Port General Settings')).toBeVisible()
    expect(screen.getByText(/all RUCKUS Edges in this cluster/)).toBeVisible()
    expect(screen.getAllByRole('tab').length).toBe(2)
    const tab = screen.getByRole('tab', { name: 'Smart Edge 1' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
    expect(await screen.findByTestId('rc-EdgePortsGeneralBase')).toBeVisible()
  })

  it('should correctly switch tab', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <StepsForm initialValues={mockedHaWizardNetworkSettings}>
          <StepsForm.StepForm>
            <PortForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('Port General Settings')).toBeVisible()
    expect(screen.getAllByRole('tab').length).toBe(2)
    const node1Tab = screen.getByRole('tab', { name: 'Smart Edge 1' })
    expect(node1Tab.getAttribute('aria-selected')).toBeTruthy()
    const node2Tab = screen.getByRole('tab', { name: 'Smart Edge 2' })
    await userEvent.click(node2Tab)
    expect(node2Tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should be empty when node port data not exist', async () => {
    const lostSomePortConfig = cloneDeep(mockedHaWizardNetworkSettings)
    delete lostSomePortConfig.portSettings[nodeList[1].serialNumber]

    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <StepsForm initialValues={mockedHaWizardNetworkSettings}>
          <StepsForm.StepForm>
            <PortForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('Port General Settings')).toBeVisible()
    expect(screen.getAllByRole('tab').length).toBe(2)
    const node1Tab = screen.getByRole('tab', { name: 'Smart Edge 1' })
    expect(node1Tab.getAttribute('aria-selected')).toBeTruthy()
    const node2Tab = screen.getByRole('tab', { name: 'Smart Edge 2' })
    await userEvent.click(node2Tab)
    const activePane = screen.getByRole('tabpanel', { hidden: false })
    expect(activePane.getAttribute('id')).toBe('rc-tabs-test-panel-serialNumber-2')
    expect(activePane.textContent).toBe('')
  })

  it('should be blocked when node does not exist valid gateway setting', async () => {
    const mockNoWanPortData = cloneDeep(mockedHaWizardNetworkSettings)
    Object.keys(mockNoWanPortData.portSettings).forEach(sn => {
      Object.keys(mockNoWanPortData.portSettings[sn]).forEach(port => {
        if (mockNoWanPortData.portSettings[sn][port][0].portType === EdgePortTypeEnum.WAN) {
          mockNoWanPortData.portSettings[sn][port][0].portType = EdgePortTypeEnum.LAN
        }

        if (mockNoWanPortData.portSettings[sn][port][0].portType === EdgePortTypeEnum.LAN) {
          mockNoWanPortData.portSettings[sn][port][0].corePortEnabled = false
        }
      })
    })

    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <StepsForm initialValues={mockNoWanPortData}>
          <StepsForm.StepForm>
            <PortForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('Port General Settings')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    // eslint-disable-next-line max-len
    await screen.findByText('Each Edge at least one port must be enabled and configured to WAN or Core port to form a cluster.')
  })

  describe('Core Access', () => {
    beforeEach(() => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
    })

    afterEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReset()
    })

    // eslint-disable-next-line max-len
    it('should not be blocked when node does not exist valid gateway setting when access port FF is on', async () => {
      const mockFinishFn = jest.fn()
      const mockNoWanPortData = cloneDeep(mockedHaWizardNetworkSettings)
      Object.keys(mockNoWanPortData.portSettings).forEach(sn => {
        Object.keys(mockNoWanPortData.portSettings[sn]).forEach(port => {
          if (mockNoWanPortData.portSettings[sn][port][0].portType === EdgePortTypeEnum.WAN) {
            mockNoWanPortData.portSettings[sn][port][0].portType = EdgePortTypeEnum.LAN
          }

          if (mockNoWanPortData.portSettings[sn][port][0].portType === EdgePortTypeEnum.LAN) {
            mockNoWanPortData.portSettings[sn][port][0].corePortEnabled = false
          }
        })
      })

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <StepsForm initialValues={mockNoWanPortData} onFinish={mockFinishFn}>
            <StepsForm.StepForm>
              <PortForm />
            </StepsForm.StepForm>
          </StepsForm>
        </ClusterConfigWizardContext.Provider>,
        {
          // eslint-disable-next-line max-len
          route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
        })

      expect(screen.getByText('Port General Settings')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'Add' }))
      // eslint-disable-next-line max-len
      await waitFor(() => expect(mockFinishFn).toBeCalledTimes(1))
    })
  })

  describe('when multi NAT IP enabled', () => {
    const MockComponent = ({ formFieldsProps }: { formFieldsProps?: EdgeFormFieldsPropsType }) => {
      return <Form.Item
        data-testid='port-table'
        name='test-nat-pool-overlap'
        {...formFieldsProps?.natStartIp}
        children={<span></span>}
      />
    }

    beforeEach(() => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_MULTI_NAT_IP_TOGGLE)
      jest.mocked(EdgePortsGeneralBase).mockImplementation((props) => <MockComponent {...props}/>)
    })
    afterEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReset()
    })

    const mockNatPoolOverlapData = cloneDeep(mockClusterConfigWizardData)
    const node1Sn = mockedHaNetworkSettings.portSettings[0].serialNumber
    const node2Sn = mockedHaNetworkSettings.portSettings[1].serialNumber

    // mock 2 ports in diff node pool overlapped
    mockNatPoolOverlapData.portSettings[node1Sn].port1[0].portType = EdgePortTypeEnum.WAN
    mockNatPoolOverlapData.portSettings[node1Sn].port1[0].natEnabled = true
    // eslint-disable-next-line max-len
    mockNatPoolOverlapData.portSettings[node1Sn].port1[0].natPools = [{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }]

    mockNatPoolOverlapData.portSettings[node2Sn].port1[0].portType = EdgePortTypeEnum.WAN
    mockNatPoolOverlapData.portSettings[node2Sn].port1[0].natEnabled = true
    // eslint-disable-next-line max-len
    mockNatPoolOverlapData.portSettings[node2Sn].port1[0].natPools = [{ startIpAddress: '1.1.1.10', endIpAddress: '1.1.1.20' }]

    it('should validate if NAT pool overlap between edges', async () => {
      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <StepsForm initialValues={mockNatPoolOverlapData}>
            <StepsForm.StepForm>
              <PortForm />
            </StepsForm.StepForm>
          </StepsForm>
        </ClusterConfigWizardContext.Provider>,
        {
          // eslint-disable-next-line max-len
          route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
        })

      expect(screen.getByText('Port General Settings')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'Add' }))

      const error = await screen.findByRole('alert')
      expect(error).toBeVisible()
      const edge1Name = find(mockEdgeClusterList.data[0].edgeList, { serialNumber: node1Sn })?.name
      const edge2Name = find(mockEdgeClusterList.data[0].edgeList, { serialNumber: node2Sn })?.name

      // eslint-disable-next-line max-len
      expect(error).toHaveTextContent(`NAT pool ranges on ${edge1Name} overlap with those on ${edge2Name}`)
    })
  })
})