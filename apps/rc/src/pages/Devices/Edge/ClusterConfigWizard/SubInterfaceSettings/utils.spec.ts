import _ from 'lodash'

import { EdgePortInfo, EdgeStatus } from '@acx-ui/rc/utils'

import {
  mockClusterSubInterfaceSettings,
  mockSubInterfaceSettingsFormType
} from '../__tests__/fixtures'

import { getInterfaceNameMap, subInterfaceCompatibleCheck, transformFromApiToFormData } from './utils'

describe('Utils test', () => {
  describe('API & Form Type Transformation', () => {

    it('transformFromApiToFormData', () => {
      const result = transformFromApiToFormData(mockClusterSubInterfaceSettings)
      expect(result).toEqual(mockSubInterfaceSettingsFormType)
    })

    it('transformFromFormDataToApi', () => {
      const result = transformFromApiToFormData(mockClusterSubInterfaceSettings)
      expect(result).toEqual(mockSubInterfaceSettingsFormType)
    })

    it('transformFromApiToFormData should include node structure given empty port/lag list', () => {
      const mockData = {
        nodes: [
          {
            serialNumber: '96000076DCCAA42E87785B549A64997E72',
            ports: [],
            lags: []
          }
        ]
      }

      const result = transformFromApiToFormData(mockData)

      expect(result).toEqual({
        portSubInterfaces: {
          '96000076DCCAA42E87785B549A64997E72': {}
        },
        lagSubInterfaces: {
          '96000076DCCAA42E87785B549A64997E72': {}
        }
      })
    })
  })

  describe('Sub-interface Compatibility', () => {

    it('test getInterfaceNameMap()', () => {
      const result = getInterfaceNameMap(
        {
          edge1: [
            generatePort('1e7f81ab-9bb7-4db7-ae20-000000000000', 'port1', false),
            generatePort('1e7f81ab-9bb7-4db7-ae20-000000000001', 'port2', true)
          ],
          edge2: [
            generatePort('1e7f81ab-9bb7-4db7-ae20-000000000002', 'port1', false),
            generatePort('1e7f81ab-9bb7-4db7-ae20-000000000003', 'port2', false),
            generatePort('1e7f81ab-9bb7-4db7-ae20-000000000004', 'port3', false)
          ]
        },
        {
          edge1: [generateLag('0', 'LAG0'), generateLag('1', 'LAG1')],
          edge2: [generateLag('0', 'LAG0')]
        }
      )

      expect(result).toEqual({
        '1e7f81ab-9bb7-4db7-ae20-000000000000': 'port1',
        '1e7f81ab-9bb7-4db7-ae20-000000000002': 'port1',
        '1e7f81ab-9bb7-4db7-ae20-000000000003': 'port2',
        '1e7f81ab-9bb7-4db7-ae20-000000000004': 'port3',
        '0': 'LAG0',
        '1': 'LAG1'
      })
    })

    it('test subInterfaceCompatibleCheck pass', () => {
      const result = subInterfaceCompatibleCheck(
        mockSubInterfaceSettingsFormType.portSubInterfaces,
        mockSubInterfaceSettingsFormType.lagSubInterfaces,
        [
        {
          serialNumber: '96000076DCCAA42E87785B549A64997E72',
          name: 'edge1'
        } as EdgeStatus,
        {
          serialNumber: '96000036D1099D0C32121B82EB7786AC26',
          name: 'edge2'
        } as EdgeStatus
        ]
      )

      expect(result.isError).toBeFalsy()
      expect(result.results).toHaveLength(2)

      expect(result.results[0].nodeId).toEqual('96000076DCCAA42E87785B549A64997E72')
      expect(result.results[0].nodeName).toEqual('edge1')
      expect(result.results[0].errors.totalSubInterfaceCount.value).toEqual(2)
      expect(result.results[0].errors.totalSubInterfaceCount.isError).toBeFalsy()

      expect(result.results[1].nodeId).toEqual('96000036D1099D0C32121B82EB7786AC26')
      expect(result.results[1].nodeName).toEqual('edge2')
      expect(result.results[1].errors.totalSubInterfaceCount.value).toEqual(2)
      expect(result.results[1].errors.totalSubInterfaceCount.isError).toBeFalsy()
    })

    it('test subInterfaceCompatibleCheck mismatch', () => {
      const mockPortSubInterface = _.cloneDeep(mockSubInterfaceSettingsFormType.portSubInterfaces)
      mockPortSubInterface[
        '96000076DCCAA42E87785B549A64997E72'
      ]['29445906-158a-4535-8e1e-5d4852d064c6'] = []

      const result = subInterfaceCompatibleCheck(
        mockPortSubInterface,
        mockSubInterfaceSettingsFormType.lagSubInterfaces,
        [
        {
          serialNumber: '96000076DCCAA42E87785B549A64997E72',
          name: 'edge1'
        } as EdgeStatus,
        {
          serialNumber: '96000036D1099D0C32121B82EB7786AC26',
          name: 'edge2'
        } as EdgeStatus
        ]
      )

      expect(result.isError).toBeTruthy()
      expect(result.results).toHaveLength(2)

      expect(result.results[0].nodeId).toEqual('96000076DCCAA42E87785B549A64997E72')
      expect(result.results[0].nodeName).toEqual('edge1')
      expect(result.results[0].errors.totalSubInterfaceCount.value).toEqual(1)
      expect(result.results[0].errors.totalSubInterfaceCount.isError).toBeTruthy()

      expect(result.results[1].nodeId).toEqual('96000036D1099D0C32121B82EB7786AC26')
      expect(result.results[1].nodeName).toEqual('edge2')
      expect(result.results[1].errors.totalSubInterfaceCount.value).toEqual(2)
      expect(result.results[1].errors.totalSubInterfaceCount.isError).toBeTruthy()
    })

    const generatePort = (id: string, portName: string, isLagMember: boolean) => ({
      id,
      portName,
      isLagMember
    } as EdgePortInfo)

    const generateLag = (id: string, portName: string) => ({
      id,
      portName
    } as EdgePortInfo)
  })
})
