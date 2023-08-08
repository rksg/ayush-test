import { useIntl } from 'react-intl'

import { EdgeAlarmSummary, EdgeServiceStatusEnum, getEdgeServiceHealth } from '@acx-ui/rc/utils'

import { StatusLight } from '../StatusLight'

type EdgeServiceStatusLightProps = {
  data?: EdgeAlarmSummary[]
}

export const EdgeServiceStatusLight = (props: EdgeServiceStatusLightProps) => {

  const { $t } = useIntl()

  const EdgeServiceStatusLightConfig = {
    [EdgeServiceStatusEnum.UNKNOWN]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'Unknown' })
    },
    [EdgeServiceStatusEnum.REQUIRES_ATTENTION]: {
      color: 'var(--acx-accents-orange-50)',
      text: $t({ defaultMessage: 'Requires Attention' })
    },
    [EdgeServiceStatusEnum.GOOD]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'Good' })
    },
    [EdgeServiceStatusEnum.POOR]: {
      color: 'var(--acx-semantics-red-50)',
      text: $t({ defaultMessage: 'Poor' })
    }
  }

  return (
    <StatusLight
      config={EdgeServiceStatusLightConfig}
      data={getEdgeServiceHealth(props.data)}
    />
  )
}