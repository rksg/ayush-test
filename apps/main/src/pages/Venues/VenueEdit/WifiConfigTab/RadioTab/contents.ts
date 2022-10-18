
export interface AvailableLteBandOptions {
	value: string,
	label: string
}

export const channelSelectionMethodsOptions = [
  { label: 'Channel Fly', value: 'CHANNELFLY' },
  { label: 'Background Scanning', value: 'BACKGROUND_SCANNING' }
]

export const channelBandwidth24GOptions = [
  { label: 'Auto', value: 'AUTO' },
  { label: '20 MHz', value: '20MHz' },
  { label: '40 MHz', value: '40MHz' }
]

export const channelBandwidth50GOptions = [
  { label: 'Auto', value: 'AUTO' },
  { label: '20 MHz', value: '20MHz' },
  { label: '40 MHz', value: '40MHz' },
  { label: '80 MHz', value: '80MHz' },
  { label: '160 MHz', value: '160MHz' }
]

export const channelBandwidth6GOptions = [
  { label: 'Auto', value: 'AUTO' },
  { label: '20 MHz', value: '20MHz' },
  { label: '40 MHz', value: '40MHz' },
  { label: '80 MHz', value: '80MHz' },
  { label: '160 MHz', value: '160MHz' }
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
