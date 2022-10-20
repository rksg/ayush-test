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
  { label: 'Channel Fly', value: 'CHANNELFLY' },
  { label: 'Background Scanning', value: 'BACKGROUND_SCANNING' }
]

export const txPowerAdjustmentOptions = [
  { label: 'Auto', value: 'Auto' },
  { label: 'Full', value: 'MAX' },
  { label: '-1dB', value: '-1' },
  { label: '-2dB', value: '-2' },
  { label: '-3dB(1/2)', value: '-3' },
  { label: '-4dB', value: '-4' },
  { label: '-5dB', value: '-5' },
  { label: '-6dB(1/4)', value: '-6' },
  { label: '-7dB', value: '-7' },
  { label: '-8dB', value: '-8' },
  { label: '-9dB(1/8)', value: '-9' },
  { label: '-10dB', value: '-10' },
  { label: 'Min', value: 'MIN' }
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