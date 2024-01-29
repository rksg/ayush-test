import { UpgradableApModelsAndFamilies, getRemainingApModels } from './useApEolFirmware'

describe('getRemainingApModels', () => {
  it('No upgradable models, should return initial models', () => {
    const initialModels = ['R750', 'R760']
    const result = getRemainingApModels('ABF2-3R', initialModels)
    expect(result).toEqual(initialModels)
  })

  it('The ABF not in the mapping object, should return initial models', () => {
    const initialModels = ['R750', 'R760']
    const upgradableModels: UpgradableApModelsAndFamilies = {
      'ABF2-3R': {
        familyNames: ['Wi-Fi 6'],
        apModels: ['R650'],
        sequence: 2
      }
    }

    const result = getRemainingApModels('ABFXXX', initialModels, upgradableModels)
    expect(result).toEqual(initialModels)
  })

  it('The ABF without sequence information should return empty array', () => {
    const initialModels = ['R750', 'R760']
    const upgradableModels: UpgradableApModelsAndFamilies = {
      'active': {
        familyNames: ['Wi-Fi 7'],
        apModels: ['R770']
      },
      'ABF2-3R': {
        familyNames: ['Wi-Fi 6'],
        apModels: ['R750', 'R760'],
        sequence: 2
      }
    }

    const result = getRemainingApModels('active', initialModels, upgradableModels)
    expect(result).toEqual([])
  })

  it('The ABF with smaller sequence information should return remaining models', () => {
    const initialModels = ['R500', 'R600', 'R750']
    const upgradableModels: UpgradableApModelsAndFamilies = {
      'ABF2-3R': {
        familyNames: ['Wi-Fi 6'],
        apModels: ['R750', 'R760'],
        sequence: 2
      },
      'eol-ap-2022-12': {
        familyNames: ['11ac wave 1', 'Wi-Fi 6'],
        apModels: ['R500', 'R600', 'R750'],
        sequence: 1
      }
    }

    const result = getRemainingApModels('eol-ap-2022-12', initialModels, upgradableModels)
    expect(result).toEqual(['R500', 'R600'])
  })

  it('The ABF with higher sequence information should return initial models', () => {
    const initialModels = ['R500', 'R600', 'R750']
    const upgradableModels: UpgradableApModelsAndFamilies = {
      'ABF2-3R': {
        familyNames: ['Wi-Fi 6'],
        apModels: ['R750', 'R760'],
        sequence: 2
      },
      'eol-ap-2022-12': {
        familyNames: ['11ac wave 1', 'Wi-Fi 6'],
        apModels: ['R500', 'R600', 'R750'],
        sequence: 1
      }
    }

    const result = getRemainingApModels('ABF2-3R', initialModels, upgradableModels)
    expect(result).toEqual(initialModels)
  })
})
