import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { CompatibilityStatusBar, CompatibilityStatusEnum } from '@acx-ui/rc/components'
import {
  ClusterHighAvailabilityModeEnum,
  ClusterNetworkSettings,
  EdgeGeneralFixtures,
  EdgeIpModeEnum,
  EdgeLag,
  EdgeLagLacpModeEnum,
  EdgeLagTimeoutEnum,
  EdgeLagTypeEnum,
  EdgePortInfo,
  EdgePortTypeEnum,
  EdgeStatus
} from '@acx-ui/rc/utils'
import { render, screen, within } from '@acx-ui/test-utils'

import {
  getTargetInterfaceFromInterfaceSettingsFormData,
  mockClusterConfigWizardData,
  mockFailedNetworkConfig
} from '../__tests__/fixtures'

import { CompatibilityCheckResult, InterfaceSettingsFormType } from './types'
import {
  getLagFormCompatibilityFields,
  getPortFormCompatibilityFields,
  interfaceCompatibilityCheck,
  interfaceNameComparator,
  lagSettingsCompatibleCheck,
  transformFromApiToFormData,
  transformFromFormToApiData } from './utils'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const nodeList = mockEdgeClusterList.data[0].edgeList as EdgeStatus[]
const node1SN = nodeList[0].serialNumber
const node2SN = nodeList[1].serialNumber
const mockNoLagData = transformFromApiToFormData(mockFailedNetworkConfig)
mockNoLagData.lagSettings = nodeList.map(item => ({
  serialNumber: item.serialNumber,
  lags: [] as EdgeLag[]
})) as InterfaceSettingsFormType['lagSettings']

jest.mock('antd', () => {
  const antdComponents =jest.requireActual('antd')
  antdComponents.Typography.Text = ({ children, type }
    : React.PropsWithChildren<{ type: string }>) => (<span data-testid='rc-text'>
    <div data-testid='rc-text-type'>{type}</div>
    {children}
  </span>
  )
  return { ...antdComponents }
})

