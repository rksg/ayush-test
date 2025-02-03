import { getIntl } from '@acx-ui/utils'

import { EdgeNokiaCageStateEnum, EdgeNokiaOltStatusEnum } from '../../models/EdgeNokiaOltEnum'

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