/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext } from 'react'

import { isEmpty }       from 'lodash'
import { defineMessage } from 'react-intl'

import { VenueExtended, VenueRadioCustomization } from '@acx-ui/rc/utils'

export enum RadioType {
  Normal24GHz = 'Normal24GHz',
  Normal5GHz= 'Normal5GHz',
  Normal6GHz= 'Normal6GHz',
  Lower5GHz = 'Lower5GHz',
  Upper5GHz= 'Upper5GHz'
}

export interface StateOfIsUseVenueSettings {
  isUseVenueSettings24G?: boolean
  isUseVenueSettings5G?: boolean
  isUseVenueSettings6G?: boolean
  isUseVenueSettingsLower5G?: boolean
  isUseVenueSettingsUpper5G?: boolean
}

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

export interface LPIButtonText {
  buttonText: JSX.Element,
  LPIModeOnChange: Function,
  LPIModeState: boolean,
  isAPOutdoor?: boolean
}

export interface FirmwareProps {
  firmware?: string
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

export const txPowerAdjustmentExtendedOptions = [
  { label: '-11dB', value: '-11' },
  { label: '-12dB', value: '-12' },
  { label: '-13dB', value: '-13' },
  { label: '-14dB', value: '-14' },
  { label: '-15dB', value: '-15' },
  { label: '-16dB', value: '-16' },
  { label: '-17dB', value: '-17' },
  { label: '-18dB', value: '-18' },
  { label: '-19dB', value: '-19' },
  { label: '-20dB', value: '-20' },
  { label: '-21dB', value: '-21' },
  { label: '-22dB', value: '-22' },
  { label: '-23dB', value: '-23' }
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

export const ApGroupRadioTypeDataKeyMap = {
  [RadioType.Normal24GHz]: ['radioParams24G'],
  [RadioType.Normal5GHz]: ['radioParams50G'],
  [RadioType.Normal6GHz]: ['radioParams6G'],
  [RadioType.Lower5GHz]: ['radioParamsDual5G', 'radioParamsLower5G'],
  [RadioType.Upper5GHz]: ['radioParamsDual5G', 'radioParamsUpper5G']
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

export const VenueRadioContext = createContext({} as {
  venue?: VenueExtended,
  venueRadio?: VenueRadioCustomization
})

export type BandwidthRadioOptions = {
  [ApRadioTypeEnum.Radio24G]: SelectItemOption[],
  [ApRadioTypeEnum.Radio5G]: SelectItemOption[],
  [ApRadioTypeEnum.Radio6G]: SelectItemOption[],
  [ApRadioTypeEnum.RadioLower5G]: SelectItemOption[],
  [ApRadioTypeEnum.RadioUpper5G]: SelectItemOption[]
}

export type SupportRadioChannels = {
  [ApRadioTypeEnum.Radio24G]: any,
  [ApRadioTypeEnum.Radio5G]: any,
  [ApRadioTypeEnum.Radio6G]: any,
  [ApRadioTypeEnum.RadioLower5G]: any,
  [ApRadioTypeEnum.RadioUpper5G]: any
}

export type SupportRadioDfsChannels = {
  [ApRadioTypeEnum.Radio24G]: undefined,
  [ApRadioTypeEnum.Radio5G]: any,
  [ApRadioTypeEnum.Radio6G]: undefined,
  [ApRadioTypeEnum.RadioLower5G]: any,
  [ApRadioTypeEnum.RadioUpper5G]: any
}

export const SupportRadioChannelsContext = createContext({} as {
  bandwidthRadioOptions: BandwidthRadioOptions,
  supportRadioChannels: SupportRadioChannels,
  supportRadioDfsChannels?: SupportRadioDfsChannels
})

export const defaultIsUseVenueSettings = true

// eslint-disable-next-line max-len
export const isCurrentTabUseVenueSettings = (state: StateOfIsUseVenueSettings, radioType: RadioType): boolean => {
  switch (radioType) {
    case RadioType.Normal24GHz:
      return state.isUseVenueSettings24G ?? defaultIsUseVenueSettings
    case RadioType.Normal5GHz:
      return state.isUseVenueSettings5G ?? defaultIsUseVenueSettings
    case RadioType.Normal6GHz:
      return state.isUseVenueSettings6G ?? defaultIsUseVenueSettings
    case RadioType.Lower5GHz:
      return state.isUseVenueSettingsLower5G ?? defaultIsUseVenueSettings
    case RadioType.Upper5GHz:
      return state.isUseVenueSettingsUpper5G ?? defaultIsUseVenueSettings
    default:
      return defaultIsUseVenueSettings
  }
}

// eslint-disable-next-line max-len
export const toggleState = (state: StateOfIsUseVenueSettings, radioType: RadioType): StateOfIsUseVenueSettings => {
  switch (radioType) {
    case RadioType.Normal24GHz:
      return { ...state, isUseVenueSettings24G: !state.isUseVenueSettings24G }
    case RadioType.Normal5GHz:
      return { ...state, isUseVenueSettings5G: !state.isUseVenueSettings5G }
    case RadioType.Normal6GHz:
      return { ...state, isUseVenueSettings6G: !state.isUseVenueSettings6G }
    case RadioType.Lower5GHz:
      return { ...state, isUseVenueSettingsLower5G: !state.isUseVenueSettingsLower5G }
    case RadioType.Upper5GHz:
      return { ...state, isUseVenueSettingsUpper5G: !state.isUseVenueSettingsUpper5G }
    default:
      return { ...state }
  }
}

export const getRadioTypeDisplayName = (radioType: RadioType) => {
  switch (radioType) {
    case RadioType.Normal24GHz:
      return '2.4 GHz'
    case RadioType.Normal5GHz:
      return '5 GHz'
    case RadioType.Normal6GHz:
      return '6 GHz'
    case RadioType.Lower5GHz:
      return 'Lower 5 GHz'
    case RadioType.Upper5GHz:
      return 'Upper 5 GHz'
    default:
      return ''
  }
}
