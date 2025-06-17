import React from 'react'

import userEvent               from '@testing-library/user-event'
import { Form, Input, Switch } from 'antd'
import _                       from 'lodash'
import { rest }                from 'msw'

import { Features, useIsSplitOn }                                                                                                                                                                               from '@acx-ui/feature-toggle'
import { CompatibilityNodeError, CompatibilityStatusEnum, useIsEdgeFeatureReady }                                                                                                                               from '@acx-ui/rc/components'
import { edgeApi }                                                                                                                                                                                              from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeDualWanFixtures, EdgeGeneralFixtures, EdgeIpModeEnum, EdgePortConfigFixtures, EdgePortTypeEnum, EdgeSdLanFixtures, EdgeSdLanViewDataP2, EdgeUrlsInfo, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                                                                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                                                                                                                                                          from '@acx-ui/test-utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { PortForm }       from './PortForm'
import * as VirtualIpForm from './VirtualIpForm'

import { InterfaceSettings } from '.'

const {
  mockEdgeClusterList,
  mockSingleNodeClusterStatus,
  mockedHaNetworkSettings
} = EdgeGeneralFixtures
const { mockedPortsStatus } = EdgePortConfigFixtures
const { mockedSdLanServiceP2Dmz } = EdgeSdLanFixtures
const { mockedDualWanNetworkSettings } = EdgeDualWanFixtures
const mockEdgeCluster = _.cloneDeep(EdgeGeneralFixtures.mockEdgeCluster)
mockEdgeCluster.virtualIpSettings.virtualIps[0].virtualIp = '2.2.2.90'
mockEdgeCluster.virtualIpSettings.virtualIps[1].virtualIp = '3.3.3.90'

const mockedUsedNavigate = jest.fn()
const mockedPatchEdgeClusterNetworkSettings = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./LagForm', () => ({
  LagForm: () => <div data-testid='rc-LagForm'></div>
}))
jest.mock('./DualWan', () => ({
  DualWanForm: () => <div data-testid='rc-DualWanForm' />
}))
jest.mock('./SubInterfaceForm', () => ({
  SubInterfaceForm: () => <div data-testid='rc-SubInterfaceForm' />
}))
jest.mock('./PortForm', () => ({
  PortForm: jest.fn().mockImplementation(() => <div data-testid='rc-PortForm' />)
}))
jest.mock('./HaSettingForm', () => ({
  HaSettingForm: () => <div data-testid='rc-HaSettingForm' />
}))
jest.mock('./Summary', () => ({
  Summary: () => <div data-testid='rc-Summary' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  CompatibilityStatusBar: (props: {
    type: CompatibilityStatusEnum,
    errors?: CompatibilityNodeError[]
    }) =>
    <div data-testid='rc-CompatibilityStatusBar'>
      <div data-testid='status'>{props.type}</div>
      {
        // eslint-disable-next-line max-len
        props.errors?.map((nodeErr => <div data-testid={`errors_${nodeErr.nodeId}`} key={`errors_${nodeErr.nodeId}`}>
          {JSON.stringify(nodeErr)}
        </div>))
      }
    </div>,
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

const { mockLanInterfaces } = EdgePortConfigFixtures
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetAllInterfacesByTypeQuery: () => ({
    data: mockLanInterfaces,
    isLoading: false
  })
}))

const MockedPortForm = ({ children, ...others }: React.PropsWithChildren<{
 portIfName: string
  }>) => <div data-testid='rc-PortForm'>
  <Form.Item name='portSettings'>
    <Form.List
      name={['portSettings', mockEdgeCluster.smartEdges[0].serialNumber, others.portIfName]}
    >
      {(fields) => fields.map(({ key }) =>
        <React.Fragment key={key}>
          <Form.Item name={[key, 'portType']}>
            <Input data-testid='portType'/>
          </Form.Item>
          <Form.Item name={[key, 'ipMode']}>
            <Input data-testid='ipMode' />
          </Form.Item>
          <Form.Item name={[key, 'enabled']} valuePropName='checked'>
            <Switch data-testid='enabled' />
          </Form.Item>
          <Form.Item name={[key, 'corePortEnabled']} valuePropName='checked'>
            <Switch data-testid='corePortEnabled' />
          </Form.Item>
          {children}
        </React.Fragment>
      )}
    </Form.List>
  </Form.Item>
