import { searchTree, findMatchingNode, customCapitalize } from './helpers'

import { Node } from '.'

const rootNode: Node = {
  id: '1',
  name: 'Root',
  type: 'Network',
  children: [
    {
      id: '2',
      name: 'Child1',
      type: 'Device'
    },
    {
      id: '3',
      name: 'Child2',
      type: 'Device',
      mac: 'mac'
    }
  ]
}

describe('Helper Functions', () => {
  describe('searchTree', () => {
    it('should return an array containing the nodes that match the search text', () => {
      const results = searchTree(rootNode, 'child')
      const macResults = searchTree(rootNode, 'mac')
      expect(results.length).toBe(2)
      expect(macResults.length).toBe(1)
    })

    it('should return an empty array if no node matches the search text', () => {
      const results = searchTree(rootNode, 'xyz')
      expect(results.length).toBe(0)
    })
  })

  describe('findMatchingNode', () => {
    it('should find a matching node based on name and type', () => {
      const targetNode = { name: 'Child1', type: 'Device' }
      const result = findMatchingNode(rootNode, targetNode)
      expect(result?.name).toBe('Child1')
      expect(result?.type).toBe('Device')
    })

    it('should return null if no matching node is found', () => {
      const targetNode = { name: 'NotExists', type: 'Unknown' }
      const result = findMatchingNode(rootNode, targetNode)
      expect(result).toBeNull()
    })

    it('should find a matching node based on name, type & mac address', () => {
      const mock: Node = {
        id: '1',
        name: 'Root',
        type: 'Network',
        children: [
          {
            id: '3',
            name: 'ap',
            type: 'ap',
            mac: '1'
          },
          {
            id: '3',
            name: 'switch',
            type: 'switch',
            mac: '2'
          }
        ]
      }
      const targetNode1 = { name: 'switch', type: 'switch', list: ['2'] }
      const targetNode2 = { name: 'ap', type: 'ap',list: ['1'] }
      const result1 = findMatchingNode(mock, targetNode1)
      expect(result1?.name).toBe('switch')
      expect(result1?.type).toBe('switch')
      const result2 = findMatchingNode(mock, targetNode2)
      expect(result2?.name).toBe('ap')
      expect(result2?.type).toBe('ap')
    })
  })

  describe('customCapitalize', () => {
    it('should capitalize and format the node name and type correctly', () => {
      const node: Node = { name: 'example', type: 'Device' }
      expect(customCapitalize(node)).toBe('Example (Device)')
    })

    it('should return an empty string if the node is null or undefined', () => {
      expect(customCapitalize(null)).toBe('')
      expect(customCapitalize(undefined)).toBe('')
    })
  })
})