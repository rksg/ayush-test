import _ from 'lodash'

import { EdgeGeneralFixtures, EdgeIpModeEnum, EdgeLag, EdgePortTypeEnum } from '@acx-ui/rc/utils'

import { getTargetInterfaceFromInterfaceSettingsFormData, mockClusterConfigWizardData } from '../__tests__/fixtures'

import { InterfaceSettingsFormType }                               from './types'
import { interfaceCompatibilityCheck, lagSettingsCompatibleCheck } from './utils'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const nodeList = mockEdgeClusterList.data[0].edgeList
const node1SN = nodeList[0].serialNumber
const node2SN = nodeList[1].serialNumber
const mockNoLagData = _.cloneDeep(mockClusterConfigWizardData)
mockNoLagData.lagSettings = nodeList.map(item => ({
  serialNumber: item.serialNumber,
  lags: [] as EdgeLag[]
})) as InterfaceSettingsFormType['lagSettings']

describe('interface Compatibility Check', () => {
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
  const nodeList = mockEdgeClusterList.data[0].edgeList
  const node1SN = nodeList[0].serialNumber
  const node2SN = nodeList[1].serialNumber

  describe('success case', () => {
    it('when both node no lAG', async () => {
      const result = lagSettingsCompatibleCheck(mockNoLagData.lagSettings, nodeList)

      expect(result.isError).toBe(false)
      expect(result.portTypes).toBe(true)
      expect(result.corePorts).toBe(true)
      expect(result.ports).toBe(true)
    })

    it('when core LAG', async () => {
      const mockData = _.cloneDeep(mockClusterConfigWizardData.lagSettings)
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
  })

  describe('failed case', () => {
    it('when first node core LAG, second node WAN LAG', async () => {
      const mockData = _.cloneDeep(mockClusterConfigWizardData.lagSettings)
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