describe('Interface Compatibility Check', () => {
  it('when node is missing in port setting', async () => {
    const mockData = _.cloneDeep(mockNoLagData)
    const n1p1 = getTargetInterfaceFromInterfaceSettingsFormData(
      nodeList[0].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
    n1p1!.portType = EdgePortTypeEnum.LAN
    n1p1!.corePortEnabled = true
    const n1p2 = getTargetInterfaceFromInterfaceSettingsFormData(
      nodeList[0].serialNumber, 'port2', mockData.lagSettings, mockData.portSettings)
    n1p2!.portType = EdgePortTypeEnum.CLUSTER
    const n2p1 = getTargetInterfaceFromInterfaceSettingsFormData(
      nodeList[1].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
    n2p1!.portType = EdgePortTypeEnum.CLUSTER
    n2p1!.ipMode = EdgeIpModeEnum.DHCP
    const n2p2 = getTargetInterfaceFromInterfaceSettingsFormData(
      nodeList[1].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
    n2p2!.ipMode = EdgeIpModeEnum.DHCP
    n2p2!.corePortEnabled = true

    const result = interfaceCompatibilityCheck(
      mockData.portSettings, mockData.lagSettings, nodeList)

    expect(result.isError).toBe(false)
    expect(result.portTypes).toBe(true)
    expect(result.corePorts).toBe(true)
    expect(result.ports).toBe(true)

  })

  describe('success case', () => {
    it('when core LAN + cluster port', async () => {
      const mockData = _.cloneDeep(mockNoLagData)
      const n1p1 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[0].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
      n1p1!.portType = EdgePortTypeEnum.LAN
      n1p1!.corePortEnabled = true
      const n1p2 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[0].serialNumber, 'port2', mockData.lagSettings, mockData.portSettings)
      n1p2!.portType = EdgePortTypeEnum.CLUSTER
      const n2p1 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[1].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
      n2p1!.portType = EdgePortTypeEnum.CLUSTER
      n2p1!.ipMode = EdgeIpModeEnum.DHCP
      const n2p2 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[1].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
      n2p2!.ipMode = EdgeIpModeEnum.DHCP
      n2p2!.corePortEnabled = true

      const result = interfaceCompatibilityCheck(
        mockData.portSettings, mockData.lagSettings, nodeList)

      expect(result.isError).toBe(false)
      expect(result.portTypes).toBe(true)
      expect(result.corePorts).toBe(true)
      expect(result.ports).toBe(true)

      const node1ErrResult = result.results.find(item => item.nodeId === node1SN)?.errors
      expect(node1ErrResult?.corePorts.isError).toBe(false)
      expect(node1ErrResult?.corePorts.value).toBe(1)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.CLUSTER].isError).toBe(false)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.CLUSTER].value).toBe(1)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(false)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN].value).toBe(1)

      const node2ErrResult = result.results.find(item => item.nodeId === node2SN)?.errors
      expect(node2ErrResult?.corePorts.isError).toBe(false)
      expect(node2ErrResult?.corePorts.value).toBe(1)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.CLUSTER].isError).toBe(false)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.CLUSTER].value).toBe(1)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(false)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN].value).toBe(1)
    })
  })

  describe('failed case', () => {
    it('when is LAG member', async () => {
      // node2 port1 is lag member
      const mockData = _.cloneDeep(transformFromApiToFormData(mockFailedNetworkConfig))

      const result = interfaceCompatibilityCheck(
        mockData.portSettings, mockData.lagSettings, nodeList)

      expect(result.isError).toBe(true)
      expect(result.portTypes).toBe(false)
      expect(result.corePorts).toBe(true)
      expect(result.ports).toBe(false)

      const node1ErrResult = result.results.find(item => item.nodeId === node1SN)?.errors
      expect(node1ErrResult?.corePorts.isError).toBe(false)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.WAN].isError).toBe(true)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.WAN].value).toBe(1)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(false)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN].value).toBe(1)

      const node2ErrResult = result.results.find(item => item.nodeId === node2SN)?.errors
      expect(node2ErrResult?.corePorts.isError).toBe(false)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.WAN]).toBe(undefined)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(false)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN].value).toBe(1)
    })

    it('when only first node has cluster port', async () => {
      const mockData = _.cloneDeep(mockNoLagData)
      const target = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[0].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
      target!.portType = EdgePortTypeEnum.CLUSTER

      const result = interfaceCompatibilityCheck(
        mockData.portSettings, mockData.lagSettings, nodeList)

      expect(result.isError).toBe(true)
      expect(result.portTypes).toBe(false)
      expect(result.corePorts).toBe(true)
      expect(result.ports).toBe(true)

      const node1ErrResult = result.results.find(item => item.nodeId === node1SN)?.errors
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.CLUSTER].isError).toBe(true)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.CLUSTER].value).toBe(1)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(false)

      const node2ErrResult = result.results.find(item => item.nodeId === node2SN)?.errors
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.CLUSTER]).toBe(undefined)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.UNCONFIGURED].isError).toBe(false)
    })

    it('when only first node has core port', async () => {
      const mockData = _.cloneDeep(mockNoLagData)
      const n1p1 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[0].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
      n1p1!.portType = EdgePortTypeEnum.LAN
      n1p1!.corePortEnabled = true
      n1p1!.gateway = ''
      const n2p1 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[1].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
      n2p1!.portType = EdgePortTypeEnum.LAN
      n2p1!.ip = '5.5.5.5'
      n2p1!.subnet = '255.255.255.0'

      const result = interfaceCompatibilityCheck(
        mockData.portSettings, mockData.lagSettings, nodeList)

      expect(result.isError).toBe(true)
      expect(result.portTypes).toBe(true)
      expect(result.corePorts).toBe(false)
      expect(result.ports).toBe(true)

      const node1ErrResult = result.results.find(item => item.nodeId === node1SN)?.errors
      expect(node1ErrResult?.corePorts.isError).toBe(true)
      expect(node1ErrResult?.corePorts.value).toBe(1)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.CLUSTER]).toBe(undefined)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN]?.isError).toBe(false)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN]?.value).toBe(2)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.WAN]).toBe(undefined)

      const node2ErrResult = result.results.find(item => item.nodeId === node2SN)?.errors
      expect(node2ErrResult?.corePorts.isError).toBe(true)
      expect(node2ErrResult?.corePorts.value).toBe(0)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(false)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN]?.value).toBe(2)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.WAN]).toBe(undefined)
    })

    it('when first node has core LAN + LAN port, second node only core LAN', async () => {
      const mockData = _.cloneDeep(mockNoLagData)
      const n1p1 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[0].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
      n1p1!.portType = EdgePortTypeEnum.LAN
      n1p1!.corePortEnabled = true
      n1p1!.gateway = ''
      const n2p2 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[1].serialNumber, 'port2', mockData.lagSettings, mockData.portSettings)
      n2p2!.portType = EdgePortTypeEnum.LAN
      n2p2!.corePortEnabled = true
      n2p2!.ipMode = EdgeIpModeEnum.DHCP

      const result = interfaceCompatibilityCheck(
        mockData.portSettings, mockData.lagSettings, nodeList)
      expect(result.isError).toBe(true)
      expect(result.portTypes).toBe(false)
      expect(result.corePorts).toBe(true)
      expect(result.ports).toBe(true)

      const node1ErrResult = result.results.find(item => item.nodeId === node1SN)?.errors
      expect(node1ErrResult?.corePorts.isError).toBe(false)
      expect(node1ErrResult?.corePorts.value).toBe(1)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN]?.isError).toBe(true)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN]?.value).toBe(2)

      const node2ErrResult = result.results.find(item => item.nodeId === node2SN)?.errors
      expect(node2ErrResult?.corePorts.isError).toBe(false)
      expect(node2ErrResult?.corePorts.value).toBe(1)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN]?.isError).toBe(true)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN]?.value).toBe(1)
    })

    it('when only first node has unconfigured', async () => {
      const mockData = _.cloneDeep(mockNoLagData)
      const n1p1 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[0].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
      n1p1!.portType = EdgePortTypeEnum.UNCONFIGURED
      n1p1!.ip = ''
      n1p1!.subnet = ''
      n1p1!.gateway = ''
      const n2p1 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[1].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
      n2p1!.portType = EdgePortTypeEnum.LAN
      n2p1!.ip = '5.5.5.5'
      n2p1!.subnet = '255.255.255.0'

      const result = interfaceCompatibilityCheck(
        mockData.portSettings, mockData.lagSettings, nodeList)

      expect(result.isError).toBe(true)
      expect(result.portTypes).toBe(false)
      expect(result.corePorts).toBe(true)
      expect(result.ports).toBe(true)

      const node1ErrResult = result.results.find(item => item.nodeId === node1SN)?.errors
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.UNCONFIGURED]?.isError).toBe(false)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.UNCONFIGURED]?.value).toBe(1)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN]?.isError).toBe(true)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN]?.value).toBe(1)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.WAN]).toBe(undefined)

      const node2ErrResult = result.results.find(item => item.nodeId === node2SN)?.errors
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.UNCONFIGURED]).toBe(undefined)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(true)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN]?.value).toBe(2)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.WAN]).toBe(undefined)
    })

    it('when first node Cluster + LAN, second node WAN + LAN', async () => {
      const mockData = _.cloneDeep(mockNoLagData)
      const n1p1 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[0].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
      n1p1!.portType = EdgePortTypeEnum.CLUSTER
      const n2p1 = getTargetInterfaceFromInterfaceSettingsFormData(
        nodeList[1].serialNumber, 'port1', mockData.lagSettings, mockData.portSettings)
      n2p1!.portType = EdgePortTypeEnum.WAN

      const result = interfaceCompatibilityCheck(
        mockData.portSettings, mockData.lagSettings, nodeList)
      expect(result.isError).toBe(true)
      expect(result.portTypes).toBe(false)
      expect(result.corePorts).toBe(true)
      expect(result.ports).toBe(true)

      const node1ErrResult = result.results.find(item => item.nodeId === node1SN)?.errors
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.CLUSTER].isError).toBe(true)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.CLUSTER].value).toBe(1)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.WAN]).toBe(undefined)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(false)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN].value).toBe(1)

      const node2ErrResult = result.results.find(item => item.nodeId === node2SN)?.errors
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.CLUSTER]).toBe(undefined)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.WAN].isError).toBe(true)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.WAN].value).toBe(1)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(false)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN].value).toBe(1)
    })
  })
})

