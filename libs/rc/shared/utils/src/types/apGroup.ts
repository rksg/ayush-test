import { BandModeEnum } from '../models'

export interface ApGroupApModelBandModeSettings {
  model: string,
  bandMode: BandModeEnum
}

export interface ApGroupDefaultRegulatoryChannels {
  '2.4GChannels': {
    [key: string]: string[]
  },
  '5GChannels': {
    dfs: {
      [key: string]: string[]
    },
    indoor: {
      [key: string]: string[]
    },
    outdoor: {
      [key: string]: string[]
    }
  },
  '5GLowerChannels': {
    dfs: {
      [key: string]: string[]
    },
    indoor: {
      [key: string]: string[]
    },
    outdoor: {
      [key: string]: string[]
    }
  },
  '5GUpperChannels': {
    dfs: {
      [key: string]: string[]
    },
    indoor: {
      [key: string]: string[]
    },
    outdoor: {
      [key: string]: string[]
    }
  },
  '6GChannels': {
    [key: string]: string[]
  } | {
    indoor: {
      [key: string]: string[]
    },
    outdoor: {
      [key: string]: string[]
    }
  },
  'afcEnabled': boolean
}