</div>

const defaultCxtData = {
  clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
  portsStatus: mockedPortsStatus,
  edgeSdLanData: mockedSdLanServiceP2Dmz as EdgeSdLanViewDataP2,
  clusterNetworkSettings: mockedHaNetworkSettings,
  isLoading: false,
  isFetching: false
}

describe('InterfaceSettings', () => {
  let params: { tenantId: string, clusterId:string, settingType:string }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id',
      settingType: 'interface'
    }

    mockedUsedNavigate.mockClear()
    mockedPatchEdgeClusterNetworkSettings.mockClear()
    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.patchEdgeClusterNetworkSettings.url,
        (req, res, ctx) => {
          mockedPatchEdgeClusterNetworkSettings(req.body)
          return res(ctx.status(202))
        })
    )
  })

  it('should correctly render', async () => {
    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const form = await screen.findByTestId('steps-form')
    within(form).getByRole('button', { name: 'LAG' })
    expect(await screen.findByTestId('rc-LagForm')).toBeVisible()
  })

  it('should show HA setting step when the HA/AA FF is on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_HA_AA_TOGGLE)
    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const stepsForm = await screen.findByTestId('steps-form')
    const nextBtn = screen.getByRole('button', { name: 'Next' })
    within(stepsForm).getByTestId('rc-LagForm')
    await userEvent.click(nextBtn)
    within(stepsForm).getByTestId('rc-PortForm')
    await userEvent.click(nextBtn)
    await within(stepsForm).findByTestId('rc-HaSettingForm')
    await userEvent.click(nextBtn)

    await within(stepsForm).findByTestId('rc-Summary')
  })

  it('should show Sub-Interface setting step when the Core Access FF is ON', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_HA_AA_TOGGLE)
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff => ff === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const stepsForm = await screen.findByTestId('steps-form')
    const nextBtn = screen.getByRole('button', { name: 'Next' })
    within(stepsForm).getByTestId('rc-LagForm')
    await userEvent.click(nextBtn)
    within(stepsForm).getByTestId('rc-PortForm')
    await userEvent.click(nextBtn)
    await within(stepsForm).findByTestId('rc-SubInterfaceForm')
    await userEvent.click(nextBtn)
    await within(stepsForm).findByTestId('rc-HaSettingForm')
    await userEvent.click(nextBtn)

    await within(stepsForm).findByTestId('rc-Summary')
  })

  it('should redirect to cluster list page', async () => {
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff => ff !== Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
    jest.spyOn(VirtualIpForm, 'VirtualIpForm')
      .mockImplementationOnce(() => <div data-testid='rc-VirtualIpForm'/>)

    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const stepsForm = await screen.findByTestId('steps-form')
    const nextBtn = screen.getByRole('button', { name: 'Next' })
    within(stepsForm).getByTestId('rc-LagForm')
    await userEvent.click(nextBtn)
    within(stepsForm).getByTestId('rc-PortForm')
    await userEvent.click(nextBtn)
    await within(stepsForm).findByTestId('rc-VirtualIpForm')
    await userEvent.click(nextBtn)

    await within(stepsForm).findByTestId('rc-Summary')
    await userEvent.click(screen.getByRole('button', { name: 'Apply & Finish' }))
    await waitFor(() =>
      expect(mockedUsedNavigate).toBeCalledWith({
        hash: '',
        pathname: `/${params.tenantId}/t/devices/edge`,
        search: ''
      }))
    expect(mockedPatchEdgeClusterNetworkSettings).toBeCalled()
  })

  it('should redirect to config wizard setting type selection page', async () => {
    jest.spyOn(VirtualIpForm, 'VirtualIpForm')
      .mockImplementationOnce(() => <div data-testid='rc-VirtualIpForm'/>)

    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const stepsForm = await screen.findByTestId('steps-form')
    const nextBtn = screen.getByRole('button', { name: 'Next' })
    within(stepsForm).getByTestId('rc-LagForm')
    await userEvent.click(nextBtn)
    within(stepsForm).getByTestId('rc-PortForm')
    await userEvent.click(nextBtn)
    await within(stepsForm).findByTestId('rc-VirtualIpForm')
    await userEvent.click(nextBtn)
    await within(stepsForm).findByTestId('rc-Summary')
    await userEvent.click(screen.getByRole('button', { name: 'Apply & Continue' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/devices/edge/cluster/${params.clusterId}/configure`,
      search: ''
    }))
  })

  it('should redirect to cluster list page when cancel stepsForm', async () => {
    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const stepsForm = await screen.findByTestId('steps-form')
    within(stepsForm).getByTestId('rc-LagForm')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/devices/edge`,
      search: ''
    }))
  })

  it('should change ipMode into STATIC when port type changed to LAN', async () => {
    jest.mocked(PortForm)
      .mockImplementation(() => <MockedPortForm portIfName='port1'/>)

    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const stepsForm = await screen.findByTestId('steps-form')
    within(stepsForm).getByTestId('rc-LagForm')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    const form = within(stepsForm).getByTestId('rc-PortForm')
    const ipMode = within(form).getByTestId('ipMode')
    const portType = within(form).getByTestId('portType')

    expect(portType).toHaveValue(EdgePortTypeEnum.WAN)
    expect(ipMode).toHaveValue(EdgeIpModeEnum.STATIC)
    await userEvent.clear(ipMode)
    await userEvent.type(ipMode, EdgeIpModeEnum.DHCP)
    expect(ipMode).toHaveValue(EdgeIpModeEnum.DHCP)
    await userEvent.clear(portType)
    await userEvent.type(portType, EdgePortTypeEnum.LAN)
    await waitFor(() =>
      expect(ipMode).toHaveAttribute('value', EdgeIpModeEnum.STATIC))
  })

  it('should change nat into true when port type changed to WAN', async () => {
    jest.mocked(PortForm)
      .mockImplementation(() => <MockedPortForm portIfName='port2'>
        <Form.Item name={[0, 'natEnabled']} valuePropName='checked'>
          <Switch data-testid='natEnabled' />
        </Form.Item>
      </MockedPortForm>)

    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const stepsForm = await screen.findByTestId('steps-form')
    within(stepsForm).getByTestId('rc-LagForm')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    const form = within(stepsForm).getByTestId('rc-PortForm')
    const ipMode = within(form).getByTestId('ipMode')
    const portType = within(form).getByTestId('portType')
    const natEnabled = within(form).getByTestId('natEnabled')

    expect(portType).toHaveValue(EdgePortTypeEnum.LAN)
    expect(ipMode).toHaveValue(EdgeIpModeEnum.STATIC)
    expect(natEnabled).not.toBeChecked()
    await userEvent.clear(portType)
    await userEvent.type(portType, EdgePortTypeEnum.WAN)
    await waitFor(() => expect(natEnabled).toBeChecked())
  })

  it('should correctly handle corePortEnabled change', async () => {
    jest.mocked(PortForm)
      .mockImplementation(() => <MockedPortForm portIfName='port2'/>)

    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const stepsForm = await screen.findByTestId('steps-form')
    within(stepsForm).getByTestId('rc-LagForm')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    const form = within(stepsForm).getByTestId('rc-PortForm')
    const ipMode = within(form).getByTestId('ipMode')
    const portType = within(form).getByTestId('portType')
    const corePortEnabled = within(form).getByTestId('corePortEnabled')

    expect(portType).toHaveValue(EdgePortTypeEnum.LAN)
    expect(ipMode).toHaveValue(EdgeIpModeEnum.STATIC)
    await userEvent.clear(ipMode)
    await userEvent.type(ipMode, EdgeIpModeEnum.DHCP)
    expect(corePortEnabled).toBeChecked()
    await userEvent.click(corePortEnabled)
    expect(corePortEnabled).not.toBeChecked()
    await waitFor(() =>
      expect(ipMode).toHaveValue(EdgeIpModeEnum.STATIC))
  })

  it('should popup warning when virtual IP changed', async () => {
    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const stepsForm = await screen.findByTestId('steps-form')
    const nextBtn = screen.getByRole('button', { name: 'Next' })
    within(stepsForm).getByTestId('rc-LagForm')
    await userEvent.click(nextBtn)
    within(stepsForm).getByTestId('rc-PortForm')
    await userEvent.click(nextBtn)
    await waitFor(() =>
      expect(within(stepsForm).queryByRole('heading', { name: 'Cluster Virtual IP' })).toBeValid())
    // eslint-disable-next-line max-len
    const vipInputs = await within(stepsForm).findAllByRole('textbox', { name: 'Virtual IP Address' })
    await userEvent.clear(vipInputs[0])
    await userEvent.type(vipInputs[0], '2.2.2.10')
    await userEvent.click(nextBtn)
    await within(stepsForm).findByTestId('rc-Summary')
    await userEvent.click(screen.getByRole('button', { name: 'Apply & Continue' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Changing any virtual IP configurations might')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should do compatibility check on PortForm', async () => {
    jest.mocked(PortForm)
      .mockImplementation(() => <MockedPortForm portIfName='port2'/>)

    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const stepsForm = await screen.findByTestId('steps-form')
    within(stepsForm).getByTestId('rc-LagForm')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    const form = within(stepsForm).getByTestId('rc-PortForm')
    await userEvent.click(within(form).getByTestId('corePortEnabled'))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    const compatibleStatusBar = await screen.findByTestId('rc-CompatibilityStatusBar')
    // eslint-disable-next-line max-len
    expect(within(compatibleStatusBar).getByTestId('status').textContent).toBe(CompatibilityStatusEnum.FAIL)
    expect(within(compatibleStatusBar)
      .getByTestId(`errors_${mockEdgeCluster.smartEdges[0].serialNumber}`))
      .toHaveTextContent('"corePorts":{"value":0,"isError":true}')
  })

  it('should do compatibility check on LagForm', async () => {
    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    const stepsForm = await screen.findByTestId('steps-form')
    within(stepsForm).getByTestId('rc-LagForm')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    const compatibleStatusBar = await screen.findByTestId('rc-CompatibilityStatusBar')
    // eslint-disable-next-line max-len
    expect(within(compatibleStatusBar).getByTestId('status').textContent).toBe(CompatibilityStatusEnum.PASS)
    expect(within(compatibleStatusBar)
      .queryByTestId(`errors_${mockEdgeCluster.smartEdges[0].serialNumber}`)).toBeNull()
  })

  describe('should popup confirm when dual WAN is removed', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_DUAL_WAN_TOGGLE)
    })

    afterEach(() => {jest.mocked(useIsEdgeFeatureReady).mockReset()})

    it('when WAN port count is changed to < 2', async () => {
      jest.mocked(PortForm)
        .mockImplementation(() => <MockedPortForm portIfName='port1'/>)
      jest.spyOn(VirtualIpForm, 'VirtualIpForm')
        .mockImplementationOnce(() => <div data-testid='rc-VirtualIpForm'/>)

      const mockCxtData = {
        ...defaultCxtData,
        clusterInfo: mockSingleNodeClusterStatus,
        clusterNetworkSettings: mockedDualWanNetworkSettings
      }

      render(<Provider>
        <ClusterConfigWizardContext.Provider value={mockCxtData}>
          <InterfaceSettings />
        </ClusterConfigWizardContext.Provider>
      </Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

      const stepsForm = await screen.findByTestId('steps-form')
      within(stepsForm).getByTestId('rc-LagForm')
      await userEvent.click(screen.getByRole('button', { name: 'Next' }))
      const form = within(stepsForm).getByTestId('rc-PortForm')
      const portType = within(form).getByTestId('portType')
      const enabled = within(form).getByTestId('enabled')

      expect(portType).toHaveValue(EdgePortTypeEnum.WAN)
      expect(enabled).toBeChecked()
      // turn off the 1 WAN port to make it run as single WAN
      await userEvent.click(enabled)
      await waitFor(() => expect(enabled).not.toBeChecked())

      await userEvent.click(screen.getByRole('button', { name: 'Next' }))
      await within(stepsForm).findByTestId('rc-VirtualIpForm')
      expect(within(stepsForm).queryByTestId('rc-DualWanForm')).toBeNull()
      await userEvent.click(screen.getByRole('button', { name: 'Next' }))
      await within(stepsForm).findByTestId('rc-Summary')
      await userEvent.click(screen.getByRole('button', { name: 'Apply & Continue' }))
      const dialog = await screen.findByRole('dialog')
      // eslint-disable-next-line max-len
      expect(dialog).toHaveTextContent('You are about to reduce the number of enabled WAN ports,')
      await userEvent.click(within(dialog).getByRole('button', { name: 'Apply the changes' }))
      await waitFor(() =>
        expect(mockedUsedNavigate).toBeCalledWith({
          hash: '',
          pathname: `/${params.tenantId}/t/devices/edge/cluster/mocked_cluster_id/configure`,
          search: ''
        }))
      expect(mockedPatchEdgeClusterNetworkSettings).toBeCalled()
    })
  })

  describe('Single node', () => {
    const mockSingleNodeCluster = _.cloneDeep(mockEdgeCluster)
    mockSingleNodeCluster.smartEdges.splice(1, 1)
    mockSingleNodeCluster.virtualIpSettings.virtualIps.splice(1, 1)
    mockSingleNodeCluster.virtualIpSettings.virtualIps[0].ports.splice(1, 1)

    beforeEach(() => {
      mockServer.use(
        rest.get(
          EdgeUrlsInfo.getEdgeCluster.url,
          (_req, res, ctx) => res(ctx.json(mockSingleNodeCluster))
        )
      )
    })

    const mockSingleNodeClusterInfo = _.cloneDeep(mockEdgeClusterList.data[0])
    mockSingleNodeClusterInfo.edgeList.splice(1, 1)
    const defaultSingleNodeCxtData = {
      ...defaultCxtData,
      clusterInfo: mockSingleNodeClusterInfo as EdgeClusterStatus
    }

    it('should not render compatible check', async () => {
      render(<Provider>
        <ClusterConfigWizardContext.Provider value={defaultSingleNodeCxtData}>
          <InterfaceSettings />
        </ClusterConfigWizardContext.Provider>
      </Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

      within(await screen.findByTestId('steps-form')).getByTestId('rc-LagForm')
      await userEvent.click(screen.getByRole('button', { name: 'Next' }))
      const compatibleStatusBar = screen.queryByTestId('rc-CompatibilityStatusBar')
      expect(compatibleStatusBar).toBeNull()
    })

    it('should render dual WAN firmware compatibility check warning', async () => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_DUAL_WAN_TOGGLE)

      const mockCxtData = {
        ...defaultCxtData,
        clusterInfo: mockSingleNodeClusterStatus as EdgeClusterStatus,
        clusterNetworkSettings: mockedDualWanNetworkSettings,
        requiredFwMap: {
          [IncompatibilityFeatures.CORE_ACCESS_SEPARATION]: '2.5.0.1',
          [IncompatibilityFeatures.DUAL_WAN]: '2.4.0.1'
        }
      }

      render(<Provider>
        <ClusterConfigWizardContext.Provider value={mockCxtData}>
          <InterfaceSettings />
        </ClusterConfigWizardContext.Provider>
      </Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

      within(await screen.findByTestId('steps-form')).getByTestId('rc-LagForm')
      const dualWanStepTitle = await screen.findByText('Dual WAN')
      expect(await within(dualWanStepTitle).findByTestId('WarningTriangleSolid')).toBeVisible()
    })
  })

  describe('empty cluster', () => {
    const mockZeroNodeCluster = _.cloneDeep(mockEdgeCluster)
    mockZeroNodeCluster.smartEdges = []
    mockZeroNodeCluster.virtualIpSettings.virtualIps = []
    beforeEach(() => {
      mockServer.use(
        rest.get(
          EdgeUrlsInfo.getEdgeCluster.url,
          (_req, res, ctx) => res(ctx.json(mockZeroNodeCluster))
        )
      )
    })

    const mockZeroNodeClusterInfo = _.cloneDeep(mockEdgeClusterList.data[0])
    mockZeroNodeClusterInfo.edgeList = []
    const defaultSingleNodeCxtData = {
      ...defaultCxtData,
      clusterInfo: mockZeroNodeClusterInfo as EdgeClusterStatus
    }

    it('should correctly render', async () => {
      render(<Provider>
        <ClusterConfigWizardContext.Provider value={defaultSingleNodeCxtData}>
          <InterfaceSettings />
        </ClusterConfigWizardContext.Provider>
      </Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

      within(await screen.findByTestId('steps-form')).getByTestId('rc-LagForm')
      await userEvent.click(screen.getByRole('button', { name: 'Next' }))
      const compatibleStatusBar = screen.queryByTestId('rc-CompatibilityStatusBar')
      expect(compatibleStatusBar).toBeNull()
    })
  })
})