describe('LAG Settings Compatibility Check', () => {
  const nodeList = mockEdgeClusterList.data[0].edgeList as EdgeStatus[]
  const node1SN = nodeList[0].serialNumber
  const node2SN = nodeList[1].serialNumber

  describe('success case', () => {
    it('when both node no LAG', async () => {
      const result = lagSettingsCompatibleCheck(mockNoLagData.lagSettings, nodeList)

      expect(result.isError).toBe(false)
      expect(result.portTypes).toBe(true)
      expect(result.corePorts).toBe(true)
      expect(result.ports).toBe(true)
    })

    it('when core LAG', async () => {
      const mockData = _.cloneDeep(transformFromApiToFormData(mockFailedNetworkConfig).lagSettings)
      const result = lagSettingsCompatibleCheck(mockData, nodeList)

      expect(result.isError).toBe(false)
      expect(result.portTypes).toBe(true)
      expect(result.corePorts).toBe(true)
      expect(result.ports).toBe(true)

      const node1ErrResult = result.results.find(item => item.nodeId === node1SN)?.errors
      expect(node1ErrResult?.corePorts.isError).toBe(false)
      expect(node1ErrResult?.corePorts.value).toBe(1)

      const node2ErrResult = result.results.find(item => item.nodeId === node2SN)?.errors
      expect(node2ErrResult?.corePorts.isError).toBe(false)
      expect(node2ErrResult?.corePorts.value).toBe(1)
    })

    it('when core LAG + LAN LAG', async () => {
      const mockData = _.cloneDeep(transformFromApiToFormData(mockFailedNetworkConfig).lagSettings)
      const lanLag = {
        id: 2,
        description: 'test',
        lagType: EdgeLagTypeEnum.LACP,
        lacpMode: EdgeLagLacpModeEnum.ACTIVE,
        lacpTimeout: EdgeLagTimeoutEnum.SHORT,
        lagMembers: [],
        portType: EdgePortTypeEnum.LAN,
        ipMode: EdgeIpModeEnum.STATIC,
        ip: '2.2.2.2',
        subnet: '255.255.255.0',
        gateway: '',
        corePortEnabled: false,
        natEnabled: false,
        lagEnabled: true
      }
      mockData[0].lags.push(lanLag)
      mockData[1].lags.push(lanLag)
      const result = lagSettingsCompatibleCheck(mockData, nodeList)

      expect(result.isError).toBe(false)
      expect(result.portTypes).toBe(true)
      expect(result.corePorts).toBe(true)
      expect(result.ports).toBe(true)

      const node1ErrResult = result.results.find(item => item.nodeId === node1SN)?.errors
      expect(node1ErrResult?.corePorts.isError).toBe(false)
      expect(node1ErrResult?.corePorts.value).toBe(1)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(false)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN].value).toBe(2)

      const node2ErrResult = result.results.find(item => item.nodeId === node2SN)?.errors
      expect(node2ErrResult?.corePorts.isError).toBe(false)
      expect(node2ErrResult?.corePorts.value).toBe(1)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(false)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.LAN].value).toBe(2)
    })
  })

  describe('failed case', () => {
    it('when first node core LAG, second node WAN LAG', async () => {
      const mockData = _.cloneDeep(transformFromApiToFormData(mockFailedNetworkConfig).lagSettings)
      mockData[1].lags[0].portType = EdgePortTypeEnum.WAN
      mockData[1].lags[0].ipMode = EdgeIpModeEnum.DHCP
      mockData[1].lags[0].corePortEnabled = false
      const result = lagSettingsCompatibleCheck(mockData, nodeList)

      expect(result.isError).toBe(true)
      expect(result.portTypes).toBe(false)
      expect(result.corePorts).toBe(false)
      expect(result.ports).toBe(true)

      const node1ErrResult = result.results.find(item => item.nodeId === node1SN)?.errors
      expect(node1ErrResult?.corePorts.isError).toBe(true)
      expect(node1ErrResult?.corePorts.value).toBe(1)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN].isError).toBe(true)
      expect(node1ErrResult?.portTypes[EdgePortTypeEnum.LAN].value).toBe(1)

      const node2ErrResult = result.results.find(item => item.nodeId === node2SN)?.errors
      expect(node2ErrResult?.corePorts.isError).toBe(true)
      expect(node2ErrResult?.corePorts.value).toBe(0)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.WAN].isError).toBe(true)
      expect(node2ErrResult?.portTypes[EdgePortTypeEnum.WAN].value).toBe(1)
    })
  })
})

