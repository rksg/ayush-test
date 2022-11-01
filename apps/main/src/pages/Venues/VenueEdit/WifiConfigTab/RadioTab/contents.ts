import { defineMessage } from 'react-intl'

export interface AvailableLteBandOptions {
	value: string,
	label: string
}

export interface ChannelBars {
  dfsChannels: string[],
  lower5GChannels: string[],
  upper5GChannels: string[]
}

export const channelSelectionMethodsOptions = [
  { label: defineMessage({ defaultMessage: 'Channel Fly' }), value: 'CHANNELFLY' },
  { label: defineMessage({ defaultMessage: 'Background Scanning' }), value: 'BACKGROUND_SCANNING' }
]

export const txPowerAdjustmentOptions = [
  { label: defineMessage({ defaultMessage: 'Auto' }), value: 'Auto' },
  { label: defineMessage({ defaultMessage: 'Full' }), value: 'MAX' },
  { label: defineMessage({ defaultMessage: '-1dB' }), value: '-1' },
  { label: defineMessage({ defaultMessage: '-2dB' }), value: '-2' },
  { label: defineMessage({ defaultMessage: '-3dB(1/2)' }), value: '-3' },
  { label: defineMessage({ defaultMessage: '-4dB' }), value: '-4' },
  { label: defineMessage({ defaultMessage: '-5dB' }), value: '-5' },
  { label: defineMessage({ defaultMessage: '-6dB(1/4)' }), value: '-6' },
  { label: defineMessage({ defaultMessage: '-7dB' }), value: '-7' },
  { label: defineMessage({ defaultMessage: '-8dB' }), value: '-8' },
  { label: defineMessage({ defaultMessage: '-9dB(1/8)' }), value: '-9' },
  { label: defineMessage({ defaultMessage: '-10dB' }), value: '-10' },
  { label: defineMessage({ defaultMessage: 'Min' }), value: 'MIN' }
]

export function split5GChannels (radio5GChannels: string[]) {
  const lower5GChannels: string[] = []
  const upper5GChannels: string[] = []
  radio5GChannels.forEach( (ch: string) => {
    if (parseInt(ch, 10) < 100) {
      lower5GChannels.push(ch)
    } else {
      upper5GChannels.push(ch)
    }
  })

  return { lower5GChannels, upper5GChannels }
}