import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { Features }                                 from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                    from '@acx-ui/rc/components'
import { EdgeGeneralFixtures, EdgeLag, EdgeStatus } from '@acx-ui/rc/utils'
import { render, screen, within }                   from '@acx-ui/test-utils'

import { defaultCxtData, getTargetInterfaceFromInterfaceSettingsFormData, mockClusterConfigWizardData } from '../../__tests__/fixtures'
import { ClusterConfigWizardContext }                                                                   from '../../ClusterConfigWizardDataProvider'

import { LagTable } from './LagTable'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const nodeList = mockEdgeClusterList.data[0].edgeList as EdgeStatus[]

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('InterfaceSettings - Summary > LagTable', () => {
  it('should render correctly', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <LagTable
          data={mockClusterConfigWizardData.lagSettings}
          portSettings={mockClusterConfigWizardData.portSettings}
        />
      </ClusterConfigWizardContext.Provider>
    )

    const node1LagsRow = screen.queryAllByRole('row', { name: /Smart Edge 1/ })
    screen.getByRole('row', { name: 'Smart Edge 1 Lag0 LACP (Active) 0 LAN DHCP Enabled' })
    expect(node1LagsRow.length).toBe(1)
    const node2LagsRow = screen.getAllByRole('row', { name: /Smart Edge 2/ })
    expect(node2LagsRow.length).toBe(1)
    // eslint-disable-next-line max-len
    screen.getByRole('row', { name: 'Smart Edge 2 Lag1 LACP (Active) 0 LAN Static IP 1.10.10.1 Enabled' })
  })

  it('should correctly handle empty Lags and Lag is not enabled', async () => {
    const mockData = _.cloneDeep(mockClusterConfigWizardData)
    const node1Idx = mockData.lagSettings.findIndex(item =>
      item.serialNumber === nodeList[0].serialNumber)
    mockData.lagSettings[node1Idx].lags = []
    const n2p2 = getTargetInterfaceFromInterfaceSettingsFormData(
      nodeList[1].serialNumber, 'lag1', mockData.lagSettings, mockData.portSettings) as EdgeLag
    n2p2.lagEnabled = false

    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <LagTable
          data={mockData.lagSettings}
          portSettings={mockData.portSettings}
        />
      </ClusterConfigWizardContext.Provider>
    )

    const node1LagsRow = screen.queryAllByRole('row', { name: /Smart Edge 1/ })
    expect(node1LagsRow.length).toBe(0)
    const node2LagsRow = screen.getAllByRole('row', { name: /Smart Edge 2/ })
    expect(node2LagsRow.length).toBe(1)
    // eslint-disable-next-line max-len
    screen.getByRole('row', { name: 'Smart Edge 2 Lag1 LACP (Active) 0 LAN Static IP 1.10.10.1 Disabled' })
  })

  it('should correctly display lag members', async () => {
    const mockData = _.cloneDeep(mockClusterConfigWizardData)
    const node1Idx = mockData.lagSettings.findIndex(item =>
      item.serialNumber === nodeList[0].serialNumber)
    mockData.lagSettings[node1Idx].lags[0].lagMembers = [{
      portId: 'port_id_0',
      portEnabled: true
    }]
    const node2Idx = mockData.lagSettings.findIndex(item =>
      item.serialNumber === nodeList[1].serialNumber)
    mockData.lagSettings[node2Idx].lags[0].lagMembers = [{
      portId: 'port_id_0',
      portEnabled: true
    }]

    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <LagTable
          data={mockData.lagSettings}
          portSettings={mockData.portSettings}
        />
      </ClusterConfigWizardContext.Provider>
    )

    const node1LagsRow = screen.queryAllByRole('row', { name: /Smart Edge 1/ })
    expect(node1LagsRow.length).toBe(1)
    const node2LagsRow = screen.getAllByRole('row', { name: /Smart Edge 2/ })
    expect(node2LagsRow.length).toBe(1)
    // eslint-disable-next-line max-len
    screen.getByRole('row', { name: 'Smart Edge 2 Lag1 LACP (Active) 1 LAN Static IP 1.10.10.1 Enabled' })
    // eslint-disable-next-line max-len
    screen.getByRole('row', { name: 'Smart Edge 1 Lag0 LACP (Active) 1 LAN DHCP Enabled' })
    const lagMembersCells = screen.getAllByRole('cell', { name: '1' })
    expect(lagMembersCells.length).toBe(2)
    await userEvent.hover(within(lagMembersCells[0]).getByText('1'))
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('Port1 (Enabled)')
    await userEvent.hover(within(lagMembersCells[1]).getByText('1'))
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('Port1 (Enabled)')
  })

  describe('Core Access', () => {
    beforeEach(() => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
    })

    afterEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReset()
    })

    it('should show core port and access port column when FF is on', async () => {
      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <LagTable
            data={mockClusterConfigWizardData.lagSettings}
            portSettings={mockClusterConfigWizardData.portSettings}
          />
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByRole('columnheader', { name: 'Core Port' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Access Port' })).toBeVisible()
    })
  })
})