describe('Compatibility status result rendering', () => {
  describe('LAG', () => {
    const lagCompatibilityFields = getLagFormCompatibilityFields()

    it('should correctly display compatible error details', async () => {
      const checkResult = {
        isError: true,
        ports: true,
        corePorts: false,
        portTypes: true,
        results: [{
          nodeId: 'serialNumber-1',
          nodeName: 'SE-1',
          errors: {
            ports: { isError: false, value: 2 },
            corePorts: { isError: true, value: 1 },
            portTypes: {
              [EdgePortTypeEnum.WAN]: { isError: true, value: 0 },
              [EdgePortTypeEnum.CLUSTER]: { isError: true, value: 1 }
            }
          }
        }, {
          nodeId: 'serialNumber-2',
          nodeName: 'SE-2',
          errors: {
            ports: { isError: false, value: 2 },
            corePorts: { isError: false, value: 0 },
            portTypes: {
              [EdgePortTypeEnum.WAN]: { isError: true, value: 1 },
              [EdgePortTypeEnum.CLUSTER]: { isError: true, value: 0 }
            }
          }
        }]
      } as CompatibilityCheckResult

      render(<CompatibilityStatusBar
        type={CompatibilityStatusEnum.FAIL}
        fields={lagCompatibilityFields}
        errors={checkResult.results}
      />)

      await userEvent.click(screen.getByRole('button', { name: 'See details' }))
      const drawer = await screen.findByRole('dialog')

      // eslint-disable-next-line testing-library/no-node-access
      const node1 = within(drawer).getByText('SE-1').closest('div.ant-card') as HTMLElement
      // eslint-disable-next-line testing-library/no-node-access
      const node2 = within(drawer).getByText('SE-2').closest('div.ant-card') as HTMLElement
      expect(within(node1).queryByRole('cell', { name: 'Number of LAGs 2' })).toBeValid()
      // eslint-disable-next-line max-len
      expect(within(node1).queryByRole('cell', { name: 'Number of Core Ports danger 1' })).toBeValid()
      expect(within(node1).queryByRole('cell', { name: 'Port Types danger CLUSTER' })).toBeValid()
      expect(within(node2).queryByRole('cell', { name: 'Number of LAGs 2' })).toBeValid()
      expect(within(node2).queryByRole('cell', { name: 'Number of Core Ports 0' })).toBeValid()
      expect(within(node2).queryByRole('cell', { name: 'Port Types danger WAN' })).toBeValid()
    })
  })
  describe('Port', () => {
    const portCompatibilityFields = getPortFormCompatibilityFields()

    it('should correctly display compatible error details', async () => {
      const checkResult = {
        isError: true,
        ports: true,
        corePorts: false,
        portTypes: true,
        results: [{
          nodeId: 'serialNumber-1',
          nodeName: 'SE-1',
          errors: {
            ports: { isError: true, value: 1 },
            corePorts: { isError: false, value: 0 },
            portTypes: {
              [EdgePortTypeEnum.LAN]: { isError: true, value: 0 }
            }
          }
        }, {
          nodeId: 'serialNumber-2',
          nodeName: 'SE-2',
          errors: {
            ports: { isError: true, value: 2 },
            corePorts: { isError: false, value: 0 },
            portTypes: {
              [EdgePortTypeEnum.LAN]: { isError: true, value: 1 }
            }
          }
        }]
      } as CompatibilityCheckResult

      render(<CompatibilityStatusBar
        type={CompatibilityStatusEnum.FAIL}
        fields={portCompatibilityFields}
        errors={checkResult.results}
      />)

      await userEvent.click(screen.getByRole('button', { name: 'See details' }))
      const drawer = await screen.findByRole('dialog')

      // eslint-disable-next-line testing-library/no-node-access
      const node1 = within(drawer).getByText('SE-1').closest('div.ant-card') as HTMLElement
      // eslint-disable-next-line testing-library/no-node-access
      const node2 = within(drawer).getByText('SE-2').closest('div.ant-card') as HTMLElement
      expect(within(node1).queryByRole('cell', { name: 'Number of Ports danger 1' })).toBeValid()
      expect(within(node1).queryByRole('cell', { name: 'Number of Core Ports 0' })).toBeValid()
      expect(within(node1).queryByRole('cell', { name: 'Port Types' })).toBeValid()
      expect(within(node2).queryByRole('cell', { name: 'Number of Ports danger 2' })).toBeValid()
      expect(within(node2).queryByRole('cell', { name: 'Number of Core Ports 0' })).toBeValid()
      expect(within(node2).queryByRole('cell', { name: 'Port Types danger LAN' })).toBeValid()
    })
  })
})

