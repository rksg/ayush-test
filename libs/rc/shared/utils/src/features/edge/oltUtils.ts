import { find }          from 'lodash'
import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import { EdgeNokiaCageStateEnum, EdgeNokiaOltStatusEnum } from '../../models/EdgeNokiaOltEnum'
import { EdgeNokiaOltData }                               from '../../types/edgeOlt'

export const OLT_PSE_SUPPLIED_POWER = 50 // PSE: Power Sourcing Equipment
export const oltLineCardOptions = [
  { label: 'PON LC 1', value: 'S1' },
  { label: 'PON LC 2', value: 'S2' }
]

// OLT SN: line card SN
export const oltLineCardSerailNumberMap = {
  FH2302A073A: 'YP2306F4B2D',
  FH2302A077C: 'YP2306F4B76'
}

export const oltCageCannedSpeeds = [1, 10, 25] // GB

export const getOltStatusConfig = () => {
  const { $t } = getIntl()

  return {
    [EdgeNokiaOltStatusEnum.ONLINE]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'ONLINE' })
    },
    [EdgeNokiaOltStatusEnum.OFFLINE]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'OFFLINE' })
    },
    [EdgeNokiaOltStatusEnum.UNKNOWN]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'UNKNOWN' })
    }
  }
}

/**
 * Maps Nokia OLT cage status to colors and translatable text.
 * @returns an object mapping the status to colors and text.
 */
export const getCageStatusConfig = () => {
  const { $t } = getIntl()

  return {
    [EdgeNokiaCageStateEnum.UP]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'UP' })
    },
    [EdgeNokiaCageStateEnum.DOWN]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'DOWN' })
    }
  }
}

export const getOnuPortStatusConfig = () => {
  const { $t } = getIntl()

  return {
    [EdgeNokiaCageStateEnum.UP]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'UP' })
    },
    [EdgeNokiaCageStateEnum.DOWN]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'DOWN' })
    }
  }
}


const oltPoeClassOptions = [
  { label: defineMessage({ defaultMessage: 'Negotiate' }), value: '' },
  { label: defineMessage({ defaultMessage: '0 (802.3af 15.4 W)' }), value: '0' },
  { label: defineMessage({ defaultMessage: '1 (802.3af 4.0 W)' }), value: '1' },
  { label: defineMessage({ defaultMessage: '2 (802.3af 7.0 W)' }), value: '2' },
  { label: defineMessage({ defaultMessage: '3 (802.3af 15.4 W)' }), value: '3' },
  { label: defineMessage({ defaultMessage: '4 (802.3at 30 W)' }), value: '4' },
  { label: defineMessage({ defaultMessage: '5 (802.3bt 45 W)' }), value: '5' },
  { label: defineMessage({ defaultMessage: '6 (802.3bt 60 W)' }), value: '6' },
  { label: defineMessage({ defaultMessage: '7 (802.3bt 75 W)' }), value: '7' },
  { label: defineMessage({ defaultMessage: '8 (802.3bt 90 W)' }), value: '8' }
]

export const getOltPoeClassText = (poeClass: string): string => {
  const { $t } = getIntl()
  const msgDescriptor = find(oltPoeClassOptions, { value: poeClass })?.label
  return msgDescriptor ? $t(msgDescriptor) : ''
}

export const isOltValidSerialNumber = (serialNumber: string): boolean => !!serialNumber
export const isOltOnline = (oltData: EdgeNokiaOltData) =>
  oltData.status === EdgeNokiaOltStatusEnum.ONLINE
