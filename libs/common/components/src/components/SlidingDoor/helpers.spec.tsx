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
      type: 'Device'
    }
  ]
}

describe('Helper Functions', () => {
  describe('searchTree', () => {
    it('should return an array containing the nodes that match the search text', () => {
      const results = searchTree(rootNode, 'child')
      expect(results.length).toBe(2)
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
  })

  describe('customCapitalize', () => {
    it('should capitalize and format the node name and type correctly', () => {
      const node: Node = { name: 'example', type: 'Device' }
      expect(customCapitalize(node)).toBe('Example (Device)')
    })

    it('should only capitalize the name if the type is "network"', () => {
      const node: Node = { name: 'example', type: 'Network' }
      expect(customCapitalize(node)).toBe('Example')
    })

    it('should return an empty string if the node is null or undefined', () => {
      expect(customCapitalize(null)).toBe('')
      expect(customCapitalize(undefined)).toBe('')
    })
  })
})