describe('interfaceNameComparator', () => {
  it('should correctly compare interface names', async () => {
    const ifNames = [
      'port1', 'port2',
      'port1.1', 'port1.2', 'port1.10',
      'port2.1',
      'lag1', 'lag2',
      'lag1.1', 'lag1.2', 'lag1.10',
      'lag2.1'
    ].map(name => ({ portName: name } as EdgePortInfo))

    ifNames.sort((port1, port2) => {
      return interfaceNameComparator(port1.portName, port2.portName)
    })

    expect(ifNames.map(item => item.portName)).toEqual([
      'lag1', 'lag1.1', 'lag1.2', 'lag1.10',
      'lag2', 'lag2.1',
      'port1', 'port1.1', 'port1.2', 'port1.10',
      'port2', 'port2.1'
    ])
  })
})

describe('data transformer', () => {
  const mockGivenData = _.cloneDeep(mockClusterConfigWizardData)

  // eslint-disable-next-line max-len
  const getExpectLags = (lagSettings: ClusterNetworkSettings['lagSettings']) =>
    _.cloneDeep(lagSettings)
      .map(item => ({
        ...item,
        lags: item.lags.map(lag => ({
          ...lag,
          corePortEnabled: lag.portType === EdgePortTypeEnum.WAN ? false : lag.corePortEnabled,
          natEnabled: lag.portType === EdgePortTypeEnum.WAN ? lag.natEnabled : false,
          ipMode: lag.portType === EdgePortTypeEnum.WAN ? lag.ipMode : EdgeIpModeEnum.STATIC,
          gateway: !lag.corePortEnabled && lag.portType === EdgePortTypeEnum.LAN ? '' : lag.gateway
        }))
      }))

  it('should transform data from form data to API data (AA)', () => {
    const mockData = _.cloneDeep(mockGivenData)

    // eslint-disable-next-line max-len
    mockData.portSettings[mockEdgeClusterList.data[0].edgeList[0].serialNumber]['port1'][0].corePortEnabled = true
    const result = transformFromFormToApiData(
      mockData as unknown as InterfaceSettingsFormType,
      ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE
    )

    const expectLags = getExpectLags(mockData.lagSettings)

    expect(result).toStrictEqual({
      lagSettings: expectLags,
      portSettings: Object.entries(mockData.portSettings).map(([serialNumber, ports]) => ({
        serialNumber,
        ports: Object.values(ports).flat().map(port =>
          ({
            ...port,
            corePortEnabled: port.portType === EdgePortTypeEnum.WAN ? false : port.corePortEnabled
          })
        )
      })),
      multiWanSettings: undefined
    })
  })

  it('should transform data from form data to API data (AB)', () => {
    const mockData = _.cloneDeep(mockGivenData)

    // eslint-disable-next-line max-len
    mockData.lagSettings[0].lags[0].portType = EdgePortTypeEnum.WAN
    mockData.lagSettings[0].lags[0].corePortEnabled = true
    const result = transformFromFormToApiData(
      mockData as unknown as InterfaceSettingsFormType,
      ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY
    )

    const expectLags = getExpectLags(mockData.lagSettings)

    expect(result).toStrictEqual({
      lagSettings: expectLags,
      portSettings: Object.entries(mockData.portSettings).map(([serialNumber, ports]) => ({
        serialNumber,
        ports: Object.values(ports).flat()
      })),
      multiWanSettings: undefined,
      virtualIpSettings: mockData.vipConfig?.map(item => {
        if(!Boolean(item.interfaces) || Object.keys(item.interfaces).length === 0) return undefined
        return {
          virtualIp: item.vip,
          timeoutSeconds: mockData.timeout,
          ports: item.interfaces
        }
      }).filter(item => Boolean(item))
    })
  })
})
