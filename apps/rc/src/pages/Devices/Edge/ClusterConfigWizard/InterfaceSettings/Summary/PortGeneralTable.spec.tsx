import _ from 'lodash'

import { EdgeGeneralFixtures, EdgeIpModeEnum, EdgePort, EdgeStatus } from '@acx-ui/rc/utils'
import { render, screen }                                            from '@acx-ui/test-utils'

import { defaultCxtData, getTargetInterfaceFromInterfaceSettingsFormData, mockClusterConfigWizardData } from '../../__tests__/fixtures'
import { ClusterConfigWizardContext }                                                                   from '../../ClusterConfigWizardDataProvider'

import { PortGeneralTable } from './PortGeneralTable'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const nodeList = mockEdgeClusterList.data[0].edgeList as EdgeStatus[]

describe('InterfaceSettings - Summary > port general table', () => {
  it('should render correctly', async () => {
    const mockData = _.cloneDeep(mockClusterConfigWizardData)
    const n1p1 = getTargetInterfaceFromInterfaceSettingsFormData(
      nodeList[0].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
    n1p1!.ipMode = EdgeIpModeEnum.DHCP
    const n2p2 = getTargetInterfaceFromInterfaceSettingsFormData(
      nodeList[1].serialNumber, 'port2', mockData.lagSettings, mockData.portSettings) as EdgePort
    n2p2.enabled = false

    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <PortGeneralTable
          data={mockData.portSettings}
        />
      </ClusterConfigWizardContext.Provider>
    )

    const node1PortsRow = await screen.findAllByRole('row', { name: /Smart Edge 1/ })
    expect(node1PortsRow.length).toBe(2)
    screen.getByRole('row', { name: 'Smart Edge 1 port1 Enabled WAN DHCP' })
    const node2PortsRow = await screen.findAllByRole('row', { name: /Smart Edge 2/ })
    expect(node2PortsRow.length).toBe(1)
    screen.getByRole('row', { name: 'Smart Edge 2 port2 Disabled LAN Static IP 2.2.2.2' })
  })
})