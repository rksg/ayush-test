import { isEmpty }       from 'lodash'
import { defineMessage } from 'react-intl'

export interface SelectItemOption {
	value: string,
	label: string
}

export interface RadioChannel {
  value: string;
  selected: boolean;
}

export interface ChannelBars {
  dfsChannels: string[],
  lower5GChannels: string[],
  upper5GChannels: string[]
}

export const channelSelectionMethodsOptions = [
  { label: defineMessage({ defaultMessage: 'ChannelFly' }), value: 'CHANNELFLY' },
  { label: defineMessage({ defaultMessage: 'Background Scanning' }), value: 'BACKGROUND_SCANNING' }
]

export const apChannelSelectionMethodsOptions = channelSelectionMethodsOptions.concat([
  { label: defineMessage({ defaultMessage: 'Manual channel selection' }), value: 'MANUAL' }
])

export const apChannelSelectionMethods6GOptions = [
  { label: defineMessage({ defaultMessage: 'ChannelFly' }), value: 'CHANNELFLY' },
  { label: defineMessage({ defaultMessage: 'Manual channel selection' }), value: 'MANUAL' }
]

export const channelBandwidth24GOptions = [
  { label: 'Auto', value: 'AUTO' },
  { label: '20 MHz', value: '20MHz' },
  { label: '40 MHz', value: '40MHz' }
]

export const channelBandwidth5GOptions = channelBandwidth24GOptions.concat([
  { label: '80 MHz', value: '80MHz' },
  { label: '160 MHz', value: '160MHz' }
])

export const channelBandwidth6GOptions = [
  ...channelBandwidth5GOptions,
  { label: '320 MHz', value: '320MHz' }
]

export const txPowerAdjustment6GOptions = [
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

export const txPowerAdjustmentOptions = [
  { label: 'Auto', value: 'Auto' },
  ...txPowerAdjustment6GOptions
]

export const bssMinRate6GOptions = [
  { label: 'HE MCS 0', value: 'HE_MCS_0' },
  { label: 'HE MCS 1', value: 'HE_MCS_1' },
  { label: 'HE MCS 2', value: 'HE_MCS_2' },
  { label: 'HE MCS 3', value: 'HE_MCS_3' }
]

export const mgmtTxRate6GOptions = [
  { label: '6 Mbps', value: '6' },
  { label: '9 Mbps', value: '9' },
  { label: '12 Mbps', value: '12' },
  { label: '18 Mbps', value: '18' },
  { label: '24 Mbps', value: '24' }
]

export interface RadioParams {
  channelBandwidth: string,
	method: string,
	changeInterval: number,
	scanInterval: number,
	txPower: string,
  bssMinRate6G?: string,
	mgmtTxRate6G?: string
}

export enum ApRadioTypeEnum {
  Radio24G = '24G',
  Radio5G = '5G',
  Radio6G = '6G',
  RadioLower5G = 'lower5G',
  RadioUpper5G = 'upper5G'
}

export const VenueRadioTypeDataKeyMap = {
  [ApRadioTypeEnum.Radio24G]: ['radioParams24G'],
  [ApRadioTypeEnum.Radio5G]: ['radioParams50G'],
  [ApRadioTypeEnum.Radio6G]: ['radioParams6G'],
  [ApRadioTypeEnum.RadioLower5G]: ['radioParamsDual5G', 'radioParamsLower5G'],
  [ApRadioTypeEnum.RadioUpper5G]: ['radioParamsDual5G', 'radioParamsUpper5G']
}

export const ApRadioTypeDataKeyMap = {
  [ApRadioTypeEnum.Radio24G]: ['apRadioParams24G'],
  [ApRadioTypeEnum.Radio5G]: ['apRadioParams50G'],
  [ApRadioTypeEnum.Radio6G]: ['apRadioParams6G'],
  [ApRadioTypeEnum.RadioLower5G]: ['apRadioParamsDual5G', 'radioParamsLower5G'],
  [ApRadioTypeEnum.RadioUpper5G]: ['apRadioParamsDual5G', 'radioParamsUpper5G']
}

export function split5GChannels (radio5GChannels: string[]) {
  const lower5GChannels: string[] = []
  const upper5GChannels: string[] = []

  if (!isEmpty(radio5GChannels)) {
    radio5GChannels.forEach( (ch: string) => {
      if (parseInt(ch, 10) < 100) {
        lower5GChannels.push(ch)
      } else {
        upper5GChannels.push(ch)
      }
    })
  }

  return { lower5GChannels, upper5GChannels }
}
