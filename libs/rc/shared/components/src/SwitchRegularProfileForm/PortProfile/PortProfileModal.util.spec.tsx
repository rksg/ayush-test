import { PortProfileAPI, PortProfileUI } from '@acx-ui/rc/utils'

import { portProfilesUIParser, portProfilesAPIParser } from './PortProfileModal.utils'

describe('PortProfileModal.utils', () => {
  describe('portProfilesUIParser', () => {
    it('should correctly group port profiles by models', () => {
      const input: PortProfileAPI[] = [
        { id: '1', models: ['A', 'B'], portProfileId: 'profile1' },
        { id: '2', models: ['B', 'A'], portProfileId: 'profile2' },
        { id: '3', models: ['C'], portProfileId: 'profile3' },
        { id: '4', models: ['A', 'B'], portProfileId: 'profile4' }
      ]

      const result = portProfilesUIParser(input)

      expect(result).toEqual([
        {
          id: '1',
          models: ['A', 'B'],
          portProfileId: ['profile1', 'profile2', 'profile4']
        },
        {
          id: '3',
          models: ['C'],
          portProfileId: ['profile3']
        }
      ])
    })

    it('should handle empty input', () => {
      const input: PortProfileAPI[] = []
      const result = portProfilesUIParser(input)
      expect(result).toEqual([])
    })
  })

  describe('portProfilesAPIParser', () => {
    it('should correctly parse PortProfileUI to PortProfileAPI[]', () => {
      const input: PortProfileUI = {
        id: '1',
        models: ['A', 'B'],
        portProfileId: ['profile1', 'profile2']
      }

      const result = portProfilesAPIParser(input)

      expect(result).toEqual([
        { id: '1', models: ['A', 'B'], portProfileId: 'profile1' },
        { id: '1', models: ['A', 'B'], portProfileId: 'profile2' }
      ])
    })

    it('should handle empty portProfileId array', () => {
      const input: PortProfileUI = {
        id: '1',
        models: ['A', 'B'],
        portProfileId: []
      }

      const result = portProfilesAPIParser(input)

      expect(result).toEqual([])
    })
  })
})