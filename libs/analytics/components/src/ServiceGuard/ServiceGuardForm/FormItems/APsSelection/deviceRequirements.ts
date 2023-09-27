import { ClientType } from '../../../types'

export type ExcludedTargetAPType = {
  model: string,
  requiredAPFirmware?: string
}

export const deviceRequirements = {
  [ClientType.VirtualClient]: {
    requiredSZVersion: '5.2.1',
    requiredAPFirmware: null,
    excludedTargetAPs: [
      { model: '7781CM' },
      { model: 'C110' },
      { model: 'C500' },
      { model: 'P300' },
      { model: 'R310' },
      { model: 'R500' },
      { model: 'R500E' },
      { model: 'R600' },
      { model: 'R760', requiredAPFirmware: '6.1.1' },
      { model: 'T300' },
      { model: 'T300E' },
      { model: 'T301N' },
      { model: 'T301S' },
      { model: 'T504' },
      { model: 'T811-CM' }
    ]
  },
  [ClientType.VirtualWirelessClient]: {
    requiredSZVersion: '6.0',
    requiredAPFirmware: '6.0.0.0.3067',
    excludedTargetAPs: []
  